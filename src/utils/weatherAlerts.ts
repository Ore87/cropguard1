import { supabase } from "@/integrations/supabase/client";

interface WeatherAlertCondition {
  temp?: number;
  humidity?: number;
  weatherCode?: number;
}

export const checkAndCreateWeatherAlerts = async (
  farmId: string,
  temp: number,
  humidity: number,
  weatherCode: number
) => {
  try {
    // Check for extreme heat (>35°C)
    if (temp > 35) {
      await createWeatherAlert(
        farmId,
        'High Temperature Warning',
        `Extreme heat detected: ${Math.round(temp)}°C. Monitor crop stress levels and ensure adequate irrigation.`,
        'critical'
      );
    }

    // Check for high humidity (>80%)
    if (humidity > 80) {
      await createWeatherAlert(
        farmId,
        'High Humidity Alert',
        `High humidity levels detected (${Math.round(humidity)}%). Increase ventilation to prevent fungal growth.`,
        'high'
      );
    }

    // Check for severe weather codes (thunderstorms, heavy rain)
    if (weatherCode >= 95) { // Thunderstorm codes
      await createWeatherAlert(
        farmId,
        'Severe Weather Alert',
        'Thunderstorm warning. Secure equipment and ensure proper drainage systems are clear.',
        'critical'
      );
    } else if (weatherCode >= 61 && weatherCode <= 67) { // Heavy rain codes
      await createWeatherAlert(
        farmId,
        'Heavy Rainfall Alert',
        'Heavy rainfall forecast. Ensure drainage systems are clear and protect sensitive crops.',
        'high'
      );
    }

    // Check for frost risk (temperature < 5°C)
    if (temp < 5) {
      await createWeatherAlert(
        farmId,
        'Frost Risk Warning',
        `Low temperature detected: ${Math.round(temp)}°C. Frost risk for sensitive crops. Consider protective measures.`,
        'critical'
      );
    }
  } catch (error) {
    console.error('Error checking weather alerts:', error);
  }
};

const createWeatherAlert = async (
  farmId: string,
  alertType: string,
  message: string,
  severity: string
) => {
  try {
    // Check if similar alert exists in last 24 hours to avoid duplicates
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('farm_id', farmId)
      .eq('alert_type', alertType)
      .eq('type', 'weather')
      .gte('created_at', dayAgo)
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
        type: 'weather',
        priority: 2,
        is_read: false
      });

    if (error) {
      console.error('Error creating weather alert:', error);
    }
  } catch (error) {
    console.error('Error in createWeatherAlert:', error);
  }
};
