// hooks/useUpdateItem.ts
"use client";

import { useCallback } from "react";
import { useApiRequest } from "@/hooks/use-api-request";

interface UpdateItemDto {
  name?: string;
  quantity?: number;
  saleQuantity?: number;
  material?: string;
  image?: string;
  itemStatus?: string;
  orderId?: number;
}

interface UseUpdateItemReturn {
  updateItem: (itemId: string | number, data: UpdateItemDto) => Promise<void>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUpdateItem(): UseUpdateItemReturn {
  const { loading, error, execute, reset } = useApiRequest<void>();

  const updateItem = useCallback(
    async (itemId: string | number, data: UpdateItemDto): Promise<void> => {
      if (!data || Object.keys(data).length === 0) {
        throw new Error("É necessário pelo menos um argumento para edição.");
      }

      console.log('Item enviado para PATCH ', data);

      await execute(`/item/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    [execute]
  );

  return {
    updateItem,
    loading,
    error,
    reset,
  };
}