import fs from 'node:fs';
import { NotionVinylInfo } from './types.ts';

const formatCollection = (collectionItem: NotionVinylInfo) => ({
  notionId: collectionItem.id,
  artist: collectionItem.properties.Artist.title[0].plain_text,
  album: collectionItem.properties.Album.rich_text[0].plain_text,
  added: collectionItem.properties.Added.date.start,
  boughtAt: collectionItem.properties['Bought at'].select?.name || '',
  price: collectionItem.properties.Price.number,
  plays22: collectionItem.properties['Plays/22'].number || 0,
  plays23: collectionItem.properties['Plays/23'].number || 0,
  plays24: collectionItem.properties['Plays/24'].number || 0,
  plays25: collectionItem.properties['Plays/25'].number || 0,
  totalPlays: collectionItem.properties['Total Plays'].formula.number,
});

export const formatNotionCollection = () => {
  const notionVinylCollection = fs.readFileSync('./files/notion_collection.json', 'utf-8');
  const parsedCollection: NotionVinylInfo[] = JSON.parse(notionVinylCollection);

  const formattedCollection = parsedCollection.map(formatCollection);
  fs.writeFileSync('files/notion_collection_formatted.json', JSON.stringify(formattedCollection, null, 2));

  console.log('Formatted collection and saved to files/notion_collection_formatted.json');
}

// formatNotionCollection();