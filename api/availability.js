// api/availability.js
// Vercel serverless function — reads availability settings
// Env vars needed: NOTION_SECRET, NOTION_SETTINGS_PAGE_ID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    // If Notion env vars aren't set yet, return the localStorage-driven default
    if (!process.env.NOTION_SECRET || !process.env.NOTION_SETTINGS_PAGE_ID) {
      return res.status(200).json({ available: true, hours: 24 });
    }

    const notionRes = await fetch(
      `https://api.notion.com/v1/pages/${process.env.NOTION_SETTINGS_PAGE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
          'Notion-Version': '2022-06-28',
        }
      }
    );

    const page = await notionRes.json();
    const props = page.properties;

    const available = props?.Available?.checkbox ?? true;
    const hours     = props?.Hours?.number ?? 24;

    return res.status(200).json({ available, hours });
  } catch (err) {
    console.error('Availability fetch error:', err);
    return res.status(200).json({ available: true, hours: 24 });
  }
}
