import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';

interface MessageReply {
  success: boolean,
  state: string
}

@Injectable({
  providedIn: 'root'
})
export class ObservaleRegistrationStompWebSocketService {
  private url = environment.webSocketUrl;
  private webSocket: Client | null = null;
  private token = "";

  ngOnDestroy(): void {
    this.disconnect();
  }
  connect(employeeId: string, token: string) {
    this.token = `Bearer ${token}`;
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

      this.webSocket?.subscribe(`/topic/on-registration-employee/${employeeId}`, () => {}, 
      {
        Authorization: this.token
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

