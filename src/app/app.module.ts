import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisplayRecordsComponent } from './views/display-records/display-records.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { KeyTransformPipe } from './pipes/key-transform.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DisplayRecordsComponent,
    FileUploaderComponent,
    KeyTransformPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
