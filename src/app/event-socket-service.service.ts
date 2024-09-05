import { Injectable, OnDestroy } from '@angular/core';
import { Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventSocketServiceService implements OnDestroy {
  private url = 'ws://localhost:8080/event-concurrency';
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
    this.webSocket = new WebSocket(`${this.url}?resourceId=${resourceOwnerId}&eventResource=${eventResource}`);
    this.webSocket.onmessage = (event) => {
      const message: string = event.data;
      switch (message) {
        case 'exist-resource-session-on-write': this.stateChange.next(false); break;
        case 'state-change-executed': this.stateChange.next(true); break;
        case 'reload-resource': console.log(message); break;
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
