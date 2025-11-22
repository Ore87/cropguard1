-- Add priority field to alerts table for ordering
ALTER TABLE alerts ADD COLUMN priority integer DEFAULT 3;

-- Update priority values based on alert type
-- pest = 1 (highest priority), weather = 2, moisture/irrigation = 3, system = 4 (lowest)
UPDATE alerts SET priority = 
  CASE 
    WHEN type = 'pest' THEN 1
    WHEN type = 'weather' THEN 2
    WHEN type IN ('moisture', 'irrigation') THEN 3
    WHEN type = 'system' THEN 4
    ELSE 3
  END;

-- Add comment for documentation
COMMENT ON COLUMN alerts.priority IS 'Priority level for alert ordering: 1=pest (highest), 2=weather, 3=moisture/irrigation, 4=system (lowest)';