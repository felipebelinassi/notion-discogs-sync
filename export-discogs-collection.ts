import 'dotenv/config';
import fs from 'node:fs';
import { DiscogsClient, BasicReleaseInfo } from '@lionralfs/discogs-client';

type ExportDiscogsParams = {
  consumerKey: string;
  consumerSecret: string;
  discogsUser: string;
}

type Release = {
  id: number;
  date_added?: string;
  instance_id: number;
  folder_id: number;
  rating: number;
  basic_information: BasicReleaseInfo;
  notes: Array<{
    field_id: number;
    value: string;
  }>;
}

const getReleases = async (client: DiscogsClient, discogsUser: string, page = 0, perPage = 100) => {
  const collection = client.user().collection();
  const releases = await collection.getReleases(discogsUser, 0, {
    page,
    per_page: perPage,
    sort: 'artist',
    sort_order: 'asc'
  });

  return releases;
}

// Replace commas or ampersands with slash bar
const formatGenre = (genre: string) => genre.replace(/\s*(,|&|, &)\s*/g, '/').replace(/\/{2,}/g, '/');

const formatReleases = (releases: Release[]) => (
  releases.map((release) => ({
    id: release.id,
    artist: release.basic_information.artists.map(({ name }) => name).join(', '),
    album: release.basic_information.title,
    releaseYear: release.basic_information.year,
    genre: release.basic_information.genres.map((genre) => formatGenre(genre)).flat().filter((genre) => !!genre),
    format: release.basic_information.formats.map(({ name }) => name).flat().filter((format) => !!format),
    formatDetails: release.basic_information.formats.map(({ descriptions }) => descriptions).flat().filter((formatDetails) => !!formatDetails),
    coverImage: release.basic_information.cover_image,
    dateAdded: release.date_added,
  }))
);

export const exportCollection = async (params: ExportDiscogsParams) => {
  const client = new DiscogsClient({
    auth: {
      method: 'discogs',
      consumerKey: params.consumerKey,
      consumerSecret: params.consumerSecret,
    }
  });

  const initialPage = 0;
  const perPage = 100;
  const { data: { pagination, releases } } = await getReleases(client, params.discogsUser, initialPage, perPage);

  let currentPage = pagination.page;
  const allReleases = releases;

  while (currentPage < pagination.pages) {
    currentPage += 1;
    const nextPageReleases = await getReleases(client, params.discogsUser, currentPage, perPage);
    allReleases.push(...nextPageReleases.data.releases);
  }

  const normalizedReleases = formatReleases(allReleases);
  const fileName = 'files/discogs_collection.json';
  fs.writeFileSync(fileName, JSON.stringify(normalizedReleases, null, 2));

  console.log(`Exported ${normalizedReleases.length} items from Discogs collection and saved to ${fileName}`);
}

// exportCollection({
//   consumerKey: process.env.DISCOGS_CONSUMER_KEY,
//   consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
// })