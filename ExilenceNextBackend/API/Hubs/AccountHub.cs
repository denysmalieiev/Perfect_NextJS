﻿using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Shared.Entities;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Profiles;
using Microsoft.AspNetCore.Mvc;
using MessagePack;

namespace API.Hubs
{
    public partial class BaseHub : Hub
    {
        public async Task<List<SnapshotProfileModel>> GetAllProfiles(string accountId)
        {
            var profileModels = await _accountService.GetAllProfiles(accountId.ToString());
            return profileModels;
        }

        public async Task<SnapshotProfileModel> GetProfile(string profileId)
        {
            var profileModel = await _accountService.GetProfile(profileId);
            return profileModel;
        }

        public async Task<SnapshotProfileModel> AddProfile([FromBody]SnapshotProfileModel profileModel)
        {
            profileModel = await _accountService.AddProfile(AccountName, profileModel);
            await Log($"Added profile with name: {profileModel.Name} and clientId: {profileModel.ClientId}");

            var group = await _groupService.GetGroupForConnection(ConnectionId);
            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnAddProfile", ConnectionId, profileModel);
            }

            return profileModel;
        }

        public async Task<SnapshotProfileModel> EditProfile([FromBody]SnapshotProfileModel profileModel)
        {
            profileModel = await _accountService.EditProfile(AccountName, profileModel);
            await Log($"Updated profile with name: {profileModel.Name} and clientId: {profileModel.ClientId}");
            return profileModel;
        }

        public async Task<string> RemoveProfile(string profileId)
        {
            var profileModel = await _accountService.RemoveProfile(AccountName, profileId);
            await Log($"Removed profile with name: {profileModel.Name} and clientId: {profileModel.ClientId}");

            var group = await _groupService.GetGroupForConnection(ConnectionId);
            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnRemoveProfile", ConnectionId, profileId);
            }

            return profileModel.ClientId;
        }

        public async Task<SnapshotProfileModel> ChangeProfile(string profileId)
        {
            profileId = await _accountService.ChangeProfile(AccountName, profileId);
            var profileModel = await _accountService.GetProfileWithSnapshots(profileId);
            var latestSnapshot = profileModel.Snapshots.OrderByDescending(snapshot => snapshot.Created).FirstOrDefault();
            var snapshotModelWithItems = await _snapshotService.GetSnapshotWithItems(latestSnapshot.ClientId);

            // todo: rework this, but we should include snapshots here instead of making two calls
            profileModel.Snapshots = new List<SnapshotModel>() { snapshotModelWithItems };

            await Log($"Set profile with name: {profileModel.Name} and clientId: {profileModel.ClientId} to active");

            var group = await _groupService.GetGroupForConnection(ConnectionId);
            if (group != null)
            {
                await Clients.OthersInGroup(group.Name).SendAsync("OnChangeProfile", ConnectionId, profileModel);
            }

            return profileModel;
        }

    }
}
