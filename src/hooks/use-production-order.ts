/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Order } from "@/types/types";

export function useProductionOrders() {
  const { data: session, status } = useSession();
  const [orders, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080/api";

  const fetchProductionOrders = useCallback(
    async (signal?: AbortSignal) => {
      const token = session?.accessToken;

      if (!token || status !== "authenticated") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/production/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Failed to fetch production orders:", text);
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data: Order[] = await response.json();
        setItems(data);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Error fetching production orders:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch production orders"
          );
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, session, status] // ⚠️ importante: depende de session para capturar o token atualizado
  );

  /**
   * Executa fetch quando a sessão está autenticada
   */
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchProductionOrders();
    }
  }, [status, session?.accessToken, fetchProductionOrders]);

  const refetch = async () => {
    await fetchProductionOrders();
  };

  return { orders, loading, error, refetch };
}
