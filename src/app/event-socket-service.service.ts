import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, timeInterval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventSocketServiceService implements OnDestroy {
  private url = 'ws://localhost:8090/';
  private webSocket: WebSocket | null = null;
  private stateChange: Subject<boolean> = new Subject<boolean>();

  get changeStateResponse(){
    return this.stateChange.asObservable().pipe(take(1));
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(eventResource: string, resourceOwnerId: string) {
    if (this.webSocket) this.disconnect();
    this.webSocket = new WebSocket(`${this.url}event-concurrency?resourceId=${resourceOwnerId}&eventResource=${eventResource}`);
    this.webSocket.onmessage = (event) => {
      const message: string = event.data;
      switch (message) {
        case 'exist-resource-session-on-write': alert("Un usuario ya esta editando o creando elementos para el empleado " + resourceOwnerId); break;
        case 'state-change-executed': this.stateChange.next(true); break;
        default: console.log(message);
      }
    };
  }

  changeStateView() {
    if (this.webSocket) {
      this.webSocket.send('on-write');
    }
  }

  disconnect() {
    this.webSocket?.close();
    this.webSocket = null;
  }
}
