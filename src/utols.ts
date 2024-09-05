

export default async function fetchRss(url:string) {
    const rss = await fetch(url);
    const xml = await rss.text();

    
}