
export function formatSize(bytes: number): string {
    if (!bytes && bytes !== 0) return '0 Б';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' КБ';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(1) + ' МБ';
    const gb = mb / 1024;
    return gb.toFixed(1) + ' ГБ';
}

export function getUsagePercent(maxCapacityBytes: number, usedBytes: number): number {
    if (!maxCapacityBytes) return 0;
    return Math.round((usedBytes / maxCapacityBytes) * 100);
}


