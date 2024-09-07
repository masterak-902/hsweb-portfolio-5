import { Hono } from 'hono'

const app = new Hono();

app.get('/', async (c) => {
  
  const res = await fetch('https://zenn.dev/catnose99/feed');
  const rss = await res.text();
  try {
    const json = await parseRSStoJson(rss);
    return c.json(json);
  } catch (e) {
    console.log(e)
    return c.text("Not Found");
  };
})

export default app;

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
