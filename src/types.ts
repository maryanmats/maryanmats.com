export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface NavPost {
  id: string;
  title: string;
}

export interface SeriesPost {
  id: string;
  title: string;
  part: number;
}
