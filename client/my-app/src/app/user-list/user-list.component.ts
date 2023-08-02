import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  //Fetch degli utenti
  fetchUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      console.log(this.users);
    });
  }

  //Cancella singolo utente
  deleteUser(userId: number) {
    this.userService
      .deleteUser(userId)
      .pipe(
        tap({
          next: (response) => {
            console.log(response);
            this.users = this.users.filter((user) => user.id !== userId);
            this.snackBar.open('User deleted', '', {
              duration: 1000,
            });
          },
          error: (error) => {
            console.error(error);
          },
        })
      )
      .subscribe();
  }

  // Accede alla libreria del singolo utente
  goUserLibrary(userId: number) {
    this.router.navigateByUrl('user/' + userId);
  }
}
