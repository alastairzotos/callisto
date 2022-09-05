import { CallistoResponse, CEventEmitter } from '@bitmetro/callisto';
import * as WebSocket from 'ws';

interface ConnectionOptions {
  retryTimeout?: number;
}

export class CallistoClient {
  public onConnected = new CEventEmitter<() => void>();
  public onMessage = new CEventEmitter<(response: CallistoResponse) => void>();
  public onClose = new CEventEmitter<() => void>();

  private ws: WebSocket | undefined;

  constructor(private readonly connectionOptions: ConnectionOptions) { }

  sendTranscript(transcript: string) {
    this.ws?.send(transcript);
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.addEventListener('open', () => {
      this.onConnected.emit();
    })

    this.ws.addEventListener('message', msg => {
      const response = JSON.parse(msg.data.toString()) as CallistoResponse;
      this.onMessage.emit(response);
    })

    this.ws.addEventListener('close', () => {
      this.onClose.emit();
      setTimeout(() => this.connect(), this.connectionOptions.retryTimeout || 3000);
    })

    this.ws.addEventListener('error', () => { })
  }
}
