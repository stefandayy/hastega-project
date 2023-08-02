import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { pipe, tap } from 'rxjs';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-user-library',
  templateUrl: './user-library.component.html',
  styleUrls: ['./user-library.component.css'],
})
export class UserLibraryComponent implements OnInit {
  user: any;
  books: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const userId = Number(params.get('userId')); // Convert to number

      this.userService
        .getUserDetails(userId)
        .pipe(
          tap({
            next: (response) => {
              this.user = response.user;
              this.books = response.books;
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
        .subscribe();
    });
  }

  onDelete(userId: string, bookId: string) {
    this.bookService
      .deleteBookFromLibrary(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
            console.log('Book deleted successfully!', response);
            // Handle success, e.g., display a success message, refresh book list, etc.
            this.books = this.books.filter((book) => book.id !== bookId);
          },
          error: (error) => {
            console.error('Failed to delete book:', error);
            // Handle error, e.g., display an error message, etc.
          },
        })
      )
      .subscribe();
  }

  goAddBook() {
    this.router.navigateByUrl(`user/${this.user.id}/add-book`);
  }

  goBookDetails(bookId: number) {
    this.router.navigateByUrl(`user/${this.user.id}/books/${bookId}`);
  }
}
