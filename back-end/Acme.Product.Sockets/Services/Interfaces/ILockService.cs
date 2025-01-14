using Acme.Product.Sockets.Models;

namespace Acme.Product.Sockets.Services.Interfaces;

public interface ILockService
{
    Task<bool> RequestLock(string pageId, string userId, string field);
    
    Task<bool> RequestUnlock(string pageId, string userId, string field);

    Task<IEnumerable<LockResponse>> GetAllLocks(string pageId);
}