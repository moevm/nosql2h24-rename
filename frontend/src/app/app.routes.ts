import { Routes } from '@angular/router';
import { MainPageComponent } from "./components/main-page/main-page.component";
import { ToponymComponent } from './components/main-page/toponym/toponym.component';

export const routes: Routes = [{
  path: '', component: MainPageComponent,
},
{ path: 'toponym/:id', component: ToponymComponent }];
