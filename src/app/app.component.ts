import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventSocketServiceService } from './event-socket-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  eventResource = "hiring";
  resourceOwnerId = "123";
  buttonSave = false;

  constructor(private eventSocketSvc: EventSocketServiceService) { }

  connect() {
    this.eventSocketSvc.connect(this.eventResource, this.resourceOwnerId);
  }
  disconnect() {
    this.eventSocketSvc.disconnect();
  }

  senEditMessage() {
    this.eventSocketSvc.changeStateResponse.subscribe(
      result => {
        if (!result) alert("Un usuario ya esta editando o creando elementos para el empleado " + this.resourceOwnerId);
        else this.buttonSave = true;
      }
    );
    this.eventSocketSvc.changeStateView();
  }
}
