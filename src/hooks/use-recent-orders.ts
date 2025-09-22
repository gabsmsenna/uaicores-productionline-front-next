// hooks/useRecentOrders.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useApiRequest } from "@/hooks/use-api-request";
import { Item, OrderStatus } from "@/types/types";

interface RecentOrders {
  orderId: number;
  clientName: string;
  status: OrderStatus;
  items: Item[];
}

interface UseRecentOrdersReturn {
  recentOrders: RecentOrders[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useRecentOrders(): UseRecentOrdersReturn {
  const { status } = useSession();
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  const { data, loading, error, execute } = useApiRequest<RecentOrders[]>({
    enableCache: true,
    cacheDuration: CACHE_DURATION,
  });

  // Verifica se os dados estão obsoletos
  const isStale = !lastFetch || (Date.now() - lastFetch > CACHE_DURATION);

  // Função principal de fetch
  const fetchRecentOrders = useCallback(
    async (force = false): Promise<void> => {
      // Verifica se deve fazer fetch
      if (!force && !isStale && data) return;

      try {
        await execute("/order/recent-orders");
        setLastFetch(Date.now());
      } catch (err) {
        // Erro já é tratado pelo useApiRequest
      }
    },
    [execute, isStale, data]
  );

  // Função para refetch manual
  const refetch = useCallback(async (): Promise<void> => {
    await fetchRecentOrders(true);
  }, [fetchRecentOrders]);

  // Effect para fetch automático
  useEffect(() => {
    if (status === "authenticated") {
      fetchRecentOrders();
    }
  }, [status, fetchRecentOrders]);

  return {
    recentOrders: data,
    loading,
    error,
    refetch,
    isStale,
  };
}