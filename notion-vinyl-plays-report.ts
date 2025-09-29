import fs from 'fs';
import { NotionVinylInfo, ReportPerMonth } from './types.ts';

const notionVinylCollection = fs.readFileSync('./files/notion_vinyl_collection.json', 'utf-8');
const parsedCollection: NotionVinylInfo[] = JSON.parse(notionVinylCollection);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Out', 'Nov', 'Dec'];
const years = ['23'];

const initialReportValues = years.reduce((acc: ReportPerMonth, year) => {
  months.forEach(month => {
    const key = `${month}/${year}`;
    acc[key] = [];
  });
  return acc;
}, {});

const perMonth = parsedCollection.reduce((acc: ReportPerMonth, curr) => {
  Object.keys(curr.properties).forEach(key => {
    // Only valid keys with valid numbers
    if (acc[key] && curr.properties[key].number !== null) {
      acc[key].push({
        artist: curr.properties.Artist.title[0].plain_text,
        album: curr.properties.Album.rich_text[0].plain_text,
        plays: curr.properties[key].number,
      });
    }
  });

  return acc;
}, initialReportValues);

Object.keys(perMonth).forEach(key => perMonth[key].sort((a, b) => b.plays - a.plays));

fs.writeFileSync('files/report_per_month_23.json', JSON.stringify(perMonth, null, 2));

