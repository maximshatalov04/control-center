// Models/Metrics.cs
public class ServerMetrics
{
  public string ServerId { get; set; } = string.Empty;
  public string Status { get; set; }
  public DateTime? LastStartAt { get; set; }
  public double CpuUsagePercent { get; set; }
  public double MemoryUsagePercent { get; set; }
  public double DiskUsagePercent { get; set; }
}

public class DatabaseMetrics
{
  public string DatabaseId { get; set; } = string.Empty;
  public string Status { get; set; }
  public long SizeBytes { get; set; }
  public long LogSizeBytes { get; set; }
  public DateTime? LastBackupAt { get; set; }
}

public class FileArchiveMetrics
{
  public string FileArchiveId { get; set; } = string.Empty;
  public string Status { get; set; }
  public long UsedBytes { get; set; }
  public int FileCount { get; set; }
  public DateTime? LastModifiedAt { get; set; }
}
