import type { NotebookPack } from "@/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NotebookLoader: failed to fetch ${url} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function loadNotebookPack(id: string): Promise<NotebookPack> {
  return fetchJson<NotebookPack>(`/api/notebooks/${encodeURIComponent(id)}`);
}

export async function loadAllNotebookPacks(): Promise<NotebookPack[]> {
  const payload = await fetchJson<{ notebooks: NotebookPack[] }>("/api/notebooks");
  return payload.notebooks;
}

export async function getNotebookManifest(): Promise<
  Array<{ id: string; folderPath: string; pagePath: string }>
> {
  const packs = await loadAllNotebookPacks();
  return packs.map((pack) => ({
    id: pack.id,
    folderPath: pack.folderPath,
    pagePath: pack.pagePath,
  }));
}

export class NotebookLoader {
  private cache = new Map<string, NotebookPack>();
  private allLoaded = false;
  private allPacks: NotebookPack[] = [];

  async load(id: string): Promise<NotebookPack> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const pack = await loadNotebookPack(id);
    this.cache.set(pack.id, pack);
    return pack;
  }

  async loadAll(): Promise<NotebookPack[]> {
    if (this.allLoaded) return [...this.allPacks];

    this.allPacks = await loadAllNotebookPacks();
    for (const pack of this.allPacks) {
      this.cache.set(pack.id, pack);
    }
    this.allLoaded = true;
    return [...this.allPacks];
  }

  clear() {
    this.cache.clear();
    this.allLoaded = false;
    this.allPacks = [];
  }
}

export const notebookLoader = new NotebookLoader();
