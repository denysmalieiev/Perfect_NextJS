import * as signalR from '@microsoft/signalr';
import { action } from 'mobx';
import AppConfig from './../../config/app.config';
import { from } from 'rxjs';
import { IPricedItem } from '../../interfaces/priced-item.interface';
import { IStashTab } from '../../interfaces/stash.interface';
import { IApiStashTabSnapshot } from '../../interfaces/api/stash-tab-snapshot.interface';
import { IApiPricedItem } from '../../interfaces/api/priceditem.interface';
import { IApiStashTabPricedItem } from '../../interfaces/api/stashtab-priceditem.interface';

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
    return from(
      id
        ? this.connection.invoke(event, params, id)
        : this.connection.invoke(event, params)
    );
  }

  @action
  async streamItems(stashtabs: IApiStashTabPricedItem[]) {
    const subject = new signalR.Subject();
    stashtabs.forEach(async tab => {
      var iteration = 0;
      await this.connection.send('AddPricedItems', subject, tab.stashTabId);
      const intervalHandle = setInterval(() => {
        iteration++;
        subject.next(tab.pricedItems[iteration]);
        if (iteration === tab.pricedItems.length - 1) {
          clearInterval(intervalHandle);
          subject.complete();
        }
      }, 250);
    });
  }
}
