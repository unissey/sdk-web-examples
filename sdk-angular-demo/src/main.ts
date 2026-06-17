import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import "./polyfills";

import {AppModule} from './app/app.module'

const compilerOptions = {
  ngZone: 'noop' as 'noop'
};

platformBrowserDynamic().bootstrapModule(AppModule, compilerOptions)
  .catch(err => console.error(err));
