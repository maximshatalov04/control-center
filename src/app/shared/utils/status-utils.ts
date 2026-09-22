import { ServerStatus } from '../models/server-status';
import { DatabaseStatus } from '../models/database-status';
import { FileArchiveStatus } from '../models/file-archive-status';

export function getServerStatusColor(status: ServerStatus | undefined): string {
    if (!status) return '';
    if (status.includes('Запущен')) return 'green';
    if (status.includes('Остановлен')) return 'yellow';
    return 'red';
}

export function getDatabaseStatusColor(status: DatabaseStatus | undefined): string {
    if (!status) return '';
    if (status.includes('Онлайн')) return 'green';
    if (status.includes('Офлайн')) return 'yellow';
    return 'red';
}

export function getArchiveStatusColor(status: FileArchiveStatus | undefined): string {
    if (!status) return '';
    if (status === 'Доступен') return 'green';
    if (status === 'Только чтение') return 'yellow';
    return 'red';
}