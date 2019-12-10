import { inject, observer } from 'mobx-react';
import React, { useState, ChangeEvent } from 'react';
import { AccountStore } from '../../store/accountStore';
import { LeagueStore } from './../../store/leagueStore';
import { UiStateStore } from './../../store/uiStateStore';
import Toolbar from './Toolbar';
import { PriceStore } from '../../store/priceStore';
import { NotificationStore } from '../../store/notificationStore';
import ConfirmationDialog from '../confirmation-dialog/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

interface ToolbarContainerProps {
  uiStateStore?: UiStateStore;
  accountStore?: AccountStore;
  leagueStore?: LeagueStore;
  notificationStore?: NotificationStore;
}

const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  uiStateStore,
  accountStore,
  notificationStore
}: ToolbarContainerProps) => {
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [
    showConfirmClearSnapshotsDialog,
    setShowConfirmClearSnapshotsDialog
  ] = useState(false);
  const { notifications, markAllAsRead } = notificationStore!;

  const handleOpen = (edit: boolean = false) => {
    setIsEditing(edit);
    setProfileOpen(true);
  };

  const handleClose = () => {
    setProfileOpen(false);
  };

  const handleClearSnapshots = () => {
    accountStore!.getSelectedAccount.activeProfile.clearSnapshots();
    setShowConfirmClearSnapshotsDialog(false);
  };

  const handleSnapshot = () => {
    accountStore!.getSelectedAccount.activeProfile.snapshot();
  };

  const handleProfileChange = (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    accountStore!.getSelectedAccount.setActiveProfile(
      event.target.value as string
    );
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    uiStateStore!.setNotificationList([...notifications]);
    notificationStore!.markAllAsRead();
    uiStateStore!.setNotificationListAnchor(event.currentTarget);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    uiStateStore!.setAccountMenuAnchor(event.currentTarget);
  };

  return (
    <>
      <ConfirmationDialog
        show={showConfirmClearSnapshotsDialog}
        onClose={() => setShowConfirmClearSnapshotsDialog(false)}
        onConfirm={handleClearSnapshots}
        title={t('title.confirm_clear_snapshots')}
        body={t('body.clear_snapshots')}
        acceptButtonText={t('action.confirm')}
        cancelButtonText={t('action.cancel')}
      />
      <Toolbar
        sidenavOpened={uiStateStore!.sidenavOpen}
        profiles={accountStore!.getSelectedAccount.profiles}
        activeProfile={accountStore!.getSelectedAccount.activeProfile}
        toggleSidenav={() => uiStateStore!.toggleSidenav()}
        markAllNotificationsRead={() => notificationStore!.markAllAsRead()}
        handleProfileChange={handleProfileChange}
        handleSnapshot={handleSnapshot}
        isEditing={isEditing}
        profileOpen={profileOpen}
        handleProfileOpen={handleOpen}
        handleProfileClose={handleClose}
        notifications={notificationStore!.notifications}
        unreadNotifications={notificationStore!.unreadNotifications}
        handleNotificationsOpen={handleNotificationsOpen}
        handleAccountMenuOpen={handleAccountMenuOpen}
        handleClearSnapshots={() => setShowConfirmClearSnapshotsDialog(true)}
        isSnapshotting={
          accountStore!.getSelectedAccount.activeProfile.isSnapshotting
        }
      />
    </>
  );
};

export default inject(
  'uiStateStore',
  'accountStore',
  'notificationStore'
)(observer(ToolbarContainer));
