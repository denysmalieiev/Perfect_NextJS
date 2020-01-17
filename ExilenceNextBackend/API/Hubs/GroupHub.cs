﻿using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Shared.Entities;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace API.Hubs
{
    public partial class BaseHub : Hub
    {
        [Authorize]
        public async Task<string> GroupExists(string groupName)
        {
            var group = await _groupService.GetGroup(groupName);
            return group?.Name;
        }

        [Authorize]
        public async Task<GroupModel> JoinGroup(GroupModel groupModel)
        {
            groupModel = await _groupService.JoinGroup(ConnectionId, groupModel);
            await Groups.AddToGroupAsync(ConnectionId, groupModel.Name);

            var connection = groupModel.Connections.First(c => c.ConnectionId == ConnectionId);

            var account = await _accountService.GetAccount(AccountName);
            var activeProfile = await _accountService.GetActiveProfileWithSnapshots(account.ClientId);
            var lastSnapshot = activeProfile.Snapshots.OrderByDescending(snapshot => snapshot.Created).FirstOrDefault();

            await Clients.Group(groupModel.Name).SendAsync("OnJoinGroup", connection);
            if (lastSnapshot != null)
            {
                var snapshotWithItems = await _snapshotService.GetSnapshotWithItems(lastSnapshot.ClientId);
                await Clients.OthersInGroup(groupModel.Name).SendAsync("OnAddSnapshot", ConnectionId, activeProfile.Id, snapshotWithItems);
            }

            await Log($"Joined group: {groupModel.Name}");

            return groupModel;
        }

        [Authorize]
        public async Task<GroupModel> LeaveGroup(GroupModel groupModel)
        {
            var connection = groupModel.Connections.First(c => c.ConnectionId == ConnectionId);

            groupModel = await _groupService.LeaveGroup(ConnectionId, groupModel);
            await Groups.RemoveFromGroupAsync(ConnectionId, groupModel.Name);

            await Clients.Group(groupModel.Name).SendAsync("OnLeaveGroup", connection);
            await Log($"Left group: {groupModel.Name}");
            return groupModel;
        }

        public async Task<GroupModel> AddLogger(GroupModel groupModel)
        {
            if (groupModel.Password == _loggerPassword)
            {
                var groupName = "logger";
                groupModel = await _groupService.JoinGroup(ConnectionId, groupModel);
                await Groups.AddToGroupAsync(ConnectionId, groupName);
                await Log($"Joined logger group.");
                return groupModel;
            }
            return null;
        }


    }
}
