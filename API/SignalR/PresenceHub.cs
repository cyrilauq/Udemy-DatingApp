using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class PresenceHub(PresenceTracker presenceTracker) : Hub
{
    // This method will be invoked each times a client connect to the hub
    // This will send a message that will call a method (here "UserIsOnline") with the given parameters (here the Username of the user that connect to the hub)
    public override async Task OnConnectedAsync()
    {
        var username = Context.User?.GetUsername() ?? throw new HubException("Can't get the current user's claim");

        if(await presenceTracker.UserConnected(username, Context.ConnectionId))
        {
            await Clients.Others.SendAsync("UserIsOnline", username);
        }

        await NotifyUsersOfConnectedUsersAsync();
    }

    // This will be called when a client disconnect from the hub
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User?.GetUsername() ?? throw new HubException("Can't get the current user's claim");

        if(await presenceTracker.UserDisconnected(username, Context.ConnectionId))
        {
            await Clients.Others.SendAsync("UserIsOffline", username);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task NotifyUsersOfConnectedUsersAsync()
    {
        var currentUsersConnected = await presenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsersConnected);
    }
}
