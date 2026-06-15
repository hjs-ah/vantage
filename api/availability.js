// api/availability.js
// Reads the "Production" row from the Site Settings Notion database
// Env vars: NOTION_SECRET, NOTION_SETTINGS_DB_ID
// DB ID: 83d12537-aced-4c3a-ae68-f22cfc8bcba1  (the database, not the collection)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  const defaults = { available: true, hours: 24, heroFgImage1: '', heroFgImage2: '', heroFgImage3: '', heroBgImage: '', heroFadeSecs: 4 };

  try {
    if (!process.env.NOTION_SECRET || !process.env.NOTION_SETTINGS_DB_ID) {
      return res.status(200).json(defaults);
    }

    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_SETTINGS_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Name',
            title: { equals: 'Production' }
          },
          page_size: 1
        })
      }
    );

    const data = await notionRes.json();
    const page = data.results?.[0];
    if (!page) return res.status(200).json(defaults);

    const p = page.properties;
    return res.status(200).json({
      available:    p?.Available?.checkbox   ?? true,
      hours:        p?.Hours?.number         ?? 24,
      heroFgImage1: p?.HeroFgImage1?.url     ?? '',
      heroFgImage2: p?.HeroFgImage2?.url     ?? '',
      heroFgImage3: p?.HeroFgImage3?.url     ?? '',
      heroBgImage:  p?.HeroBgImage?.url      ?? '',
      heroFadeSecs: p?.HeroFadeSecs?.number  ?? 4,
    });

  } catch (err) {
    console.error('Availability fetch error:', err);
    return res.status(200).json(defaults);
  }
}
