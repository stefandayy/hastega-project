import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-user-bookdetails',
  templateUrl: './user-bookdetails.component.html',
  styleUrls: ['./user-bookdetails.component.css'],
})
export class UserBookdetailsComponent {
  book!: any;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const userId = Number(params.get('userId'));
      const bookId = Number(params.get('bookId'));

      //prende singolo libro dalla libreria
      this.bookService
        .getBookFromLibrary(userId, bookId)
        .pipe(
          tap({
            next: (response) => {
              this.book = response;
              console.log(this.book);
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
        .subscribe();
    });
  }

  //Incrementa readings
  incrementReadings() {
    const userId = this.book.user_id;
    const bookId = this.book.id;

    this.bookService
      .incrementReadings(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
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

  //decrementa readings
  decrementReadings() {
    const userId = this.book.user_id;
    const bookId = this.book.id;

    this.bookService
      .decrementReadings(userId, bookId)
      .pipe(
        tap({
          next: (response) => {
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

  goBack() {
    this.router.navigateByUrl(`user/${this.book.user_id}`);
  }
}
