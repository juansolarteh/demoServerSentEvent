import { Component, Input } from '@angular/core';
import { ConcurrencyStompWebSocketService } from '../../services/concurrency-stomp-web-socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-concurrency-section',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './concurrency-section.component.html',
})
export class ConcurrencySectionComponent {
  eventResource = "HIRING";
  resourceOwnerId = "123";
  buttonSave = false;
  @Input({required: true}) token = "";

  constructor(private concurrencyWebSocketSvc: ConcurrencyStompWebSocketService) {
    this.concurrencyWebSocketSvc.changeStateResponse.subscribe(
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
    this.concurrencyWebSocketSvc.connect(this.eventResource, this.resourceOwnerId, this.token);
  }
  disconnect() {
    this.concurrencyWebSocketSvc.disconnect();
  }

  sendEditMessage() {
    this.concurrencyWebSocketSvc.changeStateView("ON_WRITE");
  }

  sendCancelMessage() {
    this.concurrencyWebSocketSvc.changeStateView("READ");
  }
}
