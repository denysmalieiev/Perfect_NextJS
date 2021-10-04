import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import ViewColumnsIcon from '@mui/icons-material/ViewColumn';
import { Box, Button, Grid, IconButton, Theme, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { ChangeEvent, default as React, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import ColumnHidePage from '../column-hide-page/ColumnHidePage';
import { defaultColumn } from '../table-wrapper/DefaultColumn';
import TableWrapper from '../table-wrapper/TableWrapper';
import ItemTableFilterSubtotal from './item-table-filter-subtotal/ItemTableFilterSubtotal';
import ItemTableFilter from './item-table-filter/ItemTableFilter';
import ItemTableMenuContainer from './item-table-menu/ItemTableMenuContainer';
import itemTableBulkSellColumns from './itemTableBulkSellColumns';
import itemTableColumns from './itemTableColumns';
import itemTableGroupColumns from './itemTableGroupColumns';

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
    marginLeft: theme.spacing(1.5),
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
  bulkSell: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 5,
    marginLeft: 5,
  },
  bulkSellImg: {
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

type ItemTableContainerProps = {
  bulkSellView?: boolean;
  searchFilterText: string;
};

const ItemTableContainer = ({
  bulkSellView = false,
  searchFilterText = '',
}: ItemTableContainerProps) => {
  const { accountStore, signalrStore, uiStateStore } = useStores();
  const activeProfile = accountStore!.getSelectedAccount.activeProfile;
  const { activeGroup } = signalrStore!;
  const classes = useStyles();
  const { t } = useTranslation();
  const getItems = useMemo(() => {
    if (activeProfile) {
      return activeGroup && !bulkSellView ? activeGroup.items : activeProfile.items;
    } else {
      return [];
    }
  }, [activeProfile, activeProfile?.items, activeGroup?.items, activeGroup]);

  const getColumns = useMemo(() => {
    if (activeGroup && !bulkSellView) return itemTableGroupColumns;
    if (!activeGroup && bulkSellView) return itemTableBulkSellColumns;
    return itemTableColumns;
  }, [activeGroup]);

  const data = useMemo(() => {
    return getItems;
  }, [getItems, bulkSellView]);

  const [initialState, setInitialState] = bulkSellView
    ? useLocalStorage(`tableState:bulk-sell-item-table`, {
        pageSize: 50,
        hiddenColumns: uiStateStore!.bulkSellActivePreset?.hiddenColumns || [],
        sortBy: [{ id: 'total', desc: true }],
      })
    : useLocalStorage(`tableState:item-table`, {
        pageSize: 25,
        hiddenColumns: ['level', 'quality'],
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

        bulkSellView
          ? uiStateStore!.setBulkSellItemTableFilterText(text)
          : uiStateStore!.setItemTableFilterText(text);
      },
      event ? 500 : 0
    );
  };

  const handleItemTableMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    uiStateStore!.setItemTableMenuAnchor(event.currentTarget);
  };

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

  return (
    <>
      <Box mb={itemTableFilterSpacing} className={classes.itemTableFilter}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item md={uiStateStore!.bulkSellGeneratingImage ? 11 : 5}>
            <Grid container direction="row" spacing={2} alignItems="center">
              <Grid item md={7} id="items-table-input">
                <ItemTableFilter
                  array={getItems}
                  handleFilter={handleFilter}
                  clearFilter={() => handleFilter(undefined, '')}
                  searchText={searchFilterText}
                />
              </Grid>
              <Grid item>
                <ItemTableFilterSubtotal array={getItems} />
              </Grid>
              {uiStateStore!.bulkSellGeneratingImage && (
                <>
                  <Grid item id="items-table-asking-price" className={classes.askingPrice}>
                    <Typography variant="body2">{t('label.asking_price')}</Typography>:&nbsp;
                    <Button
                      className={classes.askingPriceGeneratedValue}
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      {uiStateStore!.bulkSellAskingPrice}c (
                      {uiStateStore!.bulkSellAskingPricePercentage}% of original price)
                    </Button>
                  </Grid>
                  <Grid item id="items-table-generated" className={classes.generatedAt}>
                    <Typography variant="body2">{t('label.generated_at')}</Typography>&nbsp;
                    <b>
                      <u>{moment().utc().format('YYYY-MM-DD HH:MM')}</u>
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
            md={uiStateStore!.bulkSellGeneratingImage ? 1 : 7}
          >
            <ColumnHidePage
              instance={instance}
              onClose={handleClose}
              show={columnsOpen}
              anchorEl={anchorEl}
            />
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
            {!bulkSellView && (
              <Tooltip title={t('label.toggle_export_menu') || ''} placement="bottom">
                <IconButton
                  size="small"
                  className={classes.inlineIcon}
                  onClick={handleItemTableMenuOpen}
                >
                  <GetAppIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Box>
      <TableWrapper instance={instance} setInitialState={setInitialState} />
      <ItemTableMenuContainer />
    </>
  );
};

export default observer(ItemTableContainer);
