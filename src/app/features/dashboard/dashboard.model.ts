// models/dashboard.model.ts
export interface Stat {
    title: string;
    value: string | number;
    change: string;
    icon: string;
}

export interface TableItem {
    id: number;
    name: string;
    location: string;
    owner: string;
    company: string;
    date: string;
    status: string;
    files?: number;
    image: string;
}

export interface DashboardResponse {
    stats: Stat[];
    chart: number[];
    table: TableItem[];
}