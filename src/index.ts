import { Hono } from 'hono'
import { logger } from 'hono/logger'

type Bindings = {
  DYNAMIC_CONTENT_STORE: KVNamespace
  ORIGIN_HOST: string
}

interface CacheMetadata {
  expiresAt: number;
}

interface CacheResult {
  cache: string | null;
  isExpired: boolean;
}

const createCache = async(kv: KVNamespace, pathname: string, ttl: number):Promise<void> => {
  const res = await fetch(pathname);
  const rss = await res.text();

  const data = await parseRSStoJson(rss);
  const expiresAt = Date.now() + ttl;

  await kv.put(pathname, JSON.stringify(data), {
    metadata: {
      expiresAt,
    },
  });

  console.log('Cache created:', pathname);
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())

app.get('/', async (c) => {
  const pathname:string = 'https://zenn.dev/catnose99/feed';
  const ttl:number = 60
  createCache(c.env.DYNAMIC_CONTENT_STORE, pathname, ttl);
  return c.text("OK");
})

export default app;

// RSS パーサー
type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
}

async function parseRSStoJson(text:string): Promise<RSSItem[]> {
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
  return items;
};
