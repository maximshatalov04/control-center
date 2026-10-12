using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public interface IInventoryService
{
  List<ServerInfo> GetServers();
  ServerInfo? GetServerById(string id);
  List<DatabaseInfo> GetDatabases();
  DatabaseInfo? GetDatabaseById(string id);
  List<FileArchiveInfo> GetFileArchives();
  FileArchiveInfo? GetFileArchiveById(string id);

  ServerMetrics GetServerMetrics(string serverId);
  DatabaseMetrics GetDatabaseMetrics(string databaseId);
  FileArchiveMetrics GetFileArchiveMetrics(string fileArchiveId);
}

public class InventoryService : IInventoryService
{
  private readonly InventoryConfig _config;
  private readonly List<ServerInfo> _servers;
  private readonly List<DatabaseInfo> _databases;
  private readonly List<FileArchiveInfo> _fileArchives;

  private readonly Dictionary<string, ServerMetrics> _serverMetricsBase;
  private readonly Dictionary<string, DatabaseMetrics> _databaseMetricsBase;
  private readonly Dictionary<string, FileArchiveMetrics> _fileArchiveMetricsBase;

  private readonly Dictionary<string, DateTime> _lastUpdateTime = new();
  private readonly Random _random = new();

  public InventoryService(ILogger<InventoryService> logger)
  {
    _config = new InventoryConfig(); // В реальном проекте читай из appsettings.json / IOptions<>

    var jsonPath = Path.Combine(AppContext.BaseDirectory, "data", "inventory.json");
    if (!File.Exists(jsonPath))
      throw new FileNotFoundException($"JSON file not found: {jsonPath}");

    var json = File.ReadAllText(jsonPath);
    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
    var root = JsonSerializer.Deserialize<InventoryRoot>(json, options)
        ?? throw new InvalidOperationException("Failed to deserialize JSON.");

    _servers = root.Servers ?? new List<ServerInfo>();
    _databases = root.Databases ?? new List<DatabaseInfo>();
    _fileArchives = root.FileArchives ?? new List<FileArchiveInfo>();

    _serverMetricsBase = (root.ServerMetrics ?? new List<ServerMetrics>())
        .ToDictionary(m => m.ServerId, m => m);

    _databaseMetricsBase = (root.DatabaseMetrics ?? new List<DatabaseMetrics>())
        .ToDictionary(m => m.DatabaseId, m => m);

    _fileArchiveMetricsBase = (root.FileArchiveMetrics ?? new List<FileArchiveMetrics>())
        .ToDictionary(m => m.FileArchiveId, m => m);
  }

  public List<ServerInfo> GetServers() => _servers;
  public ServerInfo? GetServerById(string id) => _servers.FirstOrDefault(s => s.Id == id);
  public List<DatabaseInfo> GetDatabases() => _databases;
  public DatabaseInfo? GetDatabaseById(string id) => _databases.FirstOrDefault(d => d.Id == id);
  public List<FileArchiveInfo> GetFileArchives() => _fileArchives;
  public FileArchiveInfo? GetFileArchiveById(string id) => _fileArchives.FirstOrDefault(f => f.Id == id);

  public ServerMetrics GetServerMetrics(string serverId)
  {
    if (!_serverMetricsBase.TryGetValue(serverId, out var baseM))
      return new ServerMetrics { ServerId = serverId };

    return ApplyVariance(baseM, _config.ServerMetrics, GetLastUpdateKey(serverId));
  }

  public DatabaseMetrics GetDatabaseMetrics(string databaseId)
  {
    if (!_databaseMetricsBase.TryGetValue(databaseId, out var baseM))
      return new DatabaseMetrics { DatabaseId = databaseId };

    return ApplyVariance(baseM, _config.DatabaseMetrics, GetLastUpdateKey(databaseId));
  }

  public FileArchiveMetrics GetFileArchiveMetrics(string fileArchiveId)
  {
    if (!_fileArchiveMetricsBase.TryGetValue(fileArchiveId, out var baseM))
      return new FileArchiveMetrics { FileArchiveId = fileArchiveId };

    return ApplyVariance(baseM, _config.FileArchiveMetrics, GetLastUpdateKey(fileArchiveId));
  }


  private string GetLastUpdateKey(string id) => $"metric_{id}";

  private T ApplyVariance<T>(T baseM, MetricUpdateConfig config, string key) where T : class
  {
    // Простая логика: если интервал задан и время прошло — обновляем значение
    var now = DateTime.UtcNow;
    if (_lastUpdateTime.TryGetValue(key, out var last) && config != null)
    {
      // Здесь можно добавить логику: обновлять только если прошло N секунд
      // Для простоты: всегда пересчитываем с вариацией, но можно кэшировать
    }
    _lastUpdateTime[key] = now;

    if (typeof(T) == typeof(ServerMetrics))
    {
      var m = (ServerMetrics)(object)baseM!;
      var clone = new ServerMetrics
      {
        ServerId = m.ServerId,
        Status = m.Status,
        LastStartAt = m.LastStartAt
      };

      clone.CpuUsagePercent = ApplyVarianceDouble(m.CpuUsagePercent, config.CpuUsageSeconds);
      clone.MemoryUsagePercent = ApplyVarianceDouble(m.MemoryUsagePercent, config.MemoryUsageSeconds);
      clone.DiskUsagePercent = ApplyVarianceDouble(m.DiskUsagePercent, config.DiskUsageSeconds);

      return (T)(object)clone;
    }
    else if (typeof(T) == typeof(DatabaseMetrics))
    {
      var m = (DatabaseMetrics)(object)baseM!;
      var clone = new DatabaseMetrics
      {
        DatabaseId = m.DatabaseId,
        Status = m.Status,
        LastBackupAt = m.LastBackupAt
      };

      clone.SizeBytes = ApplyVarianceLong(m.SizeBytes, config.SizeBytesSeconds);
      clone.LogSizeBytes = ApplyVarianceLong(m.LogSizeBytes, config.LogSizeBytesSeconds);

      return (T)(object)clone;
    }
    else if (typeof(T) == typeof(FileArchiveMetrics))
    {
      var m = (FileArchiveMetrics)(object)baseM!;
      var clone = new FileArchiveMetrics
      {
        FileArchiveId = m.FileArchiveId,
        Status = m.Status,
        LastModifiedAt = DateTime.Now,
      };

      clone.UsedBytes = ApplyVarianceLong(m.UsedBytes, config.UsedBytesSeconds);
      clone.FileCount = ApplyVarianceInt(m.FileCount, config.FileCountSeconds);

      return (T)(object)clone;
    }

    return baseM;
  }

  private double ApplyVarianceDouble(double baseValue, int? intervalSeconds)
  {
    // Всегда добавляем вариацию ±10%. Интервал можно использовать для кэширования
    var delta = baseValue * 0.10;
    var rand = (_random.NextDouble() * 2.0 - 1.0) * delta; // от -delta до +delta
    var newValue = baseValue + rand;
    return Math.Max(0, Math.Round(newValue, 1)); // защита от отрицательных значений
  }

  private long ApplyVarianceLong(long baseValue, int? intervalSeconds)
  {
    var doubleVal = (double)baseValue;
    var newDouble = ApplyVarianceDouble(doubleVal, intervalSeconds);
    return (long)Math.Max(0, newDouble);
  }

  private int ApplyVarianceInt(int baseValue, int? intervalSeconds)
  {
    var doubleVal = (double)baseValue;
    var newDouble = ApplyVarianceDouble(doubleVal, intervalSeconds);
    return (int)Math.Max(0, newDouble);
  }
}

// Корневой объект JSON
public class InventoryRoot
{
  public List<ServerInfo>? Servers { get; set; }
  public List<ServerMetrics>? ServerMetrics { get; set; }
  public List<DatabaseInfo>? Databases { get; set; }
  public List<DatabaseMetrics>? DatabaseMetrics { get; set; }
  public List<FileArchiveInfo>? FileArchives { get; set; }
  public List<FileArchiveMetrics>? FileArchiveMetrics { get; set; }
}
