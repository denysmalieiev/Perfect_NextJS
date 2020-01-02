﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Shared.Entities;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

namespace API.Hubs
{
    public partial class BaseHub : Hub
    {

        public async Task<SnapshotModel> GetSnapshot(string snapshotId)
        {
            var snapshotModel = await _snapshotService.GetSnapshot(snapshotId);
            await Log($"Retrived snapshot with ClientId: {snapshotModel.ClientId} worth {snapshotModel.StashTabs.Sum(s => s.Value)} chaos.");
            return snapshotModel;
        }

        public async Task<SnapshotModel> AddSnapshot([FromBody]SnapshotModel snapshotModel, string profileId)
        {
            snapshotModel = await _snapshotService.AddSnapshot(profileId, snapshotModel);
            await Log($"Added snapshot with ClientId: {snapshotModel.ClientId} worth {snapshotModel.StashTabs.Sum(s => s.Value)} chaos.");

            var group = await _groupService.GetGroupForConnection(ConnectionId);
            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnAddSnapshot", ConnectionId, profileId, snapshotModel);
            }

            return snapshotModel;
        }

        public async Task<SnapshotModel> AddPricedItemsFinished(string snapshotId, string profileId)
        {
            var snapshotModel = await _snapshotService.GetSnapshot(snapshotId);
            var group = await _groupService.GetGroupForConnection(ConnectionId);

            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnAddPricedItemsFinished", ConnectionId, profileId, snapshotModel);
            }

            return snapshotModel;
        }

        public async Task ForwardSnapshot(string connectionId, string profileId, SnapshotModel snapshotModel)
        {
            await Log($"Forwarded snapshot with ClientId: {snapshotModel.ClientId} worth {snapshotModel.StashTabs.Sum(s => s.Value)} chaos.");
            await Clients.Client(connectionId).SendAsync("OnAddSnapshot", ConnectionId, profileId, snapshotModel);
        }

        public async Task<string> RemoveSnapshot(string profileClientId, string snapshotId)
        {
            var snapshotModel = await _snapshotService.RemoveSnapshot(profileClientId, snapshotId);
            await Log($"Removed snapshot with ClientId: {snapshotModel.ClientId} worth {snapshotModel.StashTabs.Sum(s => s.Value)} chaos.");

            var group = await _groupService.GetGroupForConnection(ConnectionId);
            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnRemoveSnapshot", ConnectionId, profileClientId, snapshotModel);
            }

            return snapshotId;
        }

        public async Task AddPricedItems(List<PricedItemModel> pricedItems, string stashtabId)
        {
            await _snapshotService.AddPricedItems(stashtabId, pricedItems);
            await Log($"Added {pricedItems.Count} pricedItems to StashTabId: {stashtabId}");
        }

        public async Task AddPricedItem(IAsyncEnumerable<PricedItemModel> pricedItems, string stashtabId)
        {
            await foreach (var pricedItem in pricedItems)
            {
                await _snapshotService.AddPricedItem(stashtabId, pricedItem);
            }
        }

        public async IAsyncEnumerable<SnapshotModel> RetriveSnapshots(string snapshotId, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var snapshots = _snapshotService.GetStashtabs(snapshotId);

            foreach (var snapshot in snapshots)
            {
                // Check the cancellation token regularly so that the server will stop
                // producing items if the client disconnects.
                cancellationToken.ThrowIfCancellationRequested();

                yield return _mapper.Map<SnapshotModel>(snapshot);

                // Use the cancellationToken in other APIs that accept cancellation
                // tokens so the cancellation can flow down to them.
                await Task.Delay(100, cancellationToken);
            }
        }

    }
}
