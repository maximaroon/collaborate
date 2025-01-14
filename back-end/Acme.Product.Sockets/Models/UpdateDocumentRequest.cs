namespace Acme.Product.Sockets.Models;

public class UpdateDocumentRequest
{
    public required string PageId { get; set; }

    public required string Field { get; set; }

    public required string Content { get; set; }
}