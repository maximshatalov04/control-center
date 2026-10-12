using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

// DTO для дерева
public class FileArchiveTreeDto
{
  public string Id { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string Type { get; set; } = "archive";

}

public class DatabaseTreeDto
{
  public string Id { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string Type { get; set; } = "database";

  public List<FileArchiveTreeDto> Archives { get; set; } = new();
}

public class ServerTreeDto
{
  public string Id { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string Type { get; set; } = "server";

  public List<DatabaseTreeDto> Databases { get; set; } = new();
}

[ApiController]
[Route("api")]
public class ServersTreeController : ControllerBase
{
  private readonly IInventoryService _inventory;

  public ServersTreeController(IInventoryService inventory)
  {
    _inventory = inventory;
  }

  [HttpGet("servers-tree")]
  public ActionResult<List<ServerTreeDto>> GetServersTree()
  {
    var servers = _inventory.GetServers();
    var databases = _inventory.GetDatabases();
    var archives = _inventory.GetFileArchives();

    var result = new List<ServerTreeDto>();

    foreach (var s in servers)
    {
      var serverDto = new ServerTreeDto
      {
        Id = s.Id,
        Name = s.Name,
        Databases = new List<DatabaseTreeDto>()
      };

      var dbList = databases.Where(d => d.ServerId == s.Id).ToList();

      foreach (var d in dbList)
      {
        var dbDto = new DatabaseTreeDto
        {
          Id = d.Id,
          Name = d.Name,
          Archives = new List<FileArchiveTreeDto>()
        };

        var archList = archives.Where(a => a.DatabaseId == d.Id).ToList();
        foreach (var a in archList)
        {
          dbDto.Archives.Add(new FileArchiveTreeDto
          {
            Id = a.Id,
            Name = a.Name,
          });
        }

        serverDto.Databases.Add(dbDto);
      }

      result.Add(serverDto);
    }

    return Ok(result);
  }
}
