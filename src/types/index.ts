export interface FixedCost {
    id: string;
    name: string;
    value: number;
    icon: string;
}

export interface Collaborator {
    id: string;
    role: string;
    salary: number;
    hoursPerMonth: number;
}

export interface Material {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitValue: number;
    imageUrl?: string;
}

export interface DirectLabor {
    id: string;
    role: string;
    hourlyRate: number;
    hoursPlanned: number;
}

export interface ProjectBudget {
    id: string;
    name: string;
    materials: Material[];
    labor: DirectLabor[];
    productionDays: number;
    installationDays: number;
    taxesAndFees: number; // percentage
    profitMargin: number; // percentage
}
