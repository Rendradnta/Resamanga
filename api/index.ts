import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import Komiku from '../server/services/komiku-scraper.js';

const app = express();
const komiku = new Komiku();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

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

// Simple in-memory cache for Vercel
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>, ttlMinutes: number = 30): Promise<T> {
  const now = Date.now();
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.data as T);
  }

  return fetchFn().then(data => {
    cache.set(cacheKey, {
      data,
      expiresAt: now + (ttlMinutes * 60 * 1000)
    });
    return data;
  });
}

// Clean expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Search manga
app.get("/search", async (req, res) => {
  try {
    const { q } = searchQuerySchema.parse(req.query);
    const cacheKey = `search:${q.toLowerCase()}`;
    
    const results = await getCachedOrFetch(cacheKey, () => komiku.search(q), 60);
    
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
app.get("/detail", async (req, res) => {
  try {
    const { url } = detailQuerySchema.parse(req.query);
    const cacheKey = `detail:${url}`;
    
    const result = await getCachedOrFetch(cacheKey, () => komiku.detail(url), 120);
    
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
app.get("/chapter", async (req, res) => {
  try {
    const { url } = chapterQuerySchema.parse(req.query);
    const cacheKey = `chapter:${url}`;
    
    const result = await getCachedOrFetch(cacheKey, () => komiku.chapter(url), 180);
    
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
app.get("/popular", async (req, res) => {
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
    const results = await getCachedOrFetch(cacheKey, () => komiku.populer(page), 30);
    
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
app.get("/genre/:genre", async (req, res) => {
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
    const results = await getCachedOrFetch(cacheKey, () => komiku.genre(genre, page), 60);
    
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
app.get("/", (req, res) => {
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
    info: "No rate limits applied for better compatibility"
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
    documentation: "Visit your domain for full API documentation"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Export the app for Vercel
export default app;