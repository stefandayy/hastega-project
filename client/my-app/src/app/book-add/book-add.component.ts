import { Component, OnInit } from '@angular/core';
import { SearchbookService } from '../services/searchbook.service';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  tap,
} from 'rxjs';
import { FormControl } from '@angular/forms';
import { Book, BookAutoComplete } from '../model/book.model';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../services/book.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-book-add',
  templateUrl: './book-add.component.html',
  styleUrls: ['./book-add.component.css'],
})
export class BookAddComponent implements OnInit {
  userId!: number;
  myControl = new FormControl();
  filteredOptions!: Observable<any[]>;
  constructor(
    private searchbookService: SearchbookService,
    private bookService: BookService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // valueChanges fa parte del modulo ReactiveFormsModule ed è utilizzato per monitorare i cambiamenti del valore di un FormControl.
    this.filteredOptions = this.myControl.valueChanges.pipe(
      // L'operatore startWith viene utilizzato per emettere un valore iniziale nel flusso degli eventi.
      startWith(''),

      // se valore non è una stringa vuota viene chiamato _filter per filtrare le opzioni, se invece, sarà vuota viene restituito un array vuoto
      map((value: string) => (value ? this._filter(value) : []))
    );
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
    });
  }

  searchBooks(): void {
    const searchTerm = this.myControl.value;
    this.searchbookService
      .searchBooks(searchTerm.title ?? searchTerm) // passo valore titolo per ottenere url giusto nel service
      .pipe(
        tap({
          // next riceve i dati emessi dall'observable e li mette in data
          next: (data) => {
            console.log(data.items);
            this.searchbookService.updateSearchResults$(data.items);
          },
          error: (error) => {
            console.error('An error occurred:', error);
          },
        })
      )
      .subscribe();
  }

  displayTitle(book: any): string {
    return book && book.title ? book.title : '';
  }

  private _filter(value: string): BookAutoComplete[] {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${value}`;

    // creiamo array books che conterrà i libri ottenuti con chiamata API
    const books: BookAutoComplete[] = [];

    this.http
      .get(apiUrl)

      /* - debounceTime(300) -> crea ritardo di 300millisec tra le richieste per evitare troppe richieste mentre l'utente sta digitando
      - distinctUntilChanged() -> assicura che la richiesta venga inviata solo se il valore è cambiato rispetto all'ultima richiesta */
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((response: any) => {
        // if response esiste e response contiene array di elementi
        if (response && response.items) {
          // si itera e si crea oggetto book con titolo
          response.items.forEach((item: any) => {
            const book: BookAutoComplete = {
              title: item.volumeInfo.title,
            };
            // oggetto book: BookAutoComplete viene aggiunto all'array books
            books.push(book);
          });
        }
      });
    return books;
  }

  // button search funziona con Invio da tastiera
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchBooks();
    }
  }

  get searchResults$() {
    return this.searchbookService.searchResults$;
  }

  onSubmit(book: any): void {
    const retrieveBook: Book = {
      title: book.volumeInfo.title,
      author: this.convertAuthorToString(book.volumeInfo.authors),
      description: book.volumeInfo.description,
      isbn: book.volumeInfo.industryIdentifiers[0].identifier,
      image_url: book.volumeInfo.imageLinks.thumbnail,
      readings: 0,
    };

    console.log(this.userId);
    console.log(retrieveBook);
    this.bookService
      .addBookToUserLibrary(this.userId, retrieveBook)
      .pipe(
        tap({
          next: (response) => {
            console.log(response.message);
            this.snackBar.open('Book added successfully', '', {
              duration: 1000,
            });
          },
          error: (error) => {
            console.error(error);
            this.snackBar.open('Book already exists', '', {
              duration: 1000,
            });
          },
        })
      )
      .subscribe();
  }

  convertAuthorToString(author: string | string[]): string {
    if (typeof author === 'string') {
      return author;
    } else if (Array.isArray(author)) {
      return author.join(', ');
    } else {
      return 'Unknown Author';
    }
  }

  goBack() {
    this.router.navigateByUrl(`user/${this.userId}`);
  }
}
