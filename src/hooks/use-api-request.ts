/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useApiRequest.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface UseApiRequestConfig {
  baseUrl?: string;
  enableCache?: boolean;
  cacheDuration?: number;
}

interface UseApiRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (url: string, options?: RequestInit) => Promise<T>;
  reset: () => void;
}

const DEFAULT_API_BASE = "http://localhost:8080/api";
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useApiRequest<T = any>(config: UseApiRequestConfig = {}): UseApiRequestReturn<T> {
  const { data: session, status } = useSession();
  
  const {
    baseUrl = DEFAULT_API_BASE,
    enableCache = false,
    cacheDuration = DEFAULT_CACHE_DURATION,
  } = config;

  // Estados
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Verifica se os dados estão obsoletos (só se cache estiver habilitado)
  const isStale = enableCache && (!lastFetch || (Date.now() - lastFetch > cacheDuration));

  // Função para tratar erros da API
  const parseApiError = useCallback((error: unknown, response?: Response): string => {
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
  }, []);

  // Função principal de execução
  const execute = useCallback(
    async (url: string, options: RequestInit = {}): Promise<T> => {
      // Verifica autenticação
      if (status !== "authenticated" || !session?.accessToken) {
        throw new Error("User not authenticated or token missing");
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

        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
            ...options.headers,
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

        // Se não há conteúdo (204 No Content), retorna null
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          const result = null as T;
          
          if (isMountedRef.current) {
            setData(result);
            if (enableCache) setLastFetch(Date.now());
          }
          
          return result;
        }

        const result: T = await response.json();

        // Só atualiza o estado se o componente ainda estiver montado
        if (isMountedRef.current) {
          setData(result);
          if (enableCache) setLastFetch(Date.now());
          
          if (process.env.NODE_ENV === "development") {
            console.log("API request successful:", result);
          }
        }

        return result;

      } catch (err) {
        if (isMountedRef.current && err instanceof Error && err.name !== "AbortError") {
          const errorMessage = parseApiError(err);
          setError(errorMessage);
          
          if (process.env.NODE_ENV === "development") {
            console.error("API request error:", err);
          }
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [baseUrl, session?.accessToken, status, parseApiError, enableCache]
  );

  // Função para resetar estado
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
  }, []);

  // Cleanup effect
  useState(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  });

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}