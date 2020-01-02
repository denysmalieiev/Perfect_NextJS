import React, { useState } from 'react';
import GroupOverview from './GroupOverview';
import { observer, inject } from 'mobx-react';
import { UiStateStore } from '../../../store/uiStateStore';
import { SignalrStore } from '../../../store/signalrStore';
import ConfirmationDialog from '../../confirmation-dialog/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

interface GroupOverviewContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  uiStateStore?: UiStateStore;
  signalrStore?: SignalrStore;
}

const GroupOverviewContainer: React.FC<GroupOverviewContainerProps> = ({
  uiStateStore,
  signalrStore,
  children
}: GroupOverviewContainerProps) => {
  const { t } = useTranslation();
  const [showLeaveGroupDialog, setShowLeaveGroupDialog] = useState(false);

  const handleLeaveGroup = () => {
    signalrStore!.leaveGroup();
    setShowLeaveGroupDialog(false);
  };

  return (
    <>
      <GroupOverview
        open={uiStateStore!.groupOverviewOpen}
        activeGroup={signalrStore!.activeGroup}
        toggleGroupOverview={() => uiStateStore!.toggleGroupOverview()}
        handleCreateGroup={() =>
          uiStateStore!.setGroupDialogOpen(true, 'create')
        }
        handleJoinGroup={() => uiStateStore!.setGroupDialogOpen(true, 'join')}
        handleLeaveGroup={() => setShowLeaveGroupDialog(true)}
      >
        {children}
      </GroupOverview>
      <ConfirmationDialog
        show={showLeaveGroupDialog}
        onClose={() => setShowLeaveGroupDialog(false)}
        onConfirm={handleLeaveGroup}
        title={t('title.confirm_leave_group')}
        body={t('body.leave_group')}
        acceptButtonText={t('action.confirm')}
        cancelButtonText={t('action.cancel')}
      />
    </>
  );
};

export default inject(
  'uiStateStore',
  'signalrStore'
)(observer(GroupOverviewContainer));
