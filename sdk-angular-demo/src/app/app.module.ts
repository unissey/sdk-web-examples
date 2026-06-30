import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CapturePageComponent } from './capture-pages.component';
import { UnisseySdkModule } from "@unissey-web/sdk-angular";

@NgModule({
  declarations: [
    AppComponent,
    CapturePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    UnisseySdkModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
