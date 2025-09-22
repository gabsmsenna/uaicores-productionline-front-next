/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Item } from "@/types/types";

export function useProductionItems() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    process.env.BACKEND_API_BASE_URL ?? "http://localhost:8080/api";

  const fetchProductionItems = useCallback(
    async (signal?: AbortSignal) => {
      const token = session?.accessToken;

      if (!token || status !== "authenticated") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/production/items`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Failed to fetch production items:", text);
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data: Item[] = await response.json();
        setItems(data);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Error fetching production items:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch production items");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, session, status] 
  );

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchProductionItems();
    }
  }, [status, session?.accessToken, fetchProductionItems]);

  const refetch = async () => {
    await fetchProductionItems();
  };

  return { items, loading, error, refetch };
}
