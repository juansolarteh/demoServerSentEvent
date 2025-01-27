import { Injectable } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { OnRegistrationEmployee } from '../models/OnEmployeeRegistration';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private url = environment.webSocketUrl;
  private webSocket: Client | null = null;
  private _notifications: Subject<OnRegistrationEmployee[]> = new Subject<OnRegistrationEmployee[]>();
  private token = "";
  private callbackSubsccription: StompSubscription | undefined;
  private uniqueId = "";

  get notifications() {
    return this._notifications.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(token: string) {
    this.token = `Bearer ${token}`;
    this.uniqueId = uuidv4();
    if (this.webSocket) this.disconnect();
    this.webSocket = new Client({
      brokerURL: this.url,
      connectHeaders: {
        Authorization: this.token, // Añadir token en los headers
      },
      reconnectDelay: 5000, // Intentar reconectar cada 5 segundos si la conexión se pierde
      debug: (str) => {
        console.log(str);
      },
      webSocketFactory: () => new SockJS(this.url, null, {
        transports: ['websocket'] // Limitar los transportes a WebSocket
      }),
    });

    // Establecer el comportamiento cuando la conexión esté lista
    this.webSocket.onConnect = (frame) => {
      console.log('Conexión STOMP establecida:', frame);

      this.callbackSubsccription = this.webSocket?.subscribe(`/user/${this.uniqueId}/notification-callback`, (message: Message) => {
        const response: OnRegistrationEmployee[] = JSON.parse(message.body);
        this._notifications.next(response);

        this.webSocket?.subscribe(`/topic/notification/on-registration-employee`, (message: Message) => {
          console.log('Mensaje recibido:', message.body);
          const response: OnRegistrationEmployee[] = JSON.parse(message.body);
          this._notifications.next(response);
        },
          {
            Authorization: this.token
          });

        this.callbackSubsccription?.unsubscribe();
        this.callbackSubsccription = undefined;
      }, {
        Authorization: this.token
      });

      this.webSocket?.publish({
        destination: `/app/completed-notification-subscription`,
        body: "READ",
        headers: {
          Authorization: this.token,
          uniqueId: this.uniqueId
        }
      });
    };

    this.webSocket.onStompError = (frame) => {
      console.error('Error en STOMP:', frame.headers['message']);
      console.error('Detalles del error:', frame.body);
    };

    // Conectar al WebSocket
    this.webSocket.activate();
  }

  disconnect() {
    console.log('Desconectando WebSocket...');
    if (this.webSocket && this.webSocket.active) {
      this.webSocket.deactivate();
      this.webSocket = null;
    }
  }
}

