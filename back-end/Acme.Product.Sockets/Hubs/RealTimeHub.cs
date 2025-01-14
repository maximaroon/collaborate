using Acme.Product.Sockets.Enumerations;
using Acme.Product.Sockets.Models;
using Acme.Product.Sockets.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Acme.Product.Sockets.Hubs;

public class RealTimeHub(ILockService lockService) : Hub
{
    public async Task SendMessage(string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }

    public async Task Lock(string userId, string pageId, string field)
    {
        var result = await lockService.RequestLock(pageId, userId, field);
        var status = result ? "succeed" : "failed";

        LockResponse response = new()
        {
            Field = field,
            Owner = userId,
            Type = LockType.Lock.ToString(),
            Message = status,
            When = DateTime.Now
        };

        await Clients.All.SendAsync($"ReceiveLock-{pageId}", response);
    }
    
    public async Task Unlock(string userId, string pageId, string field)
    {
        var result = await lockService.RequestUnlock(pageId, userId, field);
        var status = result ? "succeed" : "failed";

        LockResponse response = new()
        {
            Field = field,
            Owner = userId,
            Type = LockType.Unlock.ToString(),
            Message = status,
            When = DateTime.Now
        };

        await Clients.All.SendAsync($"ReceiveLock-{pageId}", response);
    }

    public async Task GetAllLocks(string pageId)
    {
        var locks = await lockService.GetAllLocks(pageId);

        await Clients.Caller.SendAsync($"ReceiveAllLocks-{pageId}", locks);
    }
}