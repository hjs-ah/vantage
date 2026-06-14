// api/cases.js
// Vercel serverless function — reads case studies from Notion database
// Env vars needed: NOTION_SECRET, NOTION_CASES_DB_ID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');

  try {
    if (!process.env.NOTION_SECRET || !process.env.NOTION_CASES_DB_ID) {
      return res.status(200).json([]);
    }

    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_CASES_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: { property: 'Published', checkbox: { equals: true } },
          sorts:  [{ property: 'Sort Order', direction: 'ascending' }]
        })
      }
    );

    const data = await notionRes.json();

    const cases = (data.results || []).map(page => {
      const p = page.properties;
      return {
        initials: p?.Initials?.rich_text?.[0]?.plain_text || 'VC',
        quote:    p?.Quote?.rich_text?.[0]?.plain_text    || '',
        person:   p?.Name?.title?.[0]?.plain_text         || '',
        org:      p?.Org?.rich_text?.[0]?.plain_text      || '',
        lab:      p?.Lab?.select?.name                    || '',
      };
    }).filter(c => c.quote);

    return res.status(200).json(cases);
  } catch (err) {
    console.error('Cases fetch error:', err);
    return res.status(200).json([]);
  }
}
