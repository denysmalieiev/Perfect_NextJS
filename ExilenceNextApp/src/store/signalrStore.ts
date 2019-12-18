import { SignalrHub } from './domains/signalr-hub';
import { action, observable, reaction, runInAction } from 'mobx';
import { Group } from './domains/group';
import { IGroup } from '../interfaces/group.interface';
import { Profile } from './domains/profile';
import { stores } from '..';
import { Snapshot } from './domains/snapshot';
import { IApiSnapshot } from '../interfaces/api/snapshot.interface';
import { fromStream } from 'mobx-utils';
import { map, catchError } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { IApiStashTabSnapshot } from '../interfaces/api/stash-tab-snapshot.interface';
import { IApiPricedItem } from '../interfaces/api/priceditem.interface';
import { IApiStashTabPricedItem } from '../interfaces/api/stashtab-priceditem.interface';
import { NotificationStore } from './notificationStore';

export class SignalrStore {
  signalrHub: SignalrHub = new SignalrHub();

  @observable events: string[] = [];
  @observable activeGroup?: Group = undefined;

  constructor(private notificationStore: NotificationStore) {
    reaction(
      () => this.activeGroup,
      _data => {
        if (this.activeGroup) {
          alert(`joined group ${this.activeGroup.name}`);
        }
      }
    );
  }

  /* #region Group */
  @action
  joinGroup(groupName: string) {
    fromStream(
      this.signalrHub.sendEvent<string>('JoinGroup', groupName).pipe(
        map((g: IGroup) => {
          this.activeGroup = new Group(g);
          this.joinGroupSuccess();
        }),
        catchError((e: Error) => of(this.joinGroupFail(e)))
      )
    );
  }

  @action
  joinGroupFail(e: Error) {
    this.notificationStore.createNotification('api_join_group', 'error', false, e);
  }

  @action
  joinGroupSuccess() {
    this.notificationStore.createNotification('api_join_group', 'success');
  }
  /* #endregion */

  /* #region Profile */
  @action
  createProfile(profile: Profile) {
    fromStream(
      this.signalrHub.sendEvent<Profile>('AddProfile', profile).pipe(
        map((p: Profile) => {
          this.createProfileSuccess();
        }),
        catchError((e: Error) => of(this.createProfileFail(e)))
      )
    );
  }

  @action
  createProfileFail(e: Error) {
    this.notificationStore.createNotification('api_create_profile', 'error', false, e);
  }

  @action
  createProfileSuccess() {
    this.notificationStore.createNotification('api_create_profile', 'success');
  }

  @action
  updateProfile(profile: Profile) {
    fromStream(
      this.signalrHub.sendEvent<Profile>('EditProfile', profile).pipe(
        map((res: Profile) => {
          this.updateProfileSuccess();
        }),
        catchError((e: Error) => of(this.updateProfileFail(e)))
      )
    );
  }

  @action
  updateProfileFail(e: Error) {
    this.notificationStore.createNotification('api_update_profile', 'error', false, e);
  }

  @action
  updateProfileSuccess() {
    this.notificationStore.createNotification('api_update_profile', 'success');
  }

  @action
  removeProfile(uuid: string) {
    fromStream(
      this.signalrHub.sendEvent<string>('RemoveProfile', uuid).pipe(
        map((p: Profile) => {
          this.removeProfileSuccess();
        }),
        catchError((e: Error) => of(this.removeProfileFail(e)))
      )
    );
  }

  @action
  removeProfileFail(e: Error) {
    this.notificationStore.createNotification('api_remove_profile', 'error', false, e);
  }

  @action
  removeProfileSuccess() {
    this.notificationStore.createNotification('api_remove_profile', 'success');
  }
  /* #endregion */

  /* #region Snapshot */
  @action
  createSnapshot(snapshot: IApiSnapshot, profileId: string) {
    fromStream(
      this.signalrHub
        .sendEvent<IApiSnapshot>('AddSnapshot', snapshot, profileId)
        .pipe(
          map((s: IApiSnapshot) => {
            this.createSnapshotSuccess();
          }),
          catchError((e: Error) => of(this.createSnapshotFail(e)))
        )
    );
  }

  @action
  createSnapshotFail(e: Error) {
    this.notificationStore.createNotification('api_create_snapshot', 'error', false, e);
  }

  @action
  createSnapshotSuccess() {
    this.notificationStore.createNotification('api_create_snapshot', 'success');
  }

  @action
  uploadItems(stashtabs: IApiStashTabPricedItem[]) {
    fromStream(
      from(this.signalrHub.streamItems(stashtabs)).pipe(
        map(() => {
          this.uploadItemsSuccess();
        }),
        catchError((e: Error) => of(this.uploadItemsFail(e)))
      )
    );
  }

  @action
  uploadItemsFail(e: Error) {
    this.notificationStore.createNotification('api_upload_items', 'error', false, e);
  }

  @action
  uploadItemsSuccess() {
    this.notificationStore.createNotification('api_upload_items', 'success');
  }

  /* #endregion */
}
