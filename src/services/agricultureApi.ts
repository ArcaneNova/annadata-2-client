import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  SensorData,
  CropHealthScore,
  IrrigationRecommendation,
  FertilizerPlan,
  YieldPrediction,
  ApiResponse
} from "@/types/agriculture-api";

// Base URL for the API - in production, this should come from environment variables
const API_BASE_URL = "https://api.annadata.example.com";

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return await response.json();
};

// Mock data for development purposes
const generateMockData = () => {
  // This function will be used during development before the actual API is ready
  return {
    success: true,
    data: {
      // Mock data will be specific to each endpoint
    }
  };
};

// API functions
export const fetchSensorData = async (): Promise<ApiResponse<SensorData>> => {
  // For development, return mock data
  // In production, use the actual API
  try {
    // Uncomment when API is ready
    // const response = await fetch(`${API_BASE_URL}/api/sensor-data`);
    // return handleResponse<SensorData>(response);
    
    // Mock data for development
    return {
      success: true,
      data: {
        npk: {
          nitrogen: Math.floor(Math.random() * 100),
          phosphorus: Math.floor(Math.random() * 100),
          potassium: Math.floor(Math.random() * 100)
        },
        pH: 6.5 + Math.random(),
        moisture: Math.floor(Math.random() * 100),
        temperature: 20 + Math.floor(Math.random() * 15),
        humidity: 40 + Math.floor(Math.random() * 40),
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

export const fetchCropHealth = async (): Promise<ApiResponse<CropHealthScore>> => {
  try {
    // Uncomment when API is ready
    // const response = await fetch(`${API_BASE_URL}/api/crop-health`);
    // return handleResponse<CropHealthScore>(response);
    
    // Mock data for development
    const score = Math.floor(Math.random() * 100);
    let status: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
    
    if (score >= 80) status = 'Excellent';
    else if (score >= 60) status = 'Good';
    else if (score >= 40) status = 'Average';
    else if (score >= 20) status = 'Poor';
    else status = 'Critical';
    
    return {
      success: true,
      data: {
        score,
        status,
        recommendations: [
          "Adjust irrigation schedule based on soil moisture",
          "Apply balanced N-P-K fertilizer as per soil test",
          "Monitor for early signs of pest or disease"
        ]
      }
    };
  } catch (error) {
    console.error("Error fetching crop health:", error);
    throw error;
  }
};

export const fetchIrrigationRecommendation = async (): Promise<ApiResponse<IrrigationRecommendation>> => {
  try {
    // Mock data for development
    const currentMoisture = 30 + Math.floor(Math.random() * 30);
    const optimalMoisture = 60 + Math.floor(Math.random() * 20);
    
    return {
      success: true,
      data: {
        currentMoisture,
        optimalMoisture,
        recommendation: currentMoisture < optimalMoisture ? 
          "Irrigation recommended: Soil moisture is below optimal levels" : 
          "No irrigation needed: Soil moisture is at optimal levels",
        scheduleRecommendation: "Best time for irrigation: Early morning or late evening",
        nextIrrigation: new Date(Date.now() + 86400000).toISOString()
      }
    };
  } catch (error) {
    console.error("Error fetching irrigation recommendation:", error);
    throw error;
  }
};

export const fetchFertilizerPlan = async (): Promise<ApiResponse<FertilizerPlan>> => {
  try {
    // Mock data for development
    return {
      success: true,
      data: {
        recommendations: [
          {
            nutrient: "Nitrogen",
            amount: "25 kg/hectare",
            schedule: "Apply in two splits - at planting and 30 days after"
          },
          {
            nutrient: "Phosphorus",
            amount: "20 kg/hectare",
            schedule: "Apply at planting time"
          },
          {
            nutrient: "Potassium",
            amount: "15 kg/hectare",
            schedule: "Apply at planting time"
          }
        ],
        notes: "Consider organic alternatives like compost or vermicompost for better soil health."
      }
    };
  } catch (error) {
    console.error("Error fetching fertilizer plan:", error);
    throw error;
  }
};

export const fetchYieldPrediction = async (): Promise<ApiResponse<YieldPrediction>> => {
  try {
    // Mock data for development
    return {
      success: true,
      data: {
        estimatedYield: 45 + Math.floor(Math.random() * 15),
        unit: "quintals/hectare",
        comparisonToAverage: Math.floor(Math.random() * 20) - 5,
        improvementSuggestions: [
          "Implement micro-irrigation for better water efficiency",
          "Use organic mulch to control weeds and conserve moisture",
          "Consider intercropping with legumes for natural nitrogen fixation"
        ]
      }
    };
  } catch (error) {
    console.error("Error fetching yield prediction:", error);
    throw error;
  }
};

// React Query hooks
export const useLatestSensorData = () => {
  return useQuery({
    queryKey: ["sensorData"],
    queryFn: fetchSensorData,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useCropHealth = () => {
  return useQuery({
    queryKey: ["cropHealth"],
    queryFn: fetchCropHealth,
  });
};

export const useIrrigationRecommendation = () => {
  return useQuery({
    queryKey: ["irrigation"],
    queryFn: fetchIrrigationRecommendation,
  });
};

export const useFertilizerPlan = () => {
  return useQuery({
    queryKey: ["fertilizer"],
    queryFn: fetchFertilizerPlan,
  });
};

export const useYieldPrediction = () => {
  return useQuery({
    queryKey: ["yieldPrediction"],
    queryFn: fetchYieldPrediction,
  });
};
