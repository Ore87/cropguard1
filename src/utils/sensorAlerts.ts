import { supabase } from "@/integrations/supabase/client";

interface SensorValues {
  soil_moisture: number;
  temperature: number;
  humidity: number;
  light_intensity: number;
}

export const checkAndCreateSensorAlerts = async (
  farmId: string,
  values: SensorValues
) => {
  try {
    // Check for low soil moisture (<30%)
    if (values.soil_moisture < 30) {
      await createSensorAlert(
        farmId,
        'Low Soil Moisture',
        `Critical: Soil moisture at ${values.soil_moisture.toFixed(1)}%. Immediate irrigation recommended.`,
        'critical',
        'moisture'
      );
    }
    // Check for high soil moisture (>80%)
    else if (values.soil_moisture > 80) {
      await createSensorAlert(
        farmId,
        'High Soil Moisture',
        `Warning: Soil moisture at ${values.soil_moisture.toFixed(1)}%. Risk of waterlogging. Check drainage.`,
        'high',
        'moisture'
      );
    }

    // Check for extreme temperature (>38°C or <10°C)
    if (values.temperature > 38) {
      await createSensorAlert(
        farmId,
        'Extreme Heat Alert',
        `Temperature at ${values.temperature.toFixed(1)}°C. Critical heat stress for crops. Increase irrigation.`,
        'critical',
        'irrigation'
      );
    } else if (values.temperature < 10) {
      await createSensorAlert(
        farmId,
        'Cold Temperature Alert',
        `Temperature at ${values.temperature.toFixed(1)}°C. Cold stress risk. Monitor sensitive crops.`,
        'high',
        'irrigation'
      );
    }

    // Check for very low humidity (<40%)
    if (values.humidity < 40) {
      await createSensorAlert(
        farmId,
        'Low Humidity Alert',
        `Humidity at ${values.humidity.toFixed(1)}%. Risk of plant water stress. Consider misting or irrigation.`,
        'medium',
        'irrigation'
      );
    }

    // Check for insufficient light (<3000 lux)
    if (values.light_intensity < 3000) {
      await createSensorAlert(
        farmId,
        'Low Light Intensity',
        `Light intensity at ${values.light_intensity.toFixed(0)} lux. May affect photosynthesis and growth.`,
        'low',
        'system'
      );
    }
  } catch (error) {
    console.error('Error checking sensor alerts:', error);
  }
};

const createSensorAlert = async (
  farmId: string,
  alertType: string,
  message: string,
  severity: string,
  type: string
) => {
  try {
    // Check if similar alert exists in last 6 hours to avoid spam
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('farm_id', farmId)
      .eq('alert_type', alertType)
      .eq('type', type)
      .gte('created_at', sixHoursAgo)
      .limit(1);

    // Don't create duplicate alert if one exists
    if (existingAlerts && existingAlerts.length > 0) {
      return;
    }

    const { error } = await supabase
      .from('alerts')
      .insert({
        farm_id: farmId,
        alert_type: alertType,
        severity: severity,
        message: message,
        type: type,
        priority: 3,
        is_read: false
      });

    if (error) {
      console.error('Error creating sensor alert:', error);
    }
  } catch (error) {
    console.error('Error in createSensorAlert:', error);
  }
};
