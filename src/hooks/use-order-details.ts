"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Item, OrderStatus } from "@/types/types";

interface OrderDetails {
  orderId: number;
  saleDate: string;
  deliveryDate: string;
  clientName: string;
  status: OrderStatus;
  items: Item[];
}

interface UseOrderDetailReturn {
  order: OrderDetails | null;
  loading: boolean;
  error: string | null;
  fetchOrderDetails: (id: number, force?: boolean) => Promise<void>;
  isStale: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useOrderDetails(): UseOrderDetailReturn {
  const { data: session, status } = useSession();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const isStale = !lastFetch || Date.now() - lastFetch > CACHE_DURATION;

  const API_BASE = "http://localhost:8080/api";

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

  const fetchOrderDetails = useCallback(
    async (id: number, force = false): Promise<void> => {
      if (!force && !isStale) return;

      if (status !== "authenticated" || !session?.accessToken) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Recent Orders: User not authenticated or token missing"
          );
        }
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/order/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          let errorMessage: string;

          try {
            const errorData: ApiErrorResponse = await response.json();
            errorMessage =
              errorData.message || errorData.error || response.statusText;
          } catch {
            errorMessage = response.statusText;
          }

          throw new Error(errorMessage);
        }

        const data: OrderDetails = await response.json();

        if (isMountedRef.current) {
          setOrder(data);
          setLastFetch(Date.now());

          if (process.env.NODE_ENV === "development") {
            console.log("Recent Orders fetched successfully:", data);
          }
        }

        setOrder(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (
          isMountedRef.current &&
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
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
    [API_BASE, session?.accessToken, status, order, isStale]
  );

  // Função para refetch manual
  const refetch = useCallback(
    async (id: number, force?: boolean): Promise<void> => {
    await fetchOrderDetails(id, force);
  }, [fetchOrderDetails]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { order, loading, error, fetchOrderDetails, isStale };
}
