public class MetricUpdateConfig
{
  // Интервал в секундах. Если null — не обновлять (статично)
  public int? CpuUsageSeconds { get; set; }
  public int? MemoryUsageSeconds { get; set; }
  public int? DiskUsageSeconds { get; set; }
  public int? SizeBytesSeconds { get; set; }
  public int? LogSizeBytesSeconds { get; set; }
  public int? UsedBytesSeconds { get; set; }
  public int? FileCountSeconds { get; set; }
}

public class InventoryConfig
{
  public MetricUpdateConfig ServerMetrics = new MetricUpdateConfig
  {
    CpuUsageSeconds = 2,
    MemoryUsageSeconds = 3,
    DiskUsageSeconds = 5
  };

  public MetricUpdateConfig DatabaseMetrics = new MetricUpdateConfig
  {
    SizeBytesSeconds = 2,
    LogSizeBytesSeconds = 5
  };

  public MetricUpdateConfig FileArchiveMetrics = new MetricUpdateConfig
  {
    UsedBytesSeconds = 5,
    FileCountSeconds = 30
  };
}
