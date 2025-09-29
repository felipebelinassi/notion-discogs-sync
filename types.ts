type NotionStringData = {
  type: string;
  plain_text: string;
}

type NotionSelectData = {
  id: string;
  name: string;
  color: string;
}

type NotionNumberData = {
  id: string;
  type: string;
  number: number | null;
}

type NotionVinylPlays = Record<string, NotionNumberData> & {
  "Total Plays": {
    id: string;
    type: string;
    formula: {
      type: string;
      number: number;
    },
  },
  "Plays/22": NotionNumberData;
  "Plays/23": NotionNumberData;
  "Plays/24": NotionNumberData;
  "Plays/25": NotionNumberData;
}

type NotionVinylProperties = {
  Artist: {
    id: string;
    type: string;
    title: NotionStringData[];
  },
  Album: {
    id: string;
    type: string;
    rich_text: NotionStringData[];
  },
  Format: {
    id: string;
    type: string;
    multi_select: NotionSelectData[];
  },
  Added: {
    id: string;
    type: string;
    date: {
      start: string;
      end: string;
      time_zone: string;
    }
  },
  "Bought at": {
    id: string;
    type: string;
    select: NotionSelectData;
  },
  Price: NotionNumberData;
  "Discogs ID": NotionNumberData;
}

export type NotionVinylInfo = {
  id: string;
  properties: NotionVinylProperties & NotionVinylPlays;
};

export type ReportPerMonth = Record<string, {
  album: string;
  artist: string;
  plays: number
}[]>

export type DiscogsCollectionItem = {
  id: number;
  artist: string;
  album: string;
  releaseYear: number;
  genre: string[];
  format: string[];
  formatDetails: string[];
  coverImage: string;
  dateAdded: string;
}