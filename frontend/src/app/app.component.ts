import {Component} from "@angular/core";
import {TuiTabs, TuiTabsHorizontal} from "@taiga-ui/kit";
import {TuiRoot} from "@taiga-ui/core";
import {RouterModule, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TuiTabsHorizontal,
    TuiRoot,
    TuiTabs,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent{
  activeTab = 0;

}
