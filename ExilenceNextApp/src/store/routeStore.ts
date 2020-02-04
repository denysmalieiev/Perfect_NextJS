import { action, observable } from 'mobx';
import { fromStream } from 'mobx-utils';
import { RootStore } from './rootStore';

export class RouteStore {
  @observable redirectedTo: string | undefined = undefined;

  constructor(private rootStore: RootStore) {}

  @action
  redirect(path: string) {
    if (path === '/login') {
      fromStream(this.rootStore.signalrHub.stopConnection());
    }
    this.redirectedTo = path;
  }
}
