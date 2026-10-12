using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
  private readonly IInventoryService _inventory;

  public ServersController(IInventoryService inventory)
  {
    _inventory = inventory;
  }

  [HttpGet]
  public ActionResult<List<ServerInfo>> GetAll()
      => Ok(_inventory.GetServers());

  [HttpGet("{id}")]
  public ActionResult<ServerInfo?> GetById(string id)
  {
    var server = _inventory.GetServerById(id);
    if (server == null) return NotFound();
    return Ok(server);
  }

  [HttpGet("{serverId}/metrics")]
  public ActionResult<ServerMetrics> GetMetrics(string serverId)
      => Ok(_inventory.GetServerMetrics(serverId));
}
