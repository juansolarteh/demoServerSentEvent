import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConcurrencySectionComponent } from "./sections/concurrency-section/concurrency-section.component";
import { ObservableRegistrationSectionComponent } from "./sections/observable-registration-section/observable-registration-section.component";
import { NotificationsComponent } from "./sections/notifications/notifications.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ConcurrencySectionComponent, ObservableRegistrationSectionComponent, NotificationsComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  token = "";
}
