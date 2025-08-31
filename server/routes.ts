import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import cors from "cors";
import Komiku from "./services/komiku-scraper";

const komiku = new Komiku();

// Rate limiting middleware
const createRateLimit = (windowMs: number, max: number, message: string) => 
  rateLimit({
    windowMs,
    max,
    message: {
      status: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
        details: "Please wait before making more requests"
      },
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Different rate limits for different endpoints
const generalLimit = createRateLimit(60 * 1000, 120, "Too many requests per minute"); // 120 per minute
const searchLimit = createRateLimit(60 * 1000, 60, "Too many search requests per minute"); // 60 per minute
const chapterLimit = createRateLimit(60 * 1000, 40, "Too many chapter requests per minute"); // 40 per minute

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(100, "Search query too long"),
});

const detailQuerySchema = z.object({
  url: z.string().url("Valid URL is required"),
});

const chapterQuerySchema = z.object({
  url: z.string().url("Valid URL is required"),
});

const popularQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

const genreParamsSchema = z.object({
  genre: z.string().min(1, "Genre is required"),
});

const genreQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
});

// Cache helper
async function getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>, ttlMinutes: number = 30): Promise<T> {
  const cached = await storage.getCacheItem(cacheKey);
  if (cached) {
    return cached.data as T;
  }

  const data = await fetchFn();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);
  
  await storage.setCacheItem({
    cacheKey,
    data: data as any,
    expiresAt,
  });

  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // API routes
  app.use("/api", generalLimit);

  // Search manga
  app.get("/api/search", searchLimit, async (req, res) => {
    try {
      const { q } = searchQuerySchema.parse(req.query);
      const cacheKey = `search:${q.toLowerCase()}`;
      
      const results = await getCachedOrFetch(cacheKey, () => komiku.search(q), 60); // Cache for 1 hour
      
      res.json({
        status: true,
        data: results,
        message: "Search completed successfully"
      });
    } catch (error) {
      console.error("Search error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: error.errors[0].message,
            details: "Check your search query parameter"
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "SEARCH_FAILED",
            message: "Failed to search manga",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Get manga detail
  app.get("/api/detail", async (req, res) => {
    try {
      const { url } = detailQuerySchema.parse(req.query);
      const cacheKey = `detail:${url}`;
      
      const result = await getCachedOrFetch(cacheKey, () => komiku.detail(url), 120); // Cache for 2 hours
      
      res.json({
        status: true,
        data: result,
        message: "Detail retrieved successfully"
      });
    } catch (error) {
      console.error("Detail error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: error.errors[0].message,
            details: "Check your URL parameter"
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "DETAIL_FAILED",
            message: "Failed to get manga details",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Get chapter content
  app.get("/api/chapter", chapterLimit, async (req, res) => {
    try {
      const { url } = chapterQuerySchema.parse(req.query);
      const cacheKey = `chapter:${url}`;
      
      const result = await getCachedOrFetch(cacheKey, () => komiku.chapter(url), 180); // Cache for 3 hours
      
      res.json({
        status: true,
        data: result,
        message: "Chapter content retrieved successfully"
      });
    } catch (error) {
      console.error("Chapter error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: error.errors[0].message,
            details: "Check your URL parameter"
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "CHAPTER_FAILED",
            message: "Failed to get chapter content",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Get popular manga
  app.get("/api/popular", async (req, res) => {
    try {
      const { page } = popularQuerySchema.parse(req.query);
      
      if (page < 1) {
        return res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: "Page number must be greater than 0",
            details: "Provide a valid page number"
          },
          timestamp: new Date().toISOString()
        });
      }

      const cacheKey = `popular:${page}`;
      const results = await getCachedOrFetch(cacheKey, () => komiku.populer(page), 30); // Cache for 30 minutes
      
      res.json({
        status: true,
        data: results,
        message: "Popular manga retrieved successfully",
        pagination: {
          current_page: page,
          has_next: results.length > 0
        }
      });
    } catch (error) {
      console.error("Popular error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: error.errors[0].message,
            details: "Check your page parameter"
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "POPULAR_FAILED",
            message: "Failed to get popular manga",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Get manga by genre
  app.get("/api/genre/:genre", async (req, res) => {
    try {
      const { genre } = genreParamsSchema.parse(req.params);
      const { page } = genreQuerySchema.parse(req.query);

      if (page < 1) {
        return res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: "Page number must be greater than 0",
            details: "Provide a valid page number"
          },
          timestamp: new Date().toISOString()
        });
      }

      const cacheKey = `genre:${genre}:${page}`;
      const results = await getCachedOrFetch(cacheKey, () => komiku.genre(genre, page), 60); // Cache for 1 hour
      
      // Handle invalid genre response
      if (typeof results === 'object' && 'status' in results && results.status === false) {
        return res.status(400).json({
          status: false,
          error: {
            code: "INVALID_GENRE",
            message: results.message,
            details: `Available genres: ${results.available_genres?.join(', ')}`
          },
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        status: true,
        data: results,
        message: `Manga for genre '${genre}' retrieved successfully`,
        pagination: {
          current_page: page,
          genre: genre,
          has_next: Array.isArray(results) && results.length > 0
        }
      });
    } catch (error) {
      console.error("Genre error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: false,
          error: {
            code: "INVALID_PARAMETER",
            message: error.errors[0].message,
            details: "Check your genre and page parameters"
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "GENRE_FAILED",
            message: "Failed to get manga by genre",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // API info endpoint
  app.get("/api", (req, res) => {
    res.json({
      status: true,
      message: "Resamanga API - Personal Manga Scraper",
      version: "1.0.0",
      endpoints: {
        search: "GET /api/search?q={query}",
        detail: "GET /api/detail?url={manga_url}",
        chapter: "GET /api/chapter?url={chapter_url}",
        popular: "GET /api/popular?page={page_number}",
        genre: "GET /api/genre/{genre}?page={page_number}"
      },
      rate_limits: {
        general: "120 requests per minute",
        search: "60 requests per minute", 
        chapter: "40 requests per minute"
      },
      available_genres: [
        "action", "adult", "adventure", "comedy", "cooking", "crime", "demons",
        "drama", "ecchi", "fantasy", "game", "gender-bender", "ghosts", "gore",
        "harem", "historical", "horror", "isekai", "josei", "magic", "manga",
        "martial-arts", "mature", "mecha", "medical", "military", "monsters",
        "music", "mystery", "one-shot", "police", "psychological",
        "reincarnation", "romance", "school", "school-life", "sci-fi", "seinen",
        "shoujo", "shoujo-ai", "shounen", "shounen-ai", "slice-of-life", "sport",
        "sports", "super-power", "supernatural", "thriller", "tragedy",
        "villainess", "yuri"
      ],
      documentation: "Visit / for full API documentation"
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: true,
      message: "API is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
