// Purpose: Model: Defines data structures and types for the application.
// models/dashboard.model.ts
// Defines the data model structure
export interface Stat {
    title: string;
    value: string | number;
    change: string;
    icon: string;
}

// Defines the data model structure
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

// Defines the data model structure
export interface DashboardResponse {
    stats: Stat[];
    chart: number[];
    table: TableItem[];
}