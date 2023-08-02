import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css'],
})
export class UserAddComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const user: User = this.userForm.value;
      this.userService
        .addUser(user)
        .pipe(
          tap({
            next: (response) => {
              console.log('User added successfully', response);
              // Clear the form after successful submission
              this.userForm.reset();
              this.router.navigateByUrl('home');
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
