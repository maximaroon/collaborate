using Acme.Product.Sockets.Enumerations;
using Acme.Product.Sockets.Models;
using Acme.Product.Sockets.Services.Interfaces;

namespace Acme.Product.Sockets.Services;

public class LockService(ILogger<ILockService> logger) : ILockService
{
    private static Dictionary<string, Dictionary<string, string>> _locks = new();
    
    public Task<bool> RequestLock(string pageId, string userId, string field)
    {
        logger.LogInformation("Lock requested for section {pageId}, field {field} by user {userId}", pageId, field ,userId);
        
        if (!_locks.ContainsKey(pageId))
        {
            _locks.Add(pageId, new Dictionary<string, string>());
        }
        
        if (!_locks.TryGetValue(pageId, out var lockSection))
        {
            logger.LogError("This should not be possible since it should be just created.");

            return Task.FromResult(false);
        }
        
        if (!lockSection.TryAdd(field, userId))
        {
            return Task.FromResult(false);
        }

        logger.LogInformation("Lock applied for section {pageId}, field {field} for user {userId}", pageId, field, userId);

        return Task.FromResult(true);
    }
    
    public Task<bool> RequestUnlock(string pageId, string userId, string field)
    {
        logger.LogInformation("Unlock requested for section {pageId}, field {field} by user {userId}", pageId, field, userId);
        
        if (!_locks.TryGetValue(pageId, out var lockSection))
        {
            logger.LogWarning("Requested section {pageId} does not exists.", pageId);
            
            return Task.FromResult(false);
        }
        
        try
        {
            _locks.Remove(field);
            logger.LogInformation("Lock has been removed for field {field} by userId {userId}", field, userId);
        }
        catch (ArgumentNullException ex)
        {
            logger.LogWarning("Requested section {pageId} does not contain field {field}.", pageId, field);

            return Task.FromResult(false);    
        }
        
        return Task.FromResult(true);
    }

    public Task<IEnumerable<LockResponse>> GetAllLocks(string pageId)
    {
        logger.LogInformation("Requested all locks for section {pageId}.", pageId);

        if (!_locks.TryGetValue(pageId, out var lockSection))
        {
            logger.LogWarning("No record has been found for section {pageId}", pageId);

            IEnumerable<LockResponse> emptyResult = [];
            
            return Task.FromResult(emptyResult);
        }
        
        var locks = lockSection.Select(l => new LockResponse
        {
            Field = l.Key,
            Owner = l.Value,
            Type = LockType.Lock.ToString()
        });
        
        return Task.FromResult(locks);
    }
}