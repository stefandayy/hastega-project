import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../services/book.service';
import { tap } from 'rxjs';
import { Book } from '../model/book.model';

@Component({
  selector: 'app-user-bookdetails',
  templateUrl: './user-bookdetails.component.html',
  styleUrls: ['./user-bookdetails.component.css'],
})
export class UserBookdetailsComponent {
  book!: any;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const userId = Number(params.get('userId')); // Convert to number
      const bookId = Number(params.get('bookId')); // Convert to number

      this.bookService
        .getBookFromLibrary(userId, bookId)
        .pipe(
          tap({
            next: (response) => {
              this.book = response;
              console.log(this.book.user_id);
              console.log(this.book.id);
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
        .subscribe();
    });
  }

  incrementReadings() {
    const userId = this.book.user_id; // Access the user ID from the book object
    const bookId = this.book.id;

    this.bookService
      .incrementReadings(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
            // Update the book object with the updated readings value
            console.log(response);
            this.book.readings += 1;
          },
          error: (error) => {
            console.error(error);
          },
        })
      )
      .subscribe();
  }

  decrementReadings() {
    const userId = this.book.user_id; // Access the user ID from the book object
    const bookId = this.book.id;

    this.bookService
      .decrementReadings(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
            // Update the book object with the updated readings value
            console.log(response);
            this.book.readings -= 1;
          },
          error: (error) => {
            console.error(error);
          },
        })
      )
      .subscribe();
  }
}
