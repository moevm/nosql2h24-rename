import {Component} from "@angular/core";
import {TuiTabs, TuiTabsHorizontal} from "@taiga-ui/kit";
import {TuiRoot} from "@taiga-ui/core";
import {MainPageComponent} from "./components/main-page/main-page.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TuiTabsHorizontal,
    TuiRoot,
    MainPageComponent,
    TuiTabs,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent{
  activeTab = 0;

}
