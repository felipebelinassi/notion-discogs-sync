import 'dotenv/config';
import fs from 'node:fs';
import { Client } from '@notionhq/client';

type ExportNotionParams = {
  auth: string;
  databaseId: string;
}

export const exportCollection = async (params: ExportNotionParams) => {
  const notion = new Client({
    auth: params.auth,
  });
  
  const response = await notion.databases.query({
    database_id: params.databaseId,
    sorts: [
      { property: 'Artist', direction: 'ascending' },
      { property: 'Album', direction: 'ascending' }
    ],
  });

  const allResults = response.results;
  let hasMore = response.has_more;
  let nextPageCursor = response.next_cursor;

  while (hasMore && nextPageCursor) {
    const nextPageResults = await notion.databases.query({
      database_id: params.databaseId,
      sorts: [
        { property: 'Artist', direction: 'ascending' },
        { property: 'Album', direction: 'ascending' }
      ],
      start_cursor: nextPageCursor,
    });

    allResults.push(...nextPageResults.results);

    hasMore = nextPageResults.has_more;
    nextPageCursor = nextPageResults.next_cursor;
  }

  const fileName = 'files/notion_collection.json';
  fs.writeFileSync(fileName, JSON.stringify(allResults, null, 2));

  console.log(`Exported ${allResults.length} items from Discogs collection and saved to ${fileName}`);
}

// exportCollection({
//   auth: process.env.NOTION_AUTH_TOKEN,
//   databaseId: process.env.NOTION_DATABASE_ID,
// })