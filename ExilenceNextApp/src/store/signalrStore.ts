import { AxiosError } from 'axios';
import { action, observable, reaction, runInAction } from 'mobx';
import { fromStream } from 'mobx-utils';
import { from, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import uuid from 'uuid';
import { stores } from '..';
import { IApiGroup } from '../interfaces/api/api-group.interface';
import { IApiPricedItemsUpdate } from '../interfaces/api/api-priced-items-update.interface';
import { IApiProfile } from '../interfaces/api/api-profile.interface';
import { IApiSnapshot } from '../interfaces/api/api-snapshot.interface';
import { IApiStashTabPricedItem } from '../interfaces/api/api-stashtab-priceditem.interface';
import { Group } from './domains/group';
import { SignalrHub } from './domains/signalr-hub';
import { NotificationStore } from './notificationStore';
import { RequestQueueStore } from './requestQueueStore';
import { UiStateStore } from './uiStateStore';

export interface ISignalrEvent<T> {
  method: string;
  object?: T | T[];
  stream?: T[];
  id?: string;
}

export class SignalrStore {
  @observable online: boolean = false;
  @observable events: string[] = [];
  @observable activeGroup?: Group = undefined;
  @observable activeAccounts: string[] = [];

  constructor(
    private uiStateStore: UiStateStore,
    private notificationStore: NotificationStore,
    private requestQueueStore: RequestQueueStore,
    public signalrHub: SignalrHub
  ) {
    reaction(
      () => signalrHub!.connection,
      (_conn, reaction) => {
        if (_conn) {
          signalrHub.onEvent<IApiGroup>('OnJoinGroup', group => {
            this.setActiveGroup(new Group(group));
          });
          signalrHub.onEvent<IApiGroup>('OnLeaveGroup', group => {
            this.setActiveGroup(new Group(group));
          });
          signalrHub.onEvent<string, string, IApiSnapshot>(
            'OnAddSnapshot',
            (connectionId, profileId, snapshot) => {
              if (this.activeGroup && snapshot && profileId) {
                console.log('Before OnAddSnapshot', this.activeGroup);
                this.addSnapshotToConnection(snapshot, connectionId, profileId);
              }
            }
          );
          signalrHub.onEvent<IApiPricedItemsUpdate>(
            'OnAddPricedItems',
            pricedItemsUpdate => {
              if (this.activeGroup) {
                console.log('Before OnAddPricedItems', this.activeGroup);
                this.addPricedItemsToStashTab(pricedItemsUpdate);
              }
            }
          );
          signalrHub.onEvent<string, string>(
            'OnRemoveAllSnapshots',
            (connectionId, profileId) => {
              if (this.activeGroup && profileId) {
                console.log('Before OnRemoveAllSnapshots', this.activeGroup);
                // todo: should remove all snapshots in group
              }
            }
          );
        }
        reaction.dispose();
      }
    );
  }

  @action
  selectAccount(uuid: string) {
    const foundUuid = this.activeAccounts.find(aid => aid === uuid);
    if (!foundUuid) {
      this.activeAccounts.push(uuid);
    }
  }

  @action
  deselectAccount(uuid: string) {
    const foundUuid = this.activeAccounts.find(aid => aid === uuid);
    if (foundUuid) {
      const index = this.activeAccounts.indexOf(foundUuid);
      this.activeAccounts.splice(index, 1);
    }
  }

  @action
  handleRequest<T>(
    event: ISignalrEvent<T>,
    successCallback: () => void,
    failCallback: (e: Error) => void
  ) {
    if (this.online) {
      return (event.stream
        ? this.signalrHub.stream(event.method, event.stream, event.id)
        : this.signalrHub.invokeEvent(event.method, event.object, event.id)
      ).pipe(
        map(() => {
          return successCallback();
        }),
        catchError((e: Error) => {
          this.requestQueueStore.queueFailedEvent(event);
          return of(failCallback(e));
        })
      );
    } else {
      this.requestQueueStore.queueFailedEvent(event);
      return of(failCallback(new Error('error:not_connected')));
    }
  }

  // todo: test this thoroughly
  @action
  addSnapshotToConnection(
    snapshot: IApiSnapshot,
    connectionId: string,
    profileId: string
  ) {
    const connection = this.activeGroup!.connections.find(
      c => c.connectionId === connectionId
    );

    if (connection) {
      const connIndex = this.activeGroup!.connections.indexOf(connection);
      const profile = connection.account.profiles.find(
        p => p.uuid === profileId
      );
      if (profile) {
        runInAction(() => {
          profile.snapshots.unshift(snapshot);
          this.activeGroup!.connections[connIndex] = connection;
        });
        console.log('After AddSnapshot', this.activeGroup);
        this.addSnapshotToConnectionSuccess();
      } else {
        this.addSnapshotToConnectionFail(new Error('error:profile_not_found'));
      }
    } else {
      this.addSnapshotToConnectionFail(new Error('error:connection_not_found'));
    }
  }

  // todo: test this thoroughly
  @action
  addPricedItemsToStashTab(pricedItemsUpdate: IApiPricedItemsUpdate) {
    const connection = this.activeGroup!.connections.find(
      c => c.connectionId === pricedItemsUpdate.connectionId
    );

    if (connection) {
      const connIndex = this.activeGroup!.connections.indexOf(connection);
      const profile = connection.account.profiles.find(
        p => p.uuid === pricedItemsUpdate.profileId
      );
      if (profile) {
        const snapshot = profile.snapshots.find(
          ss => ss.uuid === pricedItemsUpdate.snapshotId
        );

        snapshot!.tabsFetchedCount++;

        const stashTab = snapshot!.stashTabs.find(
          st => st.uuid === pricedItemsUpdate.stashTabId
        );

        stashTab!.pricedItems = stashTab!.pricedItems.concat(
          pricedItemsUpdate.pricedItems
        );

        this.activeGroup!.connections[connIndex] = connection;

        console.log('After AddPricedItems', this.activeGroup);
        this.addSnapshotToConnectionSuccess();
      } else {
        this.addSnapshotToConnectionFail(new Error('error:profile_not_found'));
      }
    } else {
      this.addSnapshotToConnectionFail(new Error('error:connection_not_found'));
    }
  }

  @action
  addSnapshotToConnectionFail(e: Error) {
    this.notificationStore.createNotification(
      'retrieve_snapshot',
      'error',
      false,
      e
    );
  }

  @action
  addSnapshotToConnectionSuccess() {
    this.notificationStore.createNotification('retrieve_snapshot', 'success');
  }

  @action
  setOnline(online: boolean) {
    this.online = online;
    if (!online) {
      this.uiStateStore.toggleGroupOverview(false);
    }
  }

  /* #region Group */
  @action
  joinGroup(groupName: string, password: string) {
    if (this.online) {
      fromStream(
        this.signalrHub
          .invokeEvent<IApiGroup>('JoinGroup', <IApiGroup>{
            uuid: uuid.v4(),
            name: groupName,
            password: password,
            created: new Date(),
            connections: []
          })
          .pipe(
            map((g: IApiGroup) => {
              this.setActiveGroup(new Group(g));
              this.joinGroupSuccess();
            }),
            catchError((e: Error) => of(this.joinGroupFail(e)))
          )
      );
    } else {
      this.joinGroupFail(new Error('error:not_connected'));
    }
  }

  @action
  setActiveGroup(g: Group | undefined) {
    this.activeGroup = g;
  }

  @action
  joinGroupFail(e: Error | AxiosError) {
    this.notificationStore.createNotification(
      'api_join_group',
      'error',
      false,
      e
    );
    this.uiStateStore.groupError = e;
  }

  @action
  joinGroupSuccess() {
    this.notificationStore.createNotification('api_join_group', 'success');
    this.uiStateStore.setGroupDialogOpen(false);
  }

  @action
  leaveGroup() {
    if (!this.activeGroup) {
      this.leaveGroupFail(new Error('error:not_in_group'));
      return;
    }
    if (this.online) {
      fromStream(
        this.signalrHub
          .invokeEvent<IApiGroup>('LeaveGroup', <IApiGroup>{
            uuid: uuid.v4(),
            name: this.activeGroup.name,
            created: new Date(),
            connections: []
          })
          .pipe(
            map((g: IApiGroup) => {
              this.setActiveGroup(undefined);
              this.leaveGroupSuccess();
            }),
            catchError((e: AxiosError) => of(this.leaveGroupFail(e)))
          )
      );
    } else {
      this.leaveGroupFail(new Error('error:not_connected'));
    }
  }

  @action
  leaveGroupFail(e: AxiosError | Error) {
    this.notificationStore.createNotification(
      'api_leave_group',
      'error',
      false,
      e
    );
  }

  @action
  leaveGroupSuccess() {
    this.notificationStore.createNotification('api_leave_group', 'success');
  }

  @action
  groupExists(groupName: string) {
    if (this.online) {
      fromStream(
        this.signalrHub.invokeEvent<string>('GroupExists', groupName).pipe(
          map((name: string) => {
            if (name) {
              this.uiStateStore.setGroupExists(true);
            } else {
              this.uiStateStore.setGroupExists(false);
            }
            return this.groupExistsSuccess();
          }),
          catchError((e: AxiosError) => of(this.groupExistsFail(e)))
        )
      );
    } else {
      this.groupExistsFail(new Error('error:not_connected'));
    }
  }

  @action
  groupExistsSuccess() {}

  @action
  groupExistsFail(e: AxiosError | Error) {
    this.notificationStore.createNotification(
      'api_group_exists',
      'error',
      false,
      e
    );
  }

  /* #endregion */

  /* #region Profile */
  @action
  createProfile(profile: IApiProfile) {
    const request: ISignalrEvent<IApiProfile> = {
      method: 'AddProfile',
      object: profile
    };

    fromStream(
      this.handleRequest(
        request,
        this.createProfileSuccess,
        this.createProfileFail
      )
    );
  }

  @action
  createProfileFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_create_profile',
      'error',
      false,
      e
    );
  }

  @action
  createProfileSuccess() {
    stores.notificationStore.createNotification(
      'api_create_profile',
      'success'
    );
  }

  @action
  updateProfile(profile: IApiProfile) {
    const request: ISignalrEvent<IApiProfile> = {
      method: 'EditProfile',
      object: profile
    };

    fromStream(
      this.handleRequest(
        request,
        this.updateProfileSuccess,
        this.updateProfileFail
      )
    );
  }

  @action
  updateProfileFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_update_profile',
      'error',
      false,
      e
    );
  }

  @action
  updateProfileSuccess() {
    stores.notificationStore.createNotification(
      'api_update_profile',
      'success'
    );
  }

  @action
  removeProfile(uuid: string) {
    const request: ISignalrEvent<string> = {
      method: 'RemoveProfile',
      object: uuid
    };

    fromStream(
      this.handleRequest(
        request,
        this.removeProfileSuccess,
        this.removeProfileFail
      )
    );
  }

  @action
  removeProfileFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_remove_profile',
      'error',
      false,
      e
    );
  }

  @action
  removeProfileSuccess() {
    stores.notificationStore.createNotification(
      'api_remove_profile',
      'success'
    );
  }
  /* #endregion */

  /* #region Snapshot */
  @action
  createSnapshot(snapshot: IApiSnapshot, profileId: string) {
    const request: ISignalrEvent<IApiSnapshot> = {
      method: 'AddSnapshot',
      object: snapshot,
      id: profileId
    };

    return this.handleRequest(
      request,
      this.createSnapshotSuccess,
      this.createSnapshotFail
    );
  }

  @action
  createSnapshotFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_create_snapshot',
      'error',
      false,
      e
    );
  }

  @action
  createSnapshotSuccess() {
    stores.notificationStore.createNotification(
      'api_create_snapshot',
      'success'
    );
  }

  @action
  removeSnapshot(uuid: string) {
    const request: ISignalrEvent<string> = {
      method: 'RemoveSnapshot',
      object: uuid
    };

    fromStream(
      this.handleRequest(
        request,
        this.removeSnapshotSuccess,
        this.removeSnapshotFail
      )
    );
  }

  @action
  removeSnapshotFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_remove_snapshot',
      'error',
      false,
      e
    );
  }

  @action
  removeAllSnapshotsSuccess() {
    stores.notificationStore.createNotification(
      'api_remove_all_snapshots',
      'success'
    );
  }

  @action
  removeAllSnapshots(uuid: string) {
    const request: ISignalrEvent<string> = {
      method: 'RemoveAllSnapshots',
      object: uuid
    };

    fromStream(
      this.handleRequest(
        request,
        this.removeSnapshotSuccess,
        this.removeSnapshotFail
      )
    );
  }

  @action
  removeAllSnapshotFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_remove_all_snapshots',
      'error',
      false,
      e
    );
  }

  @action
  removeSnapshotSuccess() {
    stores.notificationStore.createNotification(
      'api_remove_snapshot',
      'success'
    );
  }

  @action
  uploadItems(
    stashtabs: IApiStashTabPricedItem[],
    profileId: string,
    snapshotId: string
  ) {
    fromStream(
      from(stashtabs).pipe(
        concatMap(st => {
          const request: ISignalrEvent<IApiPricedItemsUpdate> = {
            method: 'AddPricedItems',
            object: {
              profileId: profileId,
              stashTabId: st.uuid,
              snapshotId: snapshotId,
              pricedItems: st.pricedItems
            } as IApiPricedItemsUpdate
          };
          return this.handleRequest(
            request,
            this.uploadItemsSuccess,
            this.uploadItemsFail
          ).pipe(
            map(() => this.uploadItemsSuccess),
            catchError((e: Error) => of(this.uploadItemsFail(e)))
          );
        })
      )
    );
  }

  @action
  uploadItemsFail(e: Error) {
    stores.notificationStore.createNotification(
      'api_upload_items',
      'error',
      false,
      e
    );
  }

  @action
  uploadItemsSuccess() {
    stores.notificationStore.createNotification('api_upload_items', 'success');
  }

  /* #endregion */
}
