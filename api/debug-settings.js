// api/debug-settings.js
// TEMPORARY — visit /api/debug-settings in browser to see raw Notion response
// DELETE THIS FILE before going to production
// Only works if NOTION_SECRET and NOTION_SETTINGS_DB_ID are set in Vercel env vars

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.NOTION_SECRET || !process.env.NOTION_SETTINGS_DB_ID) {
    return res.status(200).json({
      error: 'Missing env vars',
      hasSecret: !!process.env.NOTION_SECRET,
      hasDbId: !!process.env.NOTION_SETTINGS_DB_ID,
    });
  }

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_SETTINGS_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 1 })
      }
    );

    const raw = await notionRes.json();

    // Extract just the properties for readability
    const simplified = (raw.results || []).map(page => ({
      id: page.id,
      properties: Object.fromEntries(
        Object.entries(page.properties).map(([k, v]) => [k, v])
      )
    }));

    return res.status(200).json({
      status: notionRes.status,
      resultCount: raw.results?.length ?? 0,
      raw_first_page_properties: simplified[0]?.properties ?? null,
      full_raw: raw
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
