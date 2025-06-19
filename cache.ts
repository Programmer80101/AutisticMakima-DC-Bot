type Loader<T> = () => Promise<T>;

type CacheEntry<T> = {
  loader: Loader<T>;
  data?: T | null;
  lastFetched?: number;
  initializing?: Promise<void>;
};

export class CacheManager {
  private entries = new Map<string, CacheEntry<any>>();

  register<T>(key: string, loader: Loader<T>): void {
    if (this.entries.has(key)) {
      console.warn(`🔄 Cache for "${key}" already registered; overwriting.`);
    }

    this.entries.set(key, { loader });
  }

  async initAll(): Promise<void> {
    await Promise.all(
      [...this.entries.keys()].map(async (key) => {
        return this.init(key).catch((error) => {
          console.error(`❌ Failed to init cache "${key}": ${error}`);
        });
      })
    );
  }

  async init<T>(key: string): Promise<void> {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) throw new Error(`❌ Cache for ${key} not found.`);
    if (entry.initializing) return entry.initializing;

    entry.initializing = (async () => {
      try {
        entry.data = await entry?.loader();
        entry.lastFetched = Date.now();
      } finally {
        delete entry.initializing;
      }
    })();

    return entry.initializing;
  }

  async get<T>(key: string): Promise<T> {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) throw new Error(`❌ Cache for ${key} not found.`);
    if (entry.data === undefined) {
      await this.init<T>(key);
    }

    return entry.data as T;
  }

  async refresh<T>(key: string): Promise<T> {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) throw new Error(`❌ Cache for ${key} not found.`);

    delete entry.data;
    return this.get<T>(key);
  }

  clear(key: string): void {
    const entry = this.entries.get(key);

    if (!entry) throw new Error(`❌ Cache for ${key} not found.`);

    delete entry.data;
    delete entry.lastFetched;
  }

  clearAll(): void {
    this.entries.forEach((_, key) => this.clear(key));
  }
}

export const cache = new CacheManager();
