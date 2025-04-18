// Types for the Crop Health API responses and requests

export interface SensorData {
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  pH: number;
  moisture: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface CropHealthScore {
  score: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
  recommendations: string[];
}

export interface PestDetectionResult {
  detected: boolean;
  pestName?: string;
  scientificName?: string;
  confidence?: number;
  affectedArea?: string;
  description?: string;
  treatment?: string[];
  organicSolutions?: string[];
  preventionMethods?: string[];
  imageUrl?: string;
}

// New interface for the plant disease prediction API response
export interface PlantDiseasePrediction {
  predictions: {
    class_name: string;
    confidence: number;
    health_score: number;
    prevention_tip: string;
  }[];
  message: string;
}

export interface IrrigationRecommendation {
  currentMoisture: number;
  optimalMoisture: number;
  recommendation: string;
  scheduleRecommendation: string;
  nextIrrigation: string;
}

export interface FertilizerPlan {
  recommendations: {
    nutrient: string;
    amount: string;
    schedule: string;
  }[];
  notes: string;
}

export interface YieldPrediction {
  estimatedYield: number;
  unit: string;
  comparisonToAverage: number;
  improvementSuggestions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
