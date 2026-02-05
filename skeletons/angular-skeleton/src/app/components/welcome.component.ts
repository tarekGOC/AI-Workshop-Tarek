import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  @Input() message: string = 'Welcome!';

  // Using Angular signals for reactive state management
  count = signal(0);

  incrementCount() {
    this.count.update(value => value + 1);
  }
}
