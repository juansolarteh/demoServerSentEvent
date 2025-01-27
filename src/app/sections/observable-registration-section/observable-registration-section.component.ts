import { Component, Input } from '@angular/core';
import { ObservaleRegistrationStompWebSocketService } from '../../services/observable-registration-stomp-web-socket.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-observable-registration-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './observable-registration-section.component.html',
})
export class ObservableRegistrationSectionComponent {
  employeeId = "123";
  buttonSave = false;
  @Input({required: true}) token = "";

  constructor(private observaleRegistrationWebSocketSvc: ObservaleRegistrationStompWebSocketService) {}

  connect() {
    this.observaleRegistrationWebSocketSvc.connect(this.employeeId, this.token);
  }
  disconnect() {
    this.observaleRegistrationWebSocketSvc.disconnect();
  }
}
