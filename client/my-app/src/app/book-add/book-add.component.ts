import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../model/book.model';
import { BookService } from '../services/book.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-book-add',
  templateUrl: './book-add.component.html',
  styleUrls: ['./book-add.component.css'],
})
export class BookAddComponent implements OnInit {
  userId!: number;
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private bookService: BookService,
    private router: ActivatedRoute
  ) {
    this.bookForm = this.fb.group({
      title: ['haa', Validators.required],
      author: ['ham', Validators.required],
      description: ['eeqe', Validators.required],
      isbn: ['1212113', Validators.required],
      readings: [0, Validators.required],
    });
  }
  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.userId = params['userId'];
    });
  }

  onSubmit() {
    if (this.bookForm.valid) {
      const book: Book = this.bookForm.value;
      console.log(book);
      console.log(this.userId);
      this.bookService
        .addBookToUserLibrary(this.userId, book)
        .pipe(
          tap({
            next: (response) => {
              console.log('User added successfully', response);
              // Clear the form after successful submission
              this.bookForm.reset();
              this.route.navigateByUrl(`user/${this.userId}`);
            },
            error: (error) => {
              console.error('Error adding user', error);
            },
          })
        )
        .subscribe();
    }
  }
}
