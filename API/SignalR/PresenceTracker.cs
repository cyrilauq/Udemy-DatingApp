using System;

namespace API.SignalR;

public class PresenceTracker
{
    // This will hold for every user its connection ids
    // So the key of the dictionary is the user's id and the value is the list of the connection ids for the user
    // One user can be connected thourhg multiple devices and then have multiple connection, that's why we're using a list as a value
    private static readonly Dictionary<string, List<string>> OnlineUsers = [];

    public Task UserConnected(string username, string connectionId) 
    {
        // By using the "lock" keyword we make our dictionnary thread sage
        // When the dictionnary is locked, another thread won't be able to update it
        lock(OnlineUsers)
        {
            if(OnlineUsers.ContainsKey(username))
            {
                OnlineUsers[username].Add(connectionId);
            }
            else
            {
                OnlineUsers.Add(username, [connectionId]);
            }
        }

        return Task.CompletedTask;
    }

    public Task UserDisconnected(string username, string connectionId) 
    {
        // By using the "lock" keyword we make our dictionnary thread sage
        // When the dictionnary is locked, another thread won't be able to update it
        lock(OnlineUsers)
        {
            if(OnlineUsers.ContainsKey(username))
            {
                OnlineUsers[username].Remove(connectionId);
                if(OnlineUsers[username].Count == 0)
                {
                    OnlineUsers.Remove(username);
                }
            }
        }

        return Task.CompletedTask;
    }

    public Task<string[]> GetOnlineUsers()
    {
        string[] onlineUsers = [];

        lock(OnlineUsers)
        {
            onlineUsers = OnlineUsers.OrderBy(k => k.Key).Select(k => k.Key).ToArray();
        }

        return Task.FromResult(onlineUsers);
    }
}