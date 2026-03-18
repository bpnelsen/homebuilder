import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const query = searchParams.get('q');
  
  const searchQuery = ticker 
    ? `${ticker} stock homebuilder` 
    : query || 'residential construction homebuilder industry';
  
  try {
    // Use Google News RSS
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(rssUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 } // Cache 1 hour
    });
    
    if (!response.ok) {
      throw new Error('News fetch failed');
    }
    
    const xml = await response.text();
    
    // Parse RSS items
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const itemXml = match[1];
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const source = itemXml.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';
      
      if (title && link) {
        items.push({ title, link, pubDate, source });
      }
    }
    
    return NextResponse.json({ items, query: searchQuery });
  } catch (error) {
    return NextResponse.json({ items: [], error: 'Failed to fetch news' }, { status: 500 });
  }
}
