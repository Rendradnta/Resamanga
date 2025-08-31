import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const mangaCache = pgTable("manga_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMangaCacheSchema = createInsertSchema(mangaCache).pick({
  cacheKey: true,
  data: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMangaCache = z.infer<typeof insertMangaCacheSchema>;
export type MangaCache = typeof mangaCache.$inferSelect;

// API Response Types
export const searchResponseSchema = z.object({
  status: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    img: z.string(),
    genre: z.array(z.string()),
    first: z.object({
      title: z.string(),
      url: z.string(),
    }).nullable(),
    latest: z.object({
      title: z.string(),
      url: z.string(),
    }).nullable(),
  })),
  message: z.string().optional(),
});

export const detailResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    title: z.string(),
    title_id: z.string(),
    description: z.string(),
    sinopsis: z.string(),
    ringkasan: z.array(z.string()),
    image: z.string(),
    info: z.object({
      jenis: z.string().nullable(),
      konsep: z.string().nullable(),
      pengarang: z.string().nullable(),
      status: z.string().nullable(),
      umur_pembaca: z.string().nullable(),
      cara_baca: z.string().nullable(),
      genres: z.array(z.string()),
    }),
    chapters: z.array(z.object({
      title: z.string(),
      url: z.string(),
      date: z.string(),
    })),
  }).optional(),
  message: z.string().optional(),
});

export const chapterResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    chapter_title: z.string(),
    manga_title: z.string(),
    information: z.record(z.string()),
    images: z.array(z.string()),
  }).optional(),
  message: z.string().optional(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type DetailResponse = z.infer<typeof detailResponseSchema>;
export type ChapterResponse = z.infer<typeof chapterResponseSchema>;
