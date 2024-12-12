using API.Extensions;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class PresenceHub : Hub
{
    // This method will be invoked each times a client connect to the hub
    // This will send a message that will call a method (here "UserIsOnline") with the given parameters (here the Username of the user that connect to the hub)
    public override async Task OnConnectedAsync()
    {
        await Clients.Others.SendAsync("UserIsOnline", Context.User?.GetUsername());
    }

    // This will be called when a client disconnect from the hub
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.Others.SendAsync("UserIsOffline", Context.User?.GetUsername());

        await base.OnDisconnectedAsync(exception);
    }
}
