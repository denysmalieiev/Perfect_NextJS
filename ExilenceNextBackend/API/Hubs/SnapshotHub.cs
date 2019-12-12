﻿using Microsoft.AspNetCore.SignalR;
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
        /* STUFF TODO
         * Add Snapshots
         * Add Stashtabs to Snapshot
         * Retrive Snapshot
         * Retrive Stashtabs for Snapshot
         * 
         */

        public async Task<SnapshotModel> GetSnapshot(string snapshotClientId)
        {
            var snapshotModel = await _snapshotService.GetSnapshot(_accountName, snapshotClientId);
            return snapshotModel;
        }

        public async Task<SnapshotModel> AddSnapshot(string profileClientId, SnapshotModel snapshotModel)
        {
            snapshotModel = await _snapshotService.AddSnapshot(_accountName, profileClientId, snapshotModel);
            await Log($"Added snapshot with id: {snapshotModel.Id} and value: {snapshotModel.TotalValue} for account {_accountName}.");
            return snapshotModel;
        }

        public async Task<SnapshotModel> RemoveSnapshot(string profileClientId, string snapshotClientId)
        {
            var snapshotModel = await _snapshotService.RemoveSnapshot(_accountName, profileClientId, snapshotClientId);
            await Log($"Removed snapshot with id {snapshotModel.Id} and value: {snapshotModel.TotalValue} for account {_accountName}.");
            return snapshotModel;
        }

        public async Task AddStashtabs(string stashtabClientId, IAsyncEnumerable<StashtabModel> stashtabModels)
        {
            await foreach (var stashtabModel in stashtabModels)
            {
                await _snapshotService.AddStashtab(_accountName, stashtabClientId, stashtabModel);
            }
        }

        public async IAsyncEnumerable<SnapshotModel> RetriveSnapshots(string snapshotClientId, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var snapshots = _snapshotService.GetStashtabs(_accountName, snapshotClientId);
            
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
