import Parser from 'rss-parser'
const parser = new Parser()

export type Headline = { title: string; link?: string; pubDate?: string; source?: string }

const FEEDS = (sector: string) => ([
  `https://news.google.com/rss/search?q=${encodeURIComponent(sector + ' UK')}`,
  `https://news.google.com/rss/search?q=${encodeURIComponent(sector + ' SMEs')}`,
  `https://news.google.com/rss/search?q=${encodeURIComponent(sector + ' finance OR funding')}`,
])

export async function fetchHeadlines(sector: string, limit = 6): Promise<Headline[]> {
  const feeds = FEEDS(sector)
  const items: any[] = []
  for (const url of feeds) {
    try {
      const f = await parser.parseURL(url)
      items.push(...(f.items || []))
    } catch {}
  }
  const dedup = new Map<string, Headline>()
  for (const it of items) {
    const title = (it.title || '').trim()
    if (!title || dedup.has(title)) continue
    dedup.set(title, { title, link: it.link, pubDate: it.pubDate, source: (it as any).creator || (it as any).source || 'News' })
  }
  return Array.from(dedup.values()).slice(0, limit)
}
