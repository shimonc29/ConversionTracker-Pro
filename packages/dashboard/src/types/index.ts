export interface DashboardData {
  conversions: ProcessedConversion[];
  summary: {
    totalConversions: number;
    totalValue: number;
    conversionRate: number;
    topSources: SourceMetric[];
  };
  attribution: {
    modelComparison: ModelComparison[];
    sourceAttribution: SourceAttribution[];
  };
}

export interface ModelComparison {
  model: string;
  conversions: number;
  value: number;
  difference: number;
}

export interface ProcessedConversion {
  // Define fields as needed or import from shared/server-functions
}

export interface SourceMetric {
  // Define fields as needed
}

export interface SourceAttribution {
  // Define fields as needed
} 