import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { pipe, tap } from 'rxjs';
import { BookService } from '../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-library',
  templateUrl: './user-library.component.html',
  styleUrls: ['./user-library.component.css'],
})
export class UserLibraryComponent implements OnInit {
  user: any;
  books: any[] = [];
  totalBooks: any;

  constructor(
    private bookService: BookService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    //prende l'userId dall'url tramite params
    this.activatedRoute.paramMap.subscribe((params) => {
      const userId = Number(params.get('userId')); // Converte in number

      this.userService
        .getUserDetails(userId)
        .pipe(
          tap({
            next: (response) => {
              this.user = response.user;
              this.books = response.books;
              this.totalBooks = response.totalBooks;
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
        .subscribe();
    });
  }
  //Cancella singolo libro dalla libreria
  onDelete(userId: string, bookId: string) {
    this.bookService
      .deleteBookFromLibrary(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
            console.log('Book deleted successfully!', response);

            this.books = this.books.filter((book) => book.id !== bookId);
            this.totalBooks -= 1;
            this.snackBar.open('Book deleted', '', {
              duration: 1000,
            });
          },
          error: (error) => {
            console.error('Failed to delete book:', error);
          },
        })
      )
      .subscribe();
  }

  //Reindirizza alla pagina add book
  goAddBook() {
    this.router.navigateByUrl(`user/${this.user.id}/add-book`);
  }

  //Accede al dettaglio della libro presente nella libreria dell'utente
  goBookDetails(bookId: number) {
    this.router.navigateByUrl(`user/${this.user.id}/books/${bookId}`);
  }
}
