import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventSocketServiceService } from './event-socket-service.service';
import { StompWebSocketService } from './stomp-web-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  eventResource = "HIRING";
  resourceOwnerId = "123";
  buttonSave = false;
  token = "";

  constructor(private eventSocketSvc: StompWebSocketService) {
    this.eventSocketSvc.changeStateResponse.subscribe(
      result => {
        if (!result.success){
          alert("Un usuario ya esta editando o creando elementos para el empleado " + this.resourceOwnerId);
        }else{
          if (result.state == "ON_WRITE"){
            this.buttonSave = true;
          } else {
            this.buttonSave = false;
          }
        }
      }
    );
  }

  connect() {
    this.eventSocketSvc.connect(this.eventResource, this.resourceOwnerId, this.token);
  }
  disconnect() {
    this.eventSocketSvc.disconnect();
  }

  sendEditMessage() {
    this.eventSocketSvc.changeStateView("ON_WRITE");
  }

  sendCancelMessage() {
    this.eventSocketSvc.changeStateView("READ");
  }
}
