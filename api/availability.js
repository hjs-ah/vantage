// api/availability.js
// Returns availability settings + hero image URLs from Notion
// Notion page properties expected:
//   Available (checkbox), Hours (number),
//   HeroFgImage (url), HeroBgImage (url)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    if (!process.env.NOTION_SECRET || !process.env.NOTION_SETTINGS_PAGE_ID) {
      return res.status(200).json({
        available: true,
        hours: 24,
        heroFgImage: '',
        heroBgImage: ''
      });
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

    const page  = await notionRes.json();
    const props = page.properties;

    return res.status(200).json({
      available:    props?.Available?.checkbox   ?? true,
      hours:        props?.Hours?.number         ?? 24,
      heroFgImage:  props?.HeroFgImage?.url      ?? '',
      heroBgImage:  props?.HeroBgImage?.url      ?? '',
    });

  } catch (err) {
    console.error('Availability fetch error:', err);
    return res.status(200).json({ available: true, hours: 24, heroFgImage: '', heroBgImage: '' });
  }
}
