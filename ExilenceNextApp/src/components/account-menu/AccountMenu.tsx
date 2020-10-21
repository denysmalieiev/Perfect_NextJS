import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem } from '@material-ui/core';

type AccountMenuProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  handleMenuClose: () => void;
  handleSignOut: () => void;
};

const AccountMenu = ({ anchorEl, open, handleMenuClose, handleSignOut }: AccountMenuProps) => {
  const { t } = useTranslation();
  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="account-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleSignOut}>{t('label.sign_out')}</MenuItem>
    </Menu>
  );
};

export default AccountMenu;
