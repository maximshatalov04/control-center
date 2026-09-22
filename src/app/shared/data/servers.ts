import { ServerInfo } from "../../domain/servers/models/server-info";

export const MOCK_SERVERS: ServerInfo[] = [
    {
        id: 'srv-001',
        name: 'Сервер приложений PROD-01',
        ipAddress: '192.168.10.11',
        port: 8080,
        softwareVersion: '5.12.3',
        os: 'CentOS 7.9 (x64)',
        lastStartAt: '2024-10-15T08:23:11Z',
        description: 'Основной сервер продуктивного контура. Обрабатывает основную нагрузку по бизнес-процессам.',
        status: 'Запущен',
        cpuUsagePercent: 43,
        memoryUsagePercent: 58,
        diskUsagePercent: 67,
        databases: [
            {
                id: 'db-001-1',
                name: 'PROD_MAIN_DB',
                dbType: 'PostgreSQL',
                version: '14.5',
                connectionString: 'Host=192.168.10.11;Port=5432;Database=PROD_MAIN_DB;Username=admin;Password=********',
                encoding: 'UTF-8',
                sizeBytes: 12867234560,
                logSizeBytes: 2147483648,
                status: 'Онлайн',
                lastBackupAt: '2024-11-18T03:00:00Z',
                description: 'Основная база данных продуктивного контура.',
                archives: [
                    {
                        id: 'arch-001-1-1',
                        name: 'Backup_2024_Q4',
                        path: '/var/backups/prod_main/q4',
                        maxCapacityBytes: 107374182400,   // 100 ГБ
                        usedBytes: 64424509440,            // ~60 ГБ
                        fileCount: 1248,
                        status: 'Доступен',
                        lastModifiedAt: '2024-11-18T03:15:00Z',
                        retentionPolicy: '90 дней',
                        description: 'Резервные копии за четвёртый квартал 2024 года.'
                    },
                    {
                        id: 'arch-001-1-2',
                        name: 'Logs_Archive_2024',
                        path: '/var/logs/prod_main/2024',
                        maxCapacityBytes: 53687091200,    // 50 ГБ
                        usedBytes: 12884901888,           // ~12 ГБ
                        fileCount: 8421,
                        status: 'Только чтение',
                        lastModifiedAt: '2024-11-15T22:30:00Z',
                        retentionPolicy: 'Навсегда',
                        description: 'Архив журнальных записей за 2024 год.'
                    }
                ]
            },
            {
                id: 'db-001-2',
                name: 'PROD_ANALYTICS_DB',
                dbType: 'ClickHouse',
                version: '23.8.4',
                connectionString: 'Host=192.168.10.11;Port=8123;Database=PROD_ANALYTICS_DB;Username=analyst;Password=********',
                encoding: 'UTF-8',
                sizeBytes: 89213456789,
                logSizeBytes: 5368709120,
                status: 'Онлайн',
                lastBackupAt: '2024-11-17T02:00:00Z',
                description: 'Аналитическая база данных для OLAP-нагрузки.',
                archives: [
                    {
                        id: 'arch-001-2-1',
                        name: 'Analytics_Daily_Export',
                        path: '/var/backups/analytics/daily',
                        maxCapacityBytes: 214748364800,   // 200 ГБ
                        usedBytes: 161061273600,          // ~150 ГБ
                        fileCount: 365,
                        status: 'Доступен',
                        lastModifiedAt: '2024-11-19T01:00:00Z',
                        retentionPolicy: '30 дней',
                        description: 'Ежедневный экспорт аналитических данных.'
                    }
                ]
            }
        ]
    },
    {
        id: 'srv-002',
        name: 'Сервер приложений STAGE-02',
        ipAddress: '192.168.10.12',
        port: 8081,
        softwareVersion: '5.11.0',
        os: 'Ubuntu 22.04 LTS (x64)',
        lastStartAt: '2024-10-14T14:45:00Z',
        description: 'Стенд для предпродакшн-тестирования. Используется для валидации релизов перед выкладкой в PROD.',
        status: 'Запущен',
        cpuUsagePercent: 27,
        memoryUsagePercent: 35,
        diskUsagePercent: 41,
        databases: [
            {
                id: 'db-002-1',
                name: 'STAGE_MAIN_DB',
                dbType: 'PostgreSQL',
                version: '15.2',
                connectionString: 'Host=192.168.10.12;Port=5432;Database=STAGE_MAIN_DB;Username=stage;Password=********',
                encoding: 'UTF-8',
                sizeBytes: 5432109876,
                logSizeBytes: 536870912,
                status: 'Онлайн',
                lastBackupAt: '2024-11-16T04:00:00Z',
                description: 'Основная БД тестового стенда.',
                archives: [
                    {
                        id: 'arch-002-1-1',
                        name: 'Stage_Backup_Test',
                        path: '/var/backups/stage_main/test',
                        maxCapacityBytes: 21474836480,    // 20 ГБ
                        usedBytes: 5432109876,            // ~5 ГБ
                        fileCount: 48,
                        status: 'Доступен',
                        lastModifiedAt: '2024-11-16T04:30:00Z',
                        retentionPolicy: '14 дней',
                        description: 'Тестовые резервные копии стенда.'
                    }
                ]
            },
            {
                id: 'db-002-2',
                name: 'STAGE_TEMP_DB',
                dbType: 'MySQL',
                version: '8.0.34',
                connectionString: 'Host=192.168.10.12;Port=3306;Database=STAGE_TEMP_DB;Username=temp;Password=********',
                encoding: 'utf8mb4',
                sizeBytes: 2109876543,
                logSizeBytes: 268435456,
                status: 'Офлайн',
                lastBackupAt: null,
                description: 'Временная БД, используется для миграций.',
                archives: []
            }
        ]
    },
    {
        id: 'srv-003',
        name: 'Сервер приложений DEV-03',
        ipAddress: '192.168.10.13',
        port: 8082,
        softwareVersion: '5.10.7',
        os: 'Windows Server 2019 Standard',
        lastStartAt: '2024-10-10T09:15:30Z',
        description: 'Среда разработки. Используется командой разработки для отладки и написания нового функционала.',
        status: 'Остановлен',
        cpuUsagePercent: 12,
        memoryUsagePercent: 25,
        diskUsagePercent: 33,
        databases: [
            {
                id: 'db-003-1',
                name: 'DEV_MAIN_DB',
                dbType: 'MS SQL Server',
                version: '2019 CU15',
                connectionString: 'Server=192.168.10.13;Database=DEV_MAIN_DB;User Id=dev;Password=********',
                encoding: 'Windows-1251',
                sizeBytes: 3210987654,
                logSizeBytes: 805306368,
                status: 'Восстановление',
                lastBackupAt: '2024-11-10T09:15:30Z',
                description: 'Основная база данных среды разработки.',
                archives: [
                    {
                        id: 'arch-003-1-1',
                        name: 'Dev_Snapshot_20241010',
                        path: 'D:\\backups\\dev_main\\20241010',
                        maxCapacityBytes: 10737418240,   // 10 ГБ
                        usedBytes: 3210987654,            // ~3 ГБ
                        fileCount: 12,
                        status: 'Доступен',
                        lastModifiedAt: '2024-10-10T09:20:00Z',
                        retentionPolicy: 'Навсегда',
                        description: 'Снапшот БД среды разработки от 10 октября 2024.'
                    }
                ]
            },
            {
                id: 'db-003-2',
                name: 'DEV_TEST_DB',
                dbType: 'SQLite',
                version: '3.42.0',
                connectionString: 'Data Source=D:\\databases\\dev_test.db;Version=3;',
                encoding: 'UTF-8',
                sizeBytes: 1073741824,
                logSizeBytes: 0,
                status: 'Онлайн',
                lastBackupAt: '2024-11-14T18:00:00Z',
                description: 'Тестовая БД на SQLite для быстрых проверок.',
                archives: []
            },
            {
                id: 'db-003-3',
                name: 'DEV_LOGGING_DB',
                dbType: 'MongoDB',
                version: '6.0.9',
                connectionString: 'mongodb://192.168.10.13:27017/DEV_LOGGING_DB?authSource=admin',
                encoding: 'UTF-8',
                sizeBytes: 4567890123,
                logSizeBytes: 1073741824,
                status: 'Ошибка',
                lastBackupAt: '2024-11-13T12:00:00Z',
                description: 'База данных логирования. Текущий статус — ошибка репликации.',
                archives: [
                    {
                        id: 'arch-003-3-1',
                        name: 'Log_Dump_2024',
                        path: 'D:\\backups\\dev_logging\\2024',
                        maxCapacityBytes: 21474836480,   // 20 ГБ
                        usedBytes: 4294967296,            // 4 ГБ
                        fileCount: 980,
                        status: 'Недоступен',
                        lastModifiedAt: '2024-11-13T12:30:00Z',
                        retentionPolicy: '60 дней',
                        description: 'Дамп логов за 2024 год. Хранилище временно недоступно.'
                    },
                    {
                        id: 'arch-003-3-2',
                        name: 'Metrics_Export_2024',
                        path: 'D:\\backups\\dev_logging\\metrics\\2024',
                        maxCapacityBytes: 10737418240,   // 10 ГБ
                        usedBytes: 1073741824,            // 1 ГБ
                        fileCount: 310,
                        status: 'Только чтение',
                        lastModifiedAt: '2024-11-12T23:45:00Z',
                        retentionPolicy: '90 дней',
                        description: 'Экспорт метрик за 2024 год.'
                    }
                ]
            }
        ]
    },
    {
        id: 'srv-004',
        name: 'Сервер приложений DR-04 (Резервный)',
        ipAddress: '192.168.10.14',
        port: 8083,
        softwareVersion: '5.12.1',
        os: 'Red Hat Enterprise Linux 8.9',
        lastStartAt: '2024-11-10T09:15:30Z',
        description: 'Резервный сервер для аварийного восстановления. В штатном режиме выключен.',
        status: 'Недоступен',
        cpuUsagePercent: 0,
        memoryUsagePercent: 0,
        diskUsagePercent: 15,
        databases: [
            {
                id: 'db-004-1',
                name: 'DR_SYNC_DB',
                dbType: 'Oracle Database',
                version: '19c',
                connectionString: 'Data Source=192.168.10.14:1521/DR_SYNC_DB;User Id=sys;Password=********;DBA Privilege=SYSDBA',
                encoding: 'AL32UTF8',
                sizeBytes: 9876543210,
                logSizeBytes: 3221225472,
                status: 'Офлайн',
                lastBackupAt: '2024-11-10T09:00:00Z',
                description: 'Резервная БД для синхронизации при аварийном восстановлении.',
                archives: [
                    {
                        id: 'arch-004-1-1',
                        name: 'DR_Sync_Snapshot',
                        path: '/u01/oracle/backups/dr_sync',
                        maxCapacityBytes: 107374182400,   // 100 ГБ
                        usedBytes: 9876543210,             // ~9.2 ГБ
                        fileCount: 5,
                        status: 'Доступен',
                        lastModifiedAt: '2024-11-10T09:15:00Z',
                        retentionPolicy: 'Навсегда',
                        description: 'Снапшот для аварийного восстановления.'
                    }
                ]
            }
        ]
    }
];
