import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapturePageComponent } from './capture-pages.component';

const routes: Routes = [
  { path: 'video-recorder', component: CapturePageComponent, data: { page: 'video' } },
  { path: 'selfie', component: CapturePageComponent, data: { page: 'selfie' } },
  { path: 'reference', component: CapturePageComponent, data: { page: 'reference' } },
  { path: 'full-capture', component: CapturePageComponent, data: { page: 'full' } },
  { path: 'iad-video-recorder', component: CapturePageComponent, data: { page: 'iad' } },
  { path: '', pathMatch: 'full', redirectTo: 'video-recorder' },
  { path: '**', redirectTo: 'video-recorder' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
