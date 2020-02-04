import { Box, Typography } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import NetWorthSettingsContainer from './net-worth-settings/NetWorthSettingsContainer';
import SettingsTab from './settings-tab/SettingsTab';
import useStyles from './SettingsTabs.styles';
import SnapshotSettingsContainer from './snapshot-settings/SnapshotSettingsContainer';
import UiSettingsContainer from './ui-settings/UiSettingsContainer';

function a11yProps(index: any) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  };
}

const SettingsTabs: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="settings tabs"
        className={classes.tabs}
        classes={{
          indicator: classes.indicator
        }}
      >
        <Tab
          label={t('title.net_worth_settings')}
          className={classes.tab}
          {...a11yProps(0)}
        />
        <Tab
          label={t('title.ui_settings')}
          className={classes.tab}
          {...a11yProps(1)}
        />
      </Tabs>
      <SettingsTab value={value} index={0}>
        <Box className={classes.subSection}>
          <Typography variant="overline">
            {t('title.snapshot_settings')}
          </Typography>
          <Box my={2}>
            <SnapshotSettingsContainer />
          </Box>
        </Box>
        <Box className={classes.subSection}>
          <Typography variant="overline">
            {t('title.pricing_settings')}
          </Typography>
          <Box my={2}>
            <NetWorthSettingsContainer />
          </Box>
        </Box>
      </SettingsTab>
      <SettingsTab value={value} index={1}>
        <Box className={classes.subSection}>
          <Typography variant="overline">{t('title.general')}</Typography>
          <Box my={2}>
            <UiSettingsContainer />
          </Box>
        </Box>
      </SettingsTab>
    </div>
  );
};

export default observer(SettingsTabs);
