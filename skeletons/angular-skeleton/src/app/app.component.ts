import { Component } from '@angular/core';
import { WelcomeComponent } from './components/welcome.component';

@Component({
  selector: 'app-root',
  imports: [WelcomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Angular Skeleton Application';
}
