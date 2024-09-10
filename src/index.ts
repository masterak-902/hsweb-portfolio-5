import { Hono } from 'hono'
import { logger } from 'hono/logger'

type Bindings = {
  hsweb_kv_test: KVNamespace
}

interface CacheMetadata {
  expiresAt: number;
}

interface CacheResult {
  cache: string | null;
  isExpired: boolean;
}

const ttl:number = 24 * 60 * 1000; // １日

const createCache = async(kv: KVNamespace, pathname: string, ttl: number):Promise<string> => {
  const res = await fetch(pathname);
  const rss = await res.text();
  const data = await parseRSStoJson(rss);
  const expiresAt = Date.now() + ttl;
  await kv.put(pathname, data, {
    metadata: {
      expiresAt,
    },
  });
  console.log("Create Cache!" );
  return data;
}

const getCache = async(kv: KVNamespace, pathname: string):Promise<CacheResult> => {
  const { value, metadata } = await kv.getWithMetadata<CacheMetadata>(pathname);
  console.log("現在時刻：" + Date.now(), "キャッシュの有効期限：" + (metadata?.expiresAt ?? 'unknown'));
  if (!value || !metadata) {
    return {
      cache: null,
      isExpired: true,
    };
  }
  return {
    cache: value,
    isExpired: metadata.expiresAt < Date.now(),
  };
};

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())

app.get("/", async (c) => {
  const pathname:string = 'https://zenn.dev/masterak/feed';
  const { cache, isExpired } = await getCache(c.env.hsweb_kv_test, pathname);
  if (isExpired) {
    const res = await createCache(c.env.hsweb_kv_test, pathname, ttl);
    return c.html(res);
  }
  if (cache && !isExpired) {
    return c.html(cache);
  }
});

export default app;

// RSS パーサー
type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
}

async function parseRSStoJson(text:string): Promise<string> {
  const items:RSSItem[] = [];
  // <items>の検索・正規表現
  const itemsRegex = /<item>([\s\S]*?)<\/item>/g; 
  let match;
  while((match = itemsRegex.exec(text)) !== null) {
    const itemContent = match[1];
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    // CDATAセクションを削除
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');

    // Date型に変換
    let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    const date = new Date(pubDate);
    pubDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

    items.push({
      title,
      link: linkMatch ? linkMatch[1].trim() : '',
      pubDate,
    });
  }
  return JSON.stringify(items);
};
