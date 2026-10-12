using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")] // будет: /api/databases
public class DatabasesController : ControllerBase
{
  private readonly IInventoryService _inventory;

  public DatabasesController(IInventoryService inventory)
  {
    _inventory = inventory;
  }

  [HttpGet]
  public ActionResult<List<DatabaseInfo>> GetAll()
      => Ok(_inventory.GetDatabases());

  [HttpGet("{id}")]
  public ActionResult<DatabaseInfo?> GetById(string id)
  {
    var db = _inventory.GetDatabaseById(id);
    if (db == null) return NotFound();
    return Ok(db);
  }

  [HttpGet("{databaseId}/metrics")]
  public ActionResult<DatabaseMetrics> GetMetrics(string databaseId)
      => Ok(_inventory.GetDatabaseMetrics(databaseId));
}
