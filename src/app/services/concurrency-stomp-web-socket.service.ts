import { Injectable } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { Subject, take } from 'rxjs';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';

interface MessageReply {
  success: boolean,
  state: string
}

@Injectable({
  providedIn: 'root'
})
export class ConcurrencyStompWebSocketService {
  private url = environment.webSocketUrl;
  private webSocket: Client | null = null;
  private stateChange: Subject<MessageReply> = new Subject<MessageReply>();
  private resource = "";
  private resourceId = "";
  private token = "";
  private uniqueId = "";
  private callbackSubsccription: StompSubscription | undefined;


  get changeStateResponse() {
    return this.stateChange.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
  //brokerURL: `${this.url}?resourceId=${resourceOwnerId}&eventResource=${eventResource}`,
  connect(resource: string, resourceId: string, token: string) {
    this.resource = resource;
    this.resourceId = resourceId;
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

      this.callbackSubsccription = this.webSocket?.subscribe(`/user/${this.uniqueId}/concurrency-callback`, (message: Message) => {
        const sessionId = message.body;
        this.webSocket?.subscribe(`/topic/reload-resource/${resource}/${resourceId}`, (message: Message) => {
          console.log('Mensaje recibido:', message.body);
        }, {
          Authorization: this.token
        });

        this.webSocket?.subscribe(`/user/${sessionId}/reply`, (message: Message) => {
          const response: MessageReply = JSON.parse(message.body);
          this.stateChange.next(response);
          console.log('Mensaje recibido:', response);
        }, {
          Authorization: this.token
        });

        this.callbackSubsccription?.unsubscribe();
        this.callbackSubsccription = undefined;
      }, {
        Authorization: this.token
      });

      this.webSocket?.publish({
        destination: `/app/completed-concurrency-subscription`,
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

  // Método para enviar un mensaje por WebSocket
  changeStateView(action: string) {
    console.log('Enviando mensaje por WebSocket...');
    if (this.webSocket && this.webSocket.active) {
      this.webSocket.publish({
        destination: `/app/${this.resource}/${this.resourceId}`,
        body: action,
        headers: {
          "Authorization": this.token
        }
      });
    }
  }

  disconnect() {
    console.log('Desconectando WebSocket...');
    if (this.webSocket && this.webSocket.active) {
      this.webSocket.deactivate();
      this.webSocket = null;
    }
  }
}

