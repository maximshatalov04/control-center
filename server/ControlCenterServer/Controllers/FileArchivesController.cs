using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/file-archives")] // будет: /api/file-archives
public class FileArchivesController : ControllerBase
{
    private readonly IInventoryService _inventory;

    public FileArchivesController(IInventoryService inventory)
    {
        _inventory = inventory;
    }

    [HttpGet]
    public ActionResult<List<FileArchiveInfo>> GetAll()
        => Ok(_inventory.GetFileArchives());

    [HttpGet("{id}")]
    public ActionResult<FileArchiveInfo?> GetById(string id)
    {
        var archive = _inventory.GetFileArchiveById(id);
        if (archive == null) return NotFound();
        return Ok(archive);
    }

    [HttpGet("{fileArchiveId}/metrics")]
    public ActionResult<FileArchiveMetrics> GetMetrics(string fileArchiveId)
        => Ok(_inventory.GetFileArchiveMetrics(fileArchiveId));
}
