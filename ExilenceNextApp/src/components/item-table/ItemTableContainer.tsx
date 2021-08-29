import {
  Box,
  Button,
  Grid,
  IconButton,
  Input,
  makeStyles,
  Snackbar,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import GetAppIcon from '@material-ui/icons/GetApp';
import ViewColumnsIcon from '@material-ui/icons/ViewColumn';
import ImageIcon from '@material-ui/icons/Image';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, default as React, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toBlob } from 'html-to-image';
import moment from 'moment';
import {
  TableInstance,
  useColumnOrder,
  useFilters,
  useFlexLayout,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';
import { useStores } from '../..';
import { primaryLighter, statusColors } from '../../assets/themes/exilence-theme';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { ColumnHidePage } from '../column-hide-page/ColumnHidePage';
import { defaultColumn } from '../table-wrapper/DefaultColumn';
import TableWrapper from '../table-wrapper/TableWrapper';
import ItemTableFilterSubtotal from './item-table-filter-subtotal/ItemTableFilterSubtotal';
import ItemTableFilter from './item-table-filter/ItemTableFilter';
import ItemTableMenuContainer from './item-table-menu/ItemTableMenuContainer';
import itemTableColumns from './itemTableColumns';
import itemTableGroupColumns from './itemTableGroupColumns';
import { Alert } from '@material-ui/lab';
import TftLogo from '../../assets/img/tft.png';
import CloseIcon from '@material-ui/icons/Close';

export const itemTableFilterSpacing = 2;

const useStyles = makeStyles((theme: Theme) => ({
  itemTableFilter: {},
  actionArea: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  placeholder: {
    display: 'flex',
    alignSelf: 'flex-end',
  },
  inlineIcon: {
    color: primaryLighter,
  },
  warning: {
    color: statusColors.warning,
  },
  noItemPlaceholder: {
    color: theme.palette.primary.light,
  },
  warningIcon: {
    color: statusColors.warning,
    marginLeft: theme.spacing(2),
  },
  tftBulk: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 5,
    marginLeft: 5,
  },
  tftBulkImg: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  askingPrice: {
    display: 'flex',
    alignItems: 'center',
  },
  generatedAt: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: -10,
  },
  askingPriceInput: {
    width: 100,
    marginRight: 5,
  },
  askingPriceGeneratedValue: {
    textTransform: 'none',
  },
}));

const ItemTableContainer = () => {
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const [isExtractingImageSuccessMsg, setIsExtractingImageSuccessMsg] = useState(false);
  const [isTftSelected, setIsTftSelected] = useState(false);
  const [askingPriceInputValue, setAskingPriceInputValue] = useState('');
  const { accountStore, signalrStore, uiStateStore, routeStore } = useStores();
  const activeProfile = accountStore!.getSelectedAccount.activeProfile;
  const { activeGroup } = signalrStore!;
  const classes = useStyles();
  const { t } = useTranslation();
  const getItems = useMemo(() => {
    if (activeProfile) {
      return activeGroup ? activeGroup.items : activeProfile.items;
    } else {
      return [];
    }
  }, [activeProfile, activeProfile?.items, activeGroup?.items, activeGroup]);

  const getColumns = useMemo(() => {
    return activeGroup ? itemTableGroupColumns : itemTableColumns;
  }, [activeGroup]);

  const data = useMemo(() => {
    return getItems;
  }, [getItems]);

  const tableName = 'item-table';
  const [initialState, setInitialState] = useLocalStorage(`tableState:${tableName}`, {
    pageSize: 25,
  });

  const [instance] = useState<TableInstance<object>>(
    useTable(
      {
        columns: getColumns,
        defaultColumn,
        data,
        initialState,
      },
      useColumnOrder,
      useFilters,
      useSortBy,
      useFlexLayout,
      usePagination,
      useResizeColumns,
      useRowSelect,
      (hooks) => {
        hooks.allColumns.push((columns) => [...columns]);
      }
    )
  );

  let timer: NodeJS.Timeout | undefined = undefined;

  useEffect(() => {
    if (isExtractingImageSuccessMsg) {
      const imageExtractingSuccessMsgTimer = setTimeout(
        () => setIsExtractingImageSuccessMsg(false),
        5000
      );
      return () => clearTimeout(imageExtractingSuccessMsgTimer);
    }
    // @ts-ignore
    return () => clearTimeout(timer);
  }, [isExtractingImageSuccessMsg]);

  const handleFilter = (
    event?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchText?: string
  ) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => {
        let text = '';

        if (event) {
          text = event.target.value.toLowerCase();
        }

        if (searchText) {
          text = searchText;
        }

        uiStateStore!.setItemTableFilterText(text);
      },
      event ? 500 : 0
    );
  };

  const handleAskingPriceInputChange = (e) => setAskingPriceInputValue(e.currentTarget.value);

  const handleItemTableMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    uiStateStore!.setItemTableMenuAnchor(event.currentTarget);
  };

  const handleTftBulkClick = () => setIsTftSelected((isSelected) => !isSelected);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const hideableColumns = getColumns.filter((column) => !(column.id === '_selector'));

  const handleColumnsClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setColumnsOpen(true);
    },
    [setAnchorEl, setColumnsOpen]
  );

  const handleClose = useCallback(() => {
    setColumnsOpen(false);
    setAnchorEl(null);
  }, []);

  const handleRedirectToCustomPrices = () => {
    uiStateStore!.setSettingsTabIndex(2);
    routeStore!.redirect('/settings');
  };

  const handleExtractImageClick = () => {
    const table = document.getElementById('items-table');
    const tableInput = document.getElementById('items-table-input');
    const tableActions = document.getElementById('items-table-actions');

    if (table) {
      if (tableInput && tableActions) {
        tableInput.style.display = 'none';
        tableActions.style.display = 'none';
      }
      setIsExtractingImage(true);
      toBlob(table)
        .then(function (blob) {
          // @ts-ignore
          navigator.clipboard.write([
            // @ts-ignore
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setIsExtractingImageSuccessMsg(true);
        })
        .catch((err) => console.log(err))
        .finally(() => {
          setIsExtractingImage(false);
          if (tableInput && tableActions) {
            tableInput.style.display = 'flex';
            tableActions.style.display = 'flex';
          }
          window.open('discord://');
        });
    }
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={isExtractingImage}
      >
        <Alert severity="info">Generating Image...</Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={isExtractingImageSuccessMsg}
      >
        <Alert severity="success">Image generated and saved to clipboard!</Alert>
      </Snackbar>
      <Box mb={itemTableFilterSpacing} className={classes.itemTableFilter}>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Grid item md={isExtractingImage ? 11 : 4}>
            <Grid container direction="row" spacing={2} alignItems="center">
              <Grid item md={7} id="items-table-input">
                <ItemTableFilter
                  array={getItems}
                  handleFilter={handleFilter}
                  clearFilter={() => handleFilter(undefined, '')}
                />
              </Grid>
              <Grid item>
                <ItemTableFilterSubtotal array={getItems} />
              </Grid>
              {isExtractingImage && (
                <>
                  <Grid item id="items-table-asking-price" className={classes.askingPrice}>
                    <Typography variant="body2">{t('label.asking_price')}</Typography>:&nbsp;
                    <Button
                      className={classes.askingPriceGeneratedValue}
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      {askingPriceInputValue}
                    </Button>
                  </Grid>
                  <Grid item id="items-table-generated" className={classes.generatedAt}>
                    <Typography variant="body2">{t('label.generated_at')}</Typography>&nbsp;
                    <b>
                      <u>{moment().format()}</u>
                    </b>
                    &nbsp;
                    <Typography variant="body2">{t('label.generated_by')}.</Typography>&nbsp;
                    <Typography variant="body2">{t('label.powered_by_poe_ninja')}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
          <Grid
            item
            className={classes.actionArea}
            id="items-table-actions"
            md={isExtractingImage ? 1 : 8}
          >
            {isTftSelected && (
              <Grid item md={4} className={classes.tftBulk}>
                <TextField
                  label={t('label.asking_price')}
                  className={classes.askingPriceInput}
                  value={askingPriceInputValue}
                  onChange={handleAskingPriceInputChange}
                />
                <Tooltip title={t('label.export_image') || ''} placement="bottom">
                  <IconButton
                    size="small"
                    className={classes.inlineIcon}
                    onClick={handleExtractImageClick}
                  >
                    <ImageIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Box mr={1}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleTftBulkClick}
                className={classes.tftBulk}
              >
                {t('label.tft_bulk')}
                <img alt="tft logo" src={TftLogo} className={classes.tftBulkImg} />
                {isTftSelected && <CloseIcon fontSize="small" />}
              </Button>
            </Box>
            <ColumnHidePage
              instance={instance}
              onClose={handleClose}
              show={columnsOpen}
              anchorEl={anchorEl}
            />
            <Box mr={1}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleRedirectToCustomPrices}
              >
                {t('label.customize_prices')}
              </Button>
            </Box>
            {hideableColumns.length > 1 && (
              <Tooltip title={t('label.toggle_visible_columns') || ''} placement="bottom">
                <IconButton
                  size="small"
                  className={classes.inlineIcon}
                  onClick={handleColumnsClick}
                >
                  <ViewColumnsIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('label.toggle_stash_tab_filter') || ''} placement="bottom">
              <IconButton
                size="small"
                className={classes.inlineIcon}
                onClick={() =>
                  uiStateStore!.setShowItemTableFilter(!uiStateStore!.showItemTableFilter)
                }
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('label.toggle_export_menu') || ''} placement="bottom">
              <IconButton
                size="small"
                className={classes.inlineIcon}
                onClick={handleItemTableMenuOpen}
              >
                <GetAppIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <TableWrapper instance={instance} setInitialState={setInitialState} />
      <ItemTableMenuContainer />
    </>
  );
};

export default observer(ItemTableContainer);
