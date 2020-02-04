import clsx from 'clsx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { useLocation } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { UiStateStore } from '../../store/uiStateStore';
import useStyles from './ToastWrapper.styles';

interface Props {
  uiStateStore?: UiStateStore;
}

const ToastWrapper: React.FC<Props> = ({ uiStateStore }: Props) => {
  const classes = useStyles();
  const location = useLocation();

  return (
    <ToastContainer
      className={clsx(classes.root, {
        [classes.authorized]: location.pathname !== '/login',
        [classes.rightMargin]: uiStateStore!.groupOverviewOpen
      })}
    />
  );
};

export default inject('uiStateStore')(observer(ToastWrapper));
