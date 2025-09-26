/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import OrderCard from "@/components/order-card";
import ItemModal from "@/components/item-modal";
import OrderModal from "@/components/order-modal";
import { ProductionList } from "@/components/production-list";
import { useProductionItems } from "@/hooks/use-production-item";
import { useProductionOrders } from "@/hooks/use-production-order";
import { Item, Order } from "@/types/types";
import { Separator } from "@/components/ui/separator";
import { Package, Factory } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/app/dashboard/components/app-sidebar";
import { useUpdateItem } from "@/hooks/use-update-item";
import { useSession } from "next-auth/react";

export default function ProductionPage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const { updateItem } = useUpdateItem();
  const { data: session, status } = useSession();

  // Pedidos vindos da API
  const { orders, loading: ordersLoading } = useProductionOrders();

  // Itens em produção vindos da API
  const { items: productionItems, loading: productionLoading } =
    useProductionItems();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (productionItems) {
      setItems(productionItems);
    }
  }, [productionItems]);

  useEffect(() => {
    if (orders) {
      setLocalOrders(orders);
    }
  }, [orders]);

  const handleItemClick = (item: Item) => {
    console.log("Item clicado: ", item);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  function getChangedFields(
    original: Item,
    updated: Partial<Item>
  ): Partial<Item> {
    const changes: Partial<Item> = {};

    Object.keys(updated).forEach((key) => {
      const typedKey = key as keyof Item;
      if (original[typedKey] !== updated[typedKey]) {
        changes[typedKey] = updated[typedKey] as any;
      }
    });

    changes.orderId = original.orderId;

    return changes;
  }

  const handleSaveItem = async (
    itemId: string | number,
    updatedData: Partial<Item>
  ) => {
    try {
      if (!selectedItem) return;

      const changedFields = getChangedFields(selectedItem, updatedData);

      if (Object.keys(changedFields).length === 0) {
        console.log("Nenhuma modificação detectada.");
        setIsModalOpen(false);
        return;
      }

      await updateItem(itemId, changedFields);

      // ✅ Atualiza itens em tempo real
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...changedFields } : item
        )
      );

      setLocalOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, ...changedFields } : item
          ),
        }))
      );

      // ✅ Atualiza também o item selecionado
      setSelectedItem((prev) => (prev ? { ...prev, ...changedFields } : prev));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="min-h-screen w-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sistema de Gestão de Produção
            </h1>
            <p className="text-muted-foreground">
              Gerencie pedidos e acompanhe itens em produção
            </p>
          </div>

          {/* Orders Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Pedidos em Produção
              </h2>
              <span className="text-sm text-muted-foreground">
                {ordersLoading
                  ? "(carregando...)"
                  : `(${orders?.length || 0} pedidos)`}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordersLoading ? (
                <p className="text-muted-foreground">Carregando pedidos...</p>
              ) : orders?.length ? (
                localOrders.map((order: Order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onItemClick={handleItemClick}
                    onClick={() => handleOrderClick(order)}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhum pedido encontrado.
                </p>
              )}
            </div>

            <div className="py-4">
              <Separator />
            </div>

            {/* Production Section */}
            <div className="flex items-center gap-2 mb-6">
              <Factory className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Itens em Produção
              </h2>
            </div>

            <ProductionList
              items={items}
              onItemClick={handleItemClick}
              loading={productionLoading}
            />
          </div>

          {/* Item Modal */}
          <ItemModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            role={session?.user?.userRole as "OFFICER" | "DEV" | "ADMIN"}
            onSave={handleSaveItem}
          />
          <OrderModal
            order={selectedOrder}
            open={isOrderModalOpen}
            onClose={handleCloseOrderModal}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
