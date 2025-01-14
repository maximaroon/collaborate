using Acme.Product.Sockets.Hubs;
using Acme.Product.Sockets.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Acme.Product.Sockets.Controllers;

[ApiController]
[Route("[controller]")]
public class DocumentController(IHubContext<RealTimeHub> hubContext)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]UpdateDocumentRequest request)
    {
        await hubContext.Clients.All.SendAsync($"ReceiveContent-{request.PageId}", new { request.Field, request.Content });
        
        return Ok();
    }
}