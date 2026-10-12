//public enum ServerStatus { Запущен, Остановлен, Недоступен }
//public enum DatabaseStatus { Онлайн, Офлайн, Восстановление, Ошибка }
//public enum FileArchiveStatus { Доступен, ТолькоЧтение, Недоступен }

public class ServerInfo
{
  public string Id { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string IpAddress { get; set; } = string.Empty;
  public int Port { get; set; }
  public string SoftwareVersion { get; set; } = string.Empty;
  public string Os { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public List<string> DatabaseIds { get; set; } = new();
}

public class DatabaseInfo
{
  public string Id { get; set; } = string.Empty;
  public string ServerId { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string DbType { get; set; } = string.Empty;
  public string Version { get; set; } = string.Empty;
  public string ConnectionString { get; set; } = string.Empty;
  public string Encoding { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public List<string> ArchiveIds { get; set; } = new();
}

public class FileArchiveInfo
{
  public string Id { get; set; } = string.Empty;
  public string DatabaseId { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string Path { get; set; } = string.Empty;
  public long MaxCapacityBytes { get; set; }
  public string RetentionPolicy { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
}
