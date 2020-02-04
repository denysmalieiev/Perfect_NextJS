import { Box, Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountStore } from '../../store/accountStore';
import { SignalrStore } from '../../store/signalrStore';
import SnapshotHistoryChart from './SnapshotHistoryChart';
import useComponentSize from '@rehooks/component-size';

interface Props {
  accountStore?: AccountStore;
  signalrStore?: SignalrStore;
}

const SnapshotHistoryChartContainer: React.FC<Props> = ({
  accountStore,
  signalrStore
}: Props) => {
  const { t } = useTranslation();

  let ref = useRef(null);
  let size = useComponentSize(ref);

  const activeProfile = accountStore!.getSelectedAccount.activeProfile;

  const { activeGroup } = signalrStore!;

  return (
    <div ref={ref} style={{ height: '100%', width: '100%' }}>
      <SnapshotHistoryChart
        width={size.width}
        height={size.height}
        groupData={activeGroup?.chartData}
        playerData={activeProfile?.chartData}
      />
    </div>
  );
};

export default inject(
  'accountStore',
  'signalrStore'
)(observer(SnapshotHistoryChartContainer));
