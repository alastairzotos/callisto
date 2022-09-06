import { CallistoResponse, CEventEmitter } from '@bitmetro/callisto';
import { client as WebSocketClient, connection } from 'websocket';

interface ICallistoClient {
  sendTranscript(transcript: string): void;
  connect(): void;
}

interface ConnectionOptions {
  host: string;
  retryTimeout?: number;
}

export class CallistoClient implements ICallistoClient {
  public onConnected = new CEventEmitter<() => void>();
  public onMessage = new CEventEmitter<(response: CallistoResponse) => void>();
  public onClose = new CEventEmitter<() => void>();

  constructor(protected readonly connectionOptions: ConnectionOptions) { }

  sendTranscript(_: string): void {}
  connect(): void {}
}

export class CallistoClientNode extends CallistoClient {
  private conn: connection | undefined;
  
  sendTranscript(transcript: string) {
    this.conn?.send(transcript);
  }

  connect() {
    const ws = new WebSocketClient();

    ws.on('connect', conn => {
      this.conn = conn;
      this.onConnected.emit();

      conn.on('close', () => {
        this.onClose.emit();
        setTimeout(() => this.connect(), this.connectionOptions.retryTimeout || 3000);
      })

      conn.on('message', msg => {
        if (msg.type === 'utf8') {
          const response = JSON.parse(msg.utf8Data) as CallistoResponse;
          this.onMessage.emit(response);
        }
      })
    })

    ws.connect(this.connectionOptions.host);
  }
}

export class CallistoClientBrowser extends CallistoClient {
  private ws: WebSocket | undefined;

  sendTranscript(transcript: string) {
    this.ws?.send(transcript);
  }

  connect() {
    this.ws = new WebSocket(this.connectionOptions.host);

    this.ws.onclose = () => {
      this.onClose.emit();
      setTimeout(() => this.connect(), this.connectionOptions.retryTimeout || 3000);
    }

    this.ws.onmessage = msg => {
      const response = JSON.parse(msg.data) as CallistoResponse;
      this.onMessage.emit(response);
    }

    this.onConnected.emit();
  }
}