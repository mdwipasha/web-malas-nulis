// ============================================================
// NotebookRegistry — centralized notebook catalogue
// Provides categorized, filtered views of all notebook packs.
// ============================================================
import type { NotebookPack } from "@/types";
import { notebookLoader } from "./loader";

export class NotebookRegistry {
  private packs: NotebookPack[] = [];
  private initialized = false;

  // ============================================================
  // Initialize — loads all packs (call once at app start)
  // ============================================================
  async init(): Promise<void> {
    if (this.initialized) return;
    this.packs = await notebookLoader.loadAll();
    this.initialized = true;
  }

  /** Ensure initialized before queries */
  private assertInit() {
    if (!this.initialized) {
      throw new Error(
        "NotebookRegistry: call await registry.init() before querying."
      );
    }
  }

  // ============================================================
  // Get all notebooks
  // ============================================================
  getAll(): NotebookPack[] {
    this.assertInit();
    return [...this.packs];
  }

  // ============================================================
  // Get notebook by id
  // ============================================================
  getById(id: string): NotebookPack | undefined {
    this.assertInit();
    return this.packs.find((p) => p.id === id);
  }

  // ============================================================
  // Get by category
  // ============================================================
  getByCategory(category: string): NotebookPack[] {
    this.assertInit();
    return this.packs.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // ============================================================
  // Get all unique categories
  // ============================================================
  getCategories(): string[] {
    this.assertInit();
    return [...new Set(this.packs.map((p) => p.category))].sort();
  }

  // ============================================================
  // Get all unique countries
  // ============================================================
  getCountries(): string[] {
    this.assertInit();
    return [...new Set(this.packs.map((p) => p.country))].sort();
  }

  // ============================================================
  // Get all unique brands
  // ============================================================
  getBrands(): string[] {
    this.assertInit();
    return [...new Set(this.packs.map((p) => p.brand))].sort();
  }

  // ============================================================
  // Filter by country
  // ============================================================
  getByCountry(country: string): NotebookPack[] {
    this.assertInit();
    return this.packs.filter(
      (p) => p.country.toLowerCase() === country.toLowerCase()
    );
  }

  // ============================================================
  // Filter by brand
  // ============================================================
  getByBrand(brand: string): NotebookPack[] {
    this.assertInit();
    return this.packs.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  // ============================================================
  // Filter spiral notebooks
  // ============================================================
  getSpiral(): NotebookPack[] {
    this.assertInit();
    return this.packs.filter((p) => p.spiral);
  }

  // ============================================================
  // Filter portrait notebooks
  // ============================================================
  getPortrait(): NotebookPack[] {
    this.assertInit();
    return this.packs.filter((p) => p.orientation === "portrait");
  }

  // ============================================================
  // Filter landscape notebooks
  // ============================================================
  getLandscape(): NotebookPack[] {
    this.assertInit();
    return this.packs.filter((p) => p.orientation === "landscape");
  }

  // ============================================================
  // Filter by render mode
  // ============================================================
  getByRenderMode(mode: "classic" | "photo" | "premium"): NotebookPack[] {
    this.assertInit();
    return this.packs.filter((p) => p.renderMode === mode);
  }

  // ============================================================
  // Get categorized map: { category -> NotebookPack[] }
  // ============================================================
  getCategorized(): Record<string, NotebookPack[]> {
    this.assertInit();
    return this.packs.reduce(
      (acc, pack) => {
        const cat = pack.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(pack);
        return acc;
      },
      {} as Record<string, NotebookPack[]>
    );
  }

  // ============================================================
  // Search notebooks by name/brand/description
  // ============================================================
  search(query: string): NotebookPack[] {
    this.assertInit();
    const q = query.toLowerCase();
    return this.packs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        (p.metadata.description?.toLowerCase().includes(q) ?? false)
    );
  }

  // ============================================================
  // Get summary for API responses
  // ============================================================
  getSummary(): {
    total: number;
    categories: string[];
    brands: string[];
    countries: string[];
    spiral: number;
    portrait: number;
    landscape: number;
  } {
    this.assertInit();
    return {
      total: this.packs.length,
      categories: this.getCategories(),
      brands: this.getBrands(),
      countries: this.getCountries(),
      spiral: this.getSpiral().length,
      portrait: this.getPortrait().length,
      landscape: this.getLandscape().length,
    };
  }
}

/** Singleton registry instance */
export const notebookRegistry = new NotebookRegistry();
