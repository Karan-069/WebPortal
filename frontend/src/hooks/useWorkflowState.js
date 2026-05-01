import { useState, useEffect } from "react";
import api from "../services/api";

export function useWorkflowState(transactionId, transactionModel) {
  const [workflowState, setWorkflowState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkflowState = async () => {
    if (!transactionId || !transactionModel) return;
    setLoading(true);
    try {
      const res = await api.get(`/workflows/get-state`, {
        params: { transactionId, transactionModel },
      });
      setWorkflowState(res.data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch workflow state:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowState();
  }, [transactionId, transactionModel]);

  return { workflowState, loading, error, refresh: fetchWorkflowState };
}
