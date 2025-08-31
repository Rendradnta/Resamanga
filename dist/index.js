// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  cache;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.cache = /* @__PURE__ */ new Map();
    setInterval(() => {
      this.clearExpiredCache();
    }, 60 * 60 * 1e3);
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getCacheItem(key) {
    const item = this.cache.get(key);
    if (item && new Date(item.expiresAt) > /* @__PURE__ */ new Date()) {
      return item;
    }
    if (item) {
      this.cache.delete(key);
    }
    return void 0;
  }
  async setCacheItem(insertItem) {
    const id = randomUUID();
    const item = {
      ...insertItem,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.cache.set(insertItem.cacheKey, item);
    return item;
  }
  async clearExpiredCache() {
    const now = /* @__PURE__ */ new Date();
    for (const [key, item] of this.cache.entries()) {
      if (new Date(item.expiresAt) <= now) {
        this.cache.delete(key);
      }
    }
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";
import rateLimit from "express-rate-limit";
import cors from "cors";

// server/services/komiku-scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";
var Komiku = class {
  baseUrl;
  apiUrl;
  constructor() {
    this.baseUrl = "https://komiku.org";
    this.apiUrl = "https://api.komiku.org";
  }
  async #getDetailKomiku(url) {
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 1e4
      });
      const $ = cheerio.load(data);
      const img = $(".ims img").attr("src") || "";
      const genre = [];
      $(".genre a").each((i, el) => genre.push($(el).text().trim()));
      const firstDiv = $(".new1.sd.rd").first();
      const latestDiv = $(".new1.sd.rd").last();
      let first = null, latest = null;
      if (firstDiv.length) {
        let link = firstDiv.find("a").attr("href");
        if (link && !link.startsWith("http")) link = this.baseUrl + link;
        first = {
          title: firstDiv.find("a span").last().text().trim(),
          url: link || ""
        };
      }
      if (latestDiv.length) {
        let link = latestDiv.find("a").attr("href");
        if (link && !link.startsWith("http")) link = this.baseUrl + link;
        latest = {
          title: latestDiv.find("a span").last().text().trim(),
          url: link || ""
        };
      }
      return { img, genre, first, latest };
    } catch (error) {
      console.error("Error in getDetailKomiku:", error);
      return { img: "", genre: [], first: null, latest: null };
    }
  }
  async search(query) {
    try {
      const api = `${this.baseUrl}/wp-json/wp/v2/search?subtype=manga&search=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15e3
      });
      if (!data.length) return [];
      const results = [];
      for (const v of data) {
        if (!v.url.includes("/manga/")) continue;
        const fixedUrl = v.url.replace("secure.komikid.org", "komiku.org");
        const detail = await this.#getDetailKomiku(fixedUrl);
        results.push({
          id: v.id.toString(),
          title: v.title,
          url: fixedUrl,
          img: detail.img,
          genre: detail.genre,
          first: detail.first,
          latest: detail.latest
        });
      }
      return results;
    } catch (error) {
      console.error("Error in search:", error);
      throw new Error("Failed to search manga");
    }
  }
  async detail(url) {
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15e3
      });
      const $ = cheerio.load(data);
      const title = $('#Judul h1 span[itemprop="name"]').text().trim();
      const title_id = $("#Judul p.j2").text().trim();
      const description = $('#Judul p[itemprop="description"]').text().trim();
      const sinopsis = $("#Sinopsis p").text().trim();
      const ringkasan = [];
      $('#Sinopsis h3:contains("Ringkasan")').nextUntil("h2, h3").each((_, el) => {
        const text = $(el).text().trim();
        if (text) ringkasan.push(text);
      });
      const image = $('#Informasi img[itemprop="image"]').attr("src") || "";
      const infoRaw = {};
      $("#Informasi table.inftable tr").each((_, el) => {
        const key = $(el).find("td").first().text().trim();
        const value = $(el).find("td").last().text().trim();
        infoRaw[key] = value;
      });
      const genres = [];
      $('#Informasi ul.genre li span[itemprop="genre"]').each((_, el) => {
        genres.push($(el).text().trim());
      });
      const chapters = [];
      $("#Daftar_Chapter tbody tr").each((_, el) => {
        const linkEl = $(el).find("td.judulseries a");
        if (linkEl.length > 0) {
          const relativeLink = linkEl.attr("href");
          const link = relativeLink?.startsWith("http") ? relativeLink : this.baseUrl + relativeLink;
          chapters.push({
            title: linkEl.find("span").text().trim(),
            url: link || "",
            date: $(el).find("td.tanggalseries").text().trim()
          });
        }
      });
      return {
        title,
        title_id,
        description,
        sinopsis,
        ringkasan,
        image,
        info: {
          jenis: infoRaw["Jenis Komik"] || null,
          konsep: infoRaw["Konsep Cerita"] || null,
          pengarang: infoRaw["Pengarang"] || null,
          status: infoRaw["Status"] || null,
          umur_pembaca: infoRaw["Umur Pembaca"] || null,
          cara_baca: infoRaw["Cara Baca"] || null,
          genres
        },
        chapters
      };
    } catch (error) {
      console.error("Error in detail:", error);
      throw new Error("Failed to get manga details");
    }
  }
  async chapter(url) {
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 2e4
      });
      const $ = cheerio.load(data);
      const chapterTitle = $("#Judul h1").text().trim();
      const mangaTitle = $("#Judul p a b").first().text().trim();
      const information = {};
      $('tbody[data-test="informasi"] tr').each((i, el) => {
        const key = $(el).find("td").first().text().trim();
        const val = $(el).find("td").last().text().trim();
        if (key && val) information[key] = val;
      });
      const images = [];
      $("#Baca_Komik img[itemprop='image']").each((i, el) => {
        const src = $(el).attr("src");
        if (src) images.push(src);
      });
      return {
        chapter_title: chapterTitle,
        manga_title: mangaTitle,
        information,
        images
      };
    } catch (error) {
      console.error("Error in chapter:", error);
      throw new Error("Failed to get chapter content");
    }
  }
  async populer(page = 1) {
    try {
      const url = `${this.apiUrl}/other/hot/page/${page}/`;
      const { data: html } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15e3
      });
      const $ = cheerio.load(html);
      const results = [];
      $(".bge").each((_, el) => {
        const title = $(el).find(".kan h3").text().trim();
        let link = $(el).find(".kan a").attr("href");
        if (link && !link.startsWith("http")) link = this.baseUrl + link;
        const img = $(el).find(".bgei img").attr("src") || "";
        const genreRaw = $(el).find(".tpe1_inf").text().trim();
        const type = $(el).find(".tpe1_inf b").text().trim();
        let genre = [];
        if (genreRaw) {
          genre = genreRaw.replace(type, "").trim().split(/\s+/).filter(Boolean);
        }
        const firstDiv = $(el).find(".new1").first();
        const latestDiv = $(el).find(".new1").last();
        let first = null, latest = null;
        if (firstDiv.length) {
          let l = firstDiv.find("a").attr("href");
          if (l && !l.startsWith("http")) l = this.baseUrl + l;
          first = {
            title: firstDiv.find("a span").last().text().trim(),
            url: l || ""
          };
        }
        if (latestDiv.length) {
          let l = latestDiv.find("a").attr("href");
          if (l && !l.startsWith("http")) l = this.baseUrl + l;
          latest = {
            title: latestDiv.find("a span").last().text().trim(),
            url: l || ""
          };
        }
        results.push({
          id: "",
          title,
          url: link || "",
          img,
          genre,
          first,
          latest
        });
      });
      return results;
    } catch (error) {
      console.error("Error in populer:", error);
      throw new Error("Failed to get popular manga");
    }
  }
  async genre(genre = "action", page = 1) {
    const availableGenres = [
      "action",
      "adult",
      "adventure",
      "comedy",
      "cooking",
      "crime",
      "demons",
      "drama",
      "ecchi",
      "fantasy",
      "game",
      "gender-bender",
      "ghosts",
      "gore",
      "harem",
      "historical",
      "horror",
      "isekai",
      "josei",
      "magic",
      "manga",
      "martial-arts",
      "mature",
      "mecha",
      "medical",
      "military",
      "monsters",
      "music",
      "mystery",
      "one-shot",
      "police",
      "psychological",
      "reincarnation",
      "romance",
      "school",
      "school-life",
      "sci-fi",
      "seinen",
      "shoujo",
      "shoujo-ai",
      "shounen",
      "shounen-ai",
      "slice-of-life",
      "sport",
      "sports",
      "super-power",
      "supernatural",
      "thriller",
      "tragedy",
      "villainess",
      "yuri"
    ];
    if (!availableGenres.includes(genre)) {
      return {
        status: false,
        message: "Genre tidak valid",
        genre_provided: genre,
        available_genres: availableGenres,
        results: []
      };
    }
    try {
      const url = `${this.apiUrl}/genre/${genre}/page/${page}/`;
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 15e3
      });
      const $ = cheerio.load(data);
      const results = [];
      $(".bge").each((_, el) => {
        const title = $(el).find(".kan h3").text().trim();
        let link = $(el).find(".kan a").attr("href");
        if (link && !link.startsWith("http")) link = this.baseUrl + link;
        const img = $(el).find(".bgei img").attr("src") || "";
        const type = $(el).find(".tpe1_inf b").text().trim();
        const genreText = $(el).find(".tpe1_inf").text().replace(type, "").trim();
        let genreArr = [];
        if (genreText) genreArr = genreText.split(/\s+/).filter(Boolean);
        const firstDiv = $(el).find(".new1").first();
        const latestDiv = $(el).find(".new1").last();
        let first = null, latest = null;
        if (firstDiv.length) {
          let l = firstDiv.find("a").attr("href");
          if (l && !l.startsWith("http")) l = this.baseUrl + l;
          first = {
            title: firstDiv.find("a span").last().text().trim(),
            url: l || ""
          };
        }
        if (latestDiv.length) {
          let l = latestDiv.find("a").attr("href");
          if (l && !l.startsWith("http")) l = this.baseUrl + l;
          latest = {
            title: latestDiv.find("a span").last().text().trim(),
            url: l || ""
          };
        }
        results.push({
          id: "",
          title,
          url: link || "",
          img,
          genre: genreArr,
          first,
          latest
        });
      });
      return results;
    } catch (error) {
      console.error("Error in genre:", error);
      throw new Error("Failed to get manga by genre");
    }
  }
};

// server/routes.ts
var komiku = new Komiku();
var createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    status: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message,
      details: "Please wait before making more requests"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});
var generalLimit = createRateLimit(60 * 1e3, 120, "Too many requests per minute");
var searchLimit = createRateLimit(60 * 1e3, 60, "Too many search requests per minute");
var chapterLimit = createRateLimit(60 * 1e3, 40, "Too many chapter requests per minute");
var searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(100, "Search query too long")
});
var detailQuerySchema = z.object({
  url: z.string().url("Valid URL is required")
});
var chapterQuerySchema = z.object({
  url: z.string().url("Valid URL is required")
});
var popularQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1)
});
var genreParamsSchema = z.object({
  genre: z.string().min(1, "Genre is required")
});
var genreQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1)
});
async function getCachedOrFetch(cacheKey, fetchFn, ttlMinutes = 30) {
  const cached = await storage.getCacheItem(cacheKey);
  if (cached) {
    return cached.data;
  }
  const data = await fetchFn();
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);
  await storage.setCacheItem({
    cacheKey,
    data,
    expiresAt
  });
  return data;
}
async function registerRoutes(app2) {
  app2.use(cors({
    origin: true,
    credentials: true
  }));
  app2.use("/api", generalLimit);
  app2.get("/api/search", searchLimit, async (req, res) => {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "SEARCH_FAILED",
            message: "Failed to search manga",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  });
  app2.get("/api/detail", async (req, res) => {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "DETAIL_FAILED",
            message: "Failed to get manga details",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  });
  app2.get("/api/chapter", chapterLimit, async (req, res) => {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "CHAPTER_FAILED",
            message: "Failed to get chapter content",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  });
  app2.get("/api/popular", async (req, res) => {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "POPULAR_FAILED",
            message: "Failed to get popular manga",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  });
  app2.get("/api/genre/:genre", async (req, res) => {
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const cacheKey = `genre:${genre}:${page}`;
      const results = await getCachedOrFetch(cacheKey, () => komiku.genre(genre, page), 60);
      if (typeof results === "object" && "status" in results && results.status === false) {
        return res.status(400).json({
          status: false,
          error: {
            code: "INVALID_GENRE",
            message: results.message,
            details: `Available genres: ${results.available_genres?.join(", ")}`
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      res.json({
        status: true,
        data: results,
        message: `Manga for genre '${genre}' retrieved successfully`,
        pagination: {
          current_page: page,
          genre,
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
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({
          status: false,
          error: {
            code: "GENRE_FAILED",
            message: "Failed to get manga by genre",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  });
  app2.get("/api", (req, res) => {
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
        "action",
        "adult",
        "adventure",
        "comedy",
        "cooking",
        "crime",
        "demons",
        "drama",
        "ecchi",
        "fantasy",
        "game",
        "gender-bender",
        "ghosts",
        "gore",
        "harem",
        "historical",
        "horror",
        "isekai",
        "josei",
        "magic",
        "manga",
        "martial-arts",
        "mature",
        "mecha",
        "medical",
        "military",
        "monsters",
        "music",
        "mystery",
        "one-shot",
        "police",
        "psychological",
        "reincarnation",
        "romance",
        "school",
        "school-life",
        "sci-fi",
        "seinen",
        "shoujo",
        "shoujo-ai",
        "shounen",
        "shounen-ai",
        "slice-of-life",
        "sport",
        "sports",
        "super-power",
        "supernatural",
        "thriller",
        "tragedy",
        "villainess",
        "yuri"
      ],
      documentation: "Visit / for full API documentation"
    });
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: true,
      message: "API is healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
