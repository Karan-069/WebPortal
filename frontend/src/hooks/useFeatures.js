import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Hook to manage and retrieve Model-wise Feature Flags.
 * Returns a map of feature keys to their enabled status.
 * e.g., { WF_VENDOR: true, AUTOID_BILL: false }
 */
export function useFeatures() {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get("/features/map");
        setFeatures(res.data.data || {});
      } catch (err) {
        console.error("Failed to fetch features:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const isEnabled = (featureKey) => {
    if (!featureKey) return false;
    return !!features[featureKey];
  };

  return { features, isEnabled, loading, error };
}
