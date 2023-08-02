import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserAddComponent } from './user-add/user-add.component';
import { UserLibraryComponent } from './user-library/user-library.component';
import { UserBookdetailsComponent } from './user-bookdetails/user-bookdetails.component';
import { BookAddComponent } from './book-add/book-add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'home', component: UserListComponent },
  { path: 'user-add', component: UserAddComponent },
  { path: 'user/:userId', component: UserLibraryComponent },
  { path: 'user/:userId/add-book', component: BookAddComponent },
  { path: 'user/:userId/books/:bookId', component: UserBookdetailsComponent },
  { path: 'user-add', component: UserAddComponent },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
