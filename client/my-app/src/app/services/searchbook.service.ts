import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchbookService {
  private apiUrlBooks = 'https://www.googleapis.com/books/v1/volumes';
  private searchResults: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    []
  );
  searchResults$ = this.searchResults.asObservable();

  constructor(private http: HttpClient) {}

  searchBooks(query: string): Observable<any> {
    const params = {
      q: query,
      maxResults: '10',
    };
    return this.http.get<any>(this.apiUrlBooks, { params }).pipe(
      // voglio far vedere solo libri che HANNO l'img di copertina
      map((response) => {
        // con filter ritorno solo libri con imageLinks.thumbnail
        const filteredItems = response.items.filter(
          (item: any) =>
            item.volumeInfo.imageLinks &&
            item.volumeInfo.imageLinks.thumbnail &&
            item.volumeInfo.description
        );
        response.items = filteredItems;
        return response;
      })
    );
  }

  updateSearchResults$(results: any[]) {
    this.searchResults.next(results);
  }
}
