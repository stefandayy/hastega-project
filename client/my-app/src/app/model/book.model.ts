export interface Book {
  title: string;
  author: string | string[];
  description: string;
  isbn: string;
  readings: number;
}

export interface BookAutoComplete {
  title: string;
}
