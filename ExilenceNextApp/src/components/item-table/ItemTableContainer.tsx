import { inject, observer } from 'mobx-react';
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { UiStateStore } from '../../store/uiStateStore';
import ItemTable from './ItemTable';
import { AccountStore } from '../../store/accountStore';
import ItemTableFilter from './item-table-filter/ItemTableFilter';
import { IPricedItem } from '../../interfaces/priced-item.interface';
import { Grid, Box, makeStyles, Theme } from '@material-ui/core';
import { reaction } from 'mobx';

interface ItemTableContainerProps {
  uiStateStore?: UiStateStore;
  accountStore?: AccountStore;
}

export const itemTableFilterHeight = 48;
export const itemTableFilterSpacing = 2;

const useStyles = makeStyles((theme: Theme) => ({
  itemTableFilter: {
    height: itemTableFilterHeight
  }
}));

const ItemTableContainer: React.FC<ItemTableContainerProps> = ({
  accountStore,
  uiStateStore
}: ItemTableContainerProps) => {
  const { tableItems } = accountStore!.getSelectedAccount.activeProfile;
  const classes = useStyles();
  const [filteredItems, setFilteredItems] = useState<IPricedItem[]>(tableItems);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    console.log('USEEFFECT')
    handleFilter(undefined, filterText);
  }, [
    accountStore!.getSelectedAccount.activeProfile.snapshots.length
  ]);

  let timer: NodeJS.Timeout | undefined = undefined;

  const handleFilter = (
    event?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchText?: string
  ) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      let text = '';

      if (event) {
        text = event.target.value.toLowerCase();
      }

      if (searchText) {
        text = searchText;
      }

      setFilterText(text);

      const filteredItems = tableItems.filter(ti =>
        ti.name.toLowerCase().includes(text)
      );
      setFilteredItems(filteredItems);
    }, 500);
  };

  return (
    <>
      <Box mb={itemTableFilterSpacing} className={classes.itemTableFilter}>
        <Grid container>
          <Grid item xs={3}>
            <ItemTableFilter
              array={filteredItems}
              handleFilter={handleFilter}
            />
          </Grid>
        </Grid>
      </Box>
      <ItemTable
        items={filteredItems}
        pageIndex={uiStateStore!.itemTablePageIndex}
        changePage={(i: number) => uiStateStore!.changeItemTablePage(i)}
      />
    </>
  );
};

export default inject(
  'uiStateStore',
  'accountStore'
)(observer(ItemTableContainer));
