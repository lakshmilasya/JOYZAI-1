import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayRecordsComponent } from './views/display-records/display-records.component';

const routes: Routes = [{path : '' , component : DisplayRecordsComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
