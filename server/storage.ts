import { type User, type InsertUser, type MangaCache, type InsertMangaCache } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cache methods
  getCacheItem(key: string): Promise<MangaCache | undefined>;
  setCacheItem(item: InsertMangaCache): Promise<MangaCache>;
  clearExpiredCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cache: Map<string, MangaCache>;

  constructor() {
    this.users = new Map();
    this.cache = new Map();
    
    // Clean expired cache every hour
    setInterval(() => {
      this.clearExpiredCache();
    }, 60 * 60 * 1000);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCacheItem(key: string): Promise<MangaCache | undefined> {
    const item = this.cache.get(key);
    if (item && new Date(item.expiresAt) > new Date()) {
      return item;
    }
    if (item) {
      this.cache.delete(key);
    }
    return undefined;
  }

  async setCacheItem(insertItem: InsertMangaCache): Promise<MangaCache> {
    const id = randomUUID();
    const item: MangaCache = {
      ...insertItem,
      id,
      createdAt: new Date(),
    };
    this.cache.set(insertItem.cacheKey, item);
    return item;
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date();
    for (const [key, item] of this.cache.entries()) {
      if (new Date(item.expiresAt) <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export const storage = new MemStorage();
