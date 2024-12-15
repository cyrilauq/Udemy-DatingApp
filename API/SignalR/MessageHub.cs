using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["user"];
        var username = Context.User?.GetUsername();

        if(Context.User == null || string.IsNullOrEmpty(otherUser)) throw new Exception("Cannot join group");

        var groupName = GetGroupName(username!, otherUser!);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await AddToGroup(groupName);

        var messages = await messageRepository.GetMessageThread(username!, otherUser!);
        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await RemoveFromMessageGroup();

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var username = GetConnectedUsername() ?? throw new Exception("Could not get user");
        var recipientUsername = createMessageDto.RecipientUsername.ToLower();

        if (username == recipientUsername)
        {
            throw new HubException("You can't send a message to yourself");
        }

        var sender = await userRepository.GetUserByUsernameAsync(username);
        var recipient = await userRepository.GetUserByUsernameAsync(recipientUsername);

        if (recipient == null || sender == null || recipient.UserName == null || sender.UserName == null) throw new HubException("Can' send a message at this time");

        var message = CreateMessageFrom(sender, recipient, createMessageDto);

        var groupName = GetGroupName(sender.UserName, recipient.UserName);
        var group = await messageRepository.GetMessageGroup(groupName);

        if(group != null && group.Connections.Any(c => c.Username == recipient.UserName))
        {
            message.DateRead = DateTime.UtcNow;
        }
        else
        {
            var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
            if(connections.Count > 0)
            {
                await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", new
                {
                    username = sender.UserName,
                    knownAs = sender.KnownAs
                });
            }
        }

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync())
        {
            await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
        }
    }

    private string? GetConnectedUsername()
    {
        return Context.User?.GetUsername();
    }

    private async Task<bool> AddToGroup(string groupName)
    {
        var username = GetConnectedUsername() ?? throw new Exception("Con't get username");
        var group = await messageRepository.GetMessageGroup(groupName);
        var connection = new Connection 
        { 
            ConnectionId = Context.ConnectionId,
            Username = username
        };

        if(group == null)
        {
            group = new Group { Name = groupName };
            messageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await messageRepository.SaveAllAsync();
    }

    private async Task RemoveFromMessageGroup()
    {
        var connection = await messageRepository.GetConnection(Context.ConnectionId);
        if(connection != null)
        {
            messageRepository.RemoveConnection(connection);
            await messageRepository.SaveAllAsync();
        }
    }

    private Message CreateMessageFrom(AppUser sender, AppUser recipient, CreateMessageDto createMessageDto)
    {
        return new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName!,
            RecipientUsername = recipient.UserName!,
            Content = createMessageDto.Content
        };
    }

    private string GetGroupName(string caller, string other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
}
