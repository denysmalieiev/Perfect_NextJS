import * as signalR from '@microsoft/signalr';
import { action } from 'mobx';
import AppConfig from './../../config/app.config';

export class SignalrHub {
  connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${AppConfig.baseUrl}/hub`)
    .build();

  constructor() {}

  @action
  startConnection(token: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${AppConfig.baseUrl}/hub`, { accessTokenFactory: () => token })
      .build();

    this.connection.start().catch((err: string) => document.write(err));
  }

  @action
  onEvent<T>(event: string, callback: (response: T) => void) {
    this.connection.on(event, callback);
  }

  @action
  sendEvent<T>(event: string, params: T, id?: string) {
    id
      ? this.connection.send(event, params, id)
      : this.connection.send(event, params);
  }
}
