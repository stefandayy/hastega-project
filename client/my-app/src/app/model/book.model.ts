export interface Book {
  title: string;
  author: string | string[];
  description: string;
  isbn: string;
  readings: number;
  image_url: string;
  added_date?: string;
}

export interface BookAutoComplete {
  title: string;
}
