import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Book } from '../model/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getBookFromLibrary(userId: number, bookId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/books/${bookId}`);
  }

  addBookToUserLibrary(userId: number, book: Book): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/books`, book);
  }

  deleteBookFromLibrary(userId: string, bookId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/books/${bookId}`);
  }

  incrementReadings(userId: number, bookId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/users/${userId}/books/${bookId}/increment`,
      {}
    );
  }

  decrementReadings(userId: number, bookId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/users/${userId}/books/${bookId}/decrement`,
      {}
    );
  }
}
