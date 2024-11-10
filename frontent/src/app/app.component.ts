import {Component} from "@angular/core";
import {TuiTabs, TuiTabsHorizontal} from "@taiga-ui/kit";
import {TuiRoot} from "@taiga-ui/core";
import {MainPageComponent} from "./main-page/main-page.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TuiTabsHorizontal,
    TuiRoot,
    MainPageComponent,
    TuiTabs
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent{
  activeTab = 0;

}
