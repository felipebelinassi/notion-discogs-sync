import 'dotenv/config';
import fs from 'node:fs';
import { Client } from '@notionhq/client';
import { DiscogsCollectionItem, NotionVinylInfo } from './types.ts';

type AuthParams = {
  auth: string;
}

type CreateParams = AuthParams & {
  parentPageId: string;
}

type UpdateParams = AuthParams & {
  databaseId: string;
  properties: Record<string, any>
}

type SyncParams = AuthParams & {
  databaseId: string;
}

const initializeClient = (auth: string) => new Client({ auth });

export const createDb = async (params: CreateParams) => {
  const notion = initializeClient(params.auth);

  const response = await notion.databases.create({
    parent: {
      type: "page_id",
      page_id: params.parentPageId,
    },
    properties: {
      Artist: {
        title: {}
      },
      Album: {
        rich_text: {}
      },
      Genres: {
        multi_select: {}
      },
      Released: {
        number: {}
      },
      "Discogs ID": {
        rich_text: {}
      },
      Format: {
        multi_select: {}
      },
      Added: {
        date: {}
      },
      "Bought at": {
        select: {}
      },
      Price: {
        number: {
          format: "euro",
        },
      },
      "Plays/22": {
        number: {}
      },
      "Plays/23": {
        number: {}
      },
      "Plays/24": {
        number: {}
      },
      "Plays/25": {
        number: {}
      },
      "Total Plays": {
        formula: {
          expression: 'prop("Plays/22") + prop("Plays/23") + prop("Plays/24") + prop("Plays/25")'
        }
      }
    },
    icon: {
      type: "emoji",
      emoji: "🎧",
    },
    cover: {
      type: "external",
      external: {
        url: "https://website.docreate/images/image.png",
      },
    },
    title: [
      {
        type: "text",
        text: {
          content: "Collection (Discogs)",
          link: null,
        },
      },
    ],
  });

  console.log('Created DB with id:', response.id)
  return response.id;
}

export const updateDb = async (params: UpdateParams) => {
  const notion = initializeClient(params.auth);

  const response = await notion.databases.update({
    database_id: params.databaseId,
    properties: params.properties,
  });

  console.log(`Database id=${response.id} updated`);

  return response;
}

export const syncDbCollection = async (params: SyncParams, forceUpdate = false) => {
  const notion = initializeClient(params.auth);

  const discogsVinylCollection = fs.readFileSync('files/discogs_collection.json', 'utf-8');
  const parsedCollection: DiscogsCollectionItem[] = JSON.parse(discogsVinylCollection);

  const notionVinylCollection = fs.readFileSync('files/notion_collection.json', 'utf-8');
  const parsedNotionCollection: NotionVinylInfo[] = JSON.parse(notionVinylCollection);

  let updatedItems = 0;
  for (const item of parsedCollection) {
    // if (updatedItems >= 1) break; // Limit to 1 item for testing purposes
    const alreadyExists = parsedNotionCollection.find((notionItem) => notionItem.properties['Discogs ID'].number === item.id);
    
    if (!alreadyExists) {
      console.log('Creating item:', JSON.stringify({
        artist: item.artist,
        album: item.album,
        format: item.format,
        formatDetails: item.formatDetails,
      }));

      await notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: params.databaseId
        },
        cover: {
          type: 'external',
          external: {
            url: item.coverImage,
          },
        },
        properties: {
          Artist: {
            title: [
              {
                text: {
                  content: item.artist
                },
              },
            ],
          },
          Album: {
            rich_text: [
              {
                text: {
                  content: item.album
                },
              },
            ]
          },
          Genres: {
            multi_select: item.genre.map((genre) => ({
              name: genre,
            }))
          },
          Released: {
            number: item.releaseYear
          },
          "Discogs ID": {
            number: item.id,
          },
          Format: {
            multi_select: item.format.map((format) => ({
              name: format,
            }))
          },
          "Format Details": {
            multi_select: item.formatDetails.map((formatDetails) => ({
              name: formatDetails,
            }))
          },
          Added: {
            date: {
              start: item.dateAdded.split('T')[0]
            }
          },
          // "Bought at": {
          //   select: {}
          // },
          Price: {
            number: 0,
          },
          "Plays/22": {
            number: 0
          },
          "Plays/23": {
            number: 0
          },
          "Plays/24": {
            number: 0
          },
          "Plays/25": {
            number: 0
          },
        },
      });

      updatedItems += 1;
    } else if (alreadyExists && forceUpdate) {
      // This is useful if the format has changed or other properties need to be updated
      console.log('Updating item:', JSON.stringify({
        artist: item.artist,
        album: item.album,
        format: item.format,
        formatDetails: item.formatDetails,
      }));

      await notion.pages.update({
        page_id: alreadyExists.id,
        properties: {
          Format: {
            multi_select: item.format.map((format) => ({
              name: format,
            }))
          },
          "Format Details": {
            multi_select: item.formatDetails.map((formatDetails) => ({
              name: formatDetails,
            }))
          }
        }
      });

      updatedItems += 1;
    }
  }
  
  console.log(`Synced DB and updated ${updatedItems} new items`);
}

// createDb({
//   auth: process.env.NOTION_AUTH_TOKEN,
//   parentPageId: '5a464763473048b193ad574d888fe7c7',
// });

// syncDbCollection({
//   auth: process.env.NOTION_AUTH_TOKEN,
//   databaseId: process.env.NOTION_DATABASE_ID,
// });

// updateDb({
//   auth: process.env.NOTION_AUTH_TOKEN,
//   databaseId: process.env.NOTION_DATABASE_ID,
//   properties: {
//     "Format Details": {
//       multi_select: {}
//     },
//   }
// })