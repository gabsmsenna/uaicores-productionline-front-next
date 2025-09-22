"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface DashboardAnalytics {
  ordersInProduction: number;
  ordersWaitingShipping: number;
  itemsInProduction: number;
  ordersShippedLastWeek: number;
}

interface UseDashboardAnalyticsReturn {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const DEFAULT_API_BASE = "http://localhost:8080/api";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const { data: session, status } = useSession();
  
  // Estados
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Configurações
  const API_BASE = DEFAULT_API_BASE;

  // Verifica se os dados estão obsoletos
  const isStale = !lastFetch || (Date.now() - lastFetch > CACHE_DURATION);

  // Função para tratar erros da API
  const parseApiError = (error: unknown, response?: Response): string => {
    if (error instanceof Error && error.name === "AbortError") {
      return "Request was cancelled";
    }

    if (response?.status === 401) {
      return "Session expired. Please log in again.";
    }

    if (response?.status === 403) {
      return "You don't have permission to access this data.";
    }
    if (response?.status === 500) {
      return "Server error. Please try again later.";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  };

  // Função principal de fetch
  const fetchDashboardAnalytics = useCallback(
    async (force = false): Promise<void> => {
      // Verifica se deve fazer fetch
      if (!force && !isStale && analytics) {
        return;
      }

      // Verifica autenticação
      if (status !== "authenticated" || !session?.accessToken) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Dashboard Analytics: User not authenticated or token missing");
        }
        return;
      }

      // Cancela requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cria novo AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/analytics/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          let errorMessage: string;
          
          try {
            const errorData: ApiErrorResponse = await response.json();
            errorMessage = errorData.message || errorData.error || response.statusText;
          } catch {
            errorMessage = response.statusText;
          }

          throw new Error(errorMessage);
        }

        const data: DashboardAnalytics = await response.json();

        // Só atualiza o estado se o componente ainda estiver montado
        if (isMountedRef.current) {
          setAnalytics(data);
          setLastFetch(Date.now());
          
          if (process.env.NODE_ENV === "development") {
            console.log("Dashboard Analytics fetched successfully:", data);
          }
        }

      } catch (err) {
        if (isMountedRef.current && err instanceof Error && err.name !== "AbortError") {
          const errorMessage = parseApiError(err);
          setError(errorMessage);
          
          if (process.env.NODE_ENV === "development") {
            console.error("Dashboard Analytics fetch error:", err);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [API_BASE, session?.accessToken, status, analytics, isStale]
  );

  // Função para refetch manual
  const refetch = useCallback(async (): Promise<void> => {
    await fetchDashboardAnalytics(true);
  }, [fetchDashboardAnalytics]);

  // Effect para fetch automático
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchDashboardAnalytics();
    }
  }, [status, session?.accessToken, fetchDashboardAnalytics]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch,
    isStale,
  };
}