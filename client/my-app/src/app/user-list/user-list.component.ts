import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  totalBooks: number = 0;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      console.log(this.users);
    });
  }
  deleteUser(userId: number) {
    this.userService
      .deleteUser(userId)
      .pipe(
        tap({
          next: (response) => {
            console.log(response); // Success message from the server
            this.users = this.users.filter((user) => user.id !== userId);
          },
          error: (error) => {
            console.error(error); // Handle error response from the server
          },
        })
      )
      .subscribe();
  }

  goUserLibrary(userId: number) {
    this.router.navigateByUrl('user/' + userId);
  }
}
