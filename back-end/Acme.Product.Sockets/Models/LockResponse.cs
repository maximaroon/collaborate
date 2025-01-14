using Acme.Product.Sockets.Enumerations;

namespace Acme.Product.Sockets.Models;

public class LockResponse
{
    public required string Field { get; set; }

    public required string Owner { get; set; }

    public required string Type { get; set; }
    
    public string? Message { get; set; }

    public DateTime? When { get; set; }
}