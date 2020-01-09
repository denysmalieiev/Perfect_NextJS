import { IPricedItem } from './api-priced-item.interface';

export interface IApiPricedItemsUpdate {
    connectionId?: string;
    profileId: string;
    snapshotId: string;
    stashTabId: string;
    pricedItems: IPricedItem[]
}