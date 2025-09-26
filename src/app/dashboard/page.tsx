"use client";

import { useState } from "react";
import AppSidebar from "@/app/dashboard/components/app-sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboardAnalytics } from "@/hooks/use-analytics";
import { useRecentOrders } from "@/hooks/use-recent-orders";
import { useOrderDetails } from "@/hooks/use-order-details";
import OrderModal from "@/components/order-modal";

export default function DashboardPage() {
  const { recentOrders, loading, error } = useRecentOrders();
  const { analytics } = useDashboardAnalytics();
  const { order: selectedOrder, loading: loadingOrderDetails, error: orderError, fetchOrderDetails } = useOrderDetails();
  
  // Estados para controlar o modal
  const [modalOpen, setModalOpen] = useState(false);

  const cardData = [
    {
      title: "Pedidos na linha de produção",
      value: analytics?.ordersInProduction.toString(),
      description: "Ativos no momento",
    },
    {
      title: "Pedidos Aguardando Envio",
      value: analytics?.ordersWaitingShipping.toString(),
      description: "Prontos para despacho",
    },
    {
      title: "Serviços na Linha de Produção",
      value: analytics?.itemsInProduction.toString(),
      description: "Em processo",
    },
    {
      title: "Pedidos postados nesta semana",
      value: analytics?.ordersShippedLastWeek.toString(),
      description: "Total semanal",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "POSTADO":
        return "text-green-600";
      case "PRODUCAO":
        return "text-yellow-600";
      case "FINALIZADO":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "POSTADO":
        return "Postado";
      case "PRODUCAO":
        return "Em produção";
      case "FINALIZADO":
        return "Finalizado";
      default:
        return status;
    }
  };

  // Função para abrir o modal com detalhes do pedido
  const handleOrderClick = async (orderId: number) => {
    try {
      await fetchOrderDetails(orderId);
      setModalOpen(true);
    } catch (err) {
      console.error("Erro ao carregar detalhes do pedido:", err);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        <div className="sm:ml-14 p-4">
          {/* Cards principais */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {cardData.map((card, index) => (
              <Card
                key={index}
                className="flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 leading-tight mb-2">
                    {card.title}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </div>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </section>

          {/* Conteúdo adicional do dashboard */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Vendas</CardTitle>
              </CardHeader>
              <div className="p-6 pt-0">
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Gráfico aqui</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <div className="p-6 pt-0">
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-gray-500">Carregando pedidos...</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {recentOrders && recentOrders.length > 0
                    ? recentOrders.map((order) => (
                        <div
                          key={order.orderId}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleOrderClick(order.orderId)}
                        >
                          <div>
                            <p className="font-medium">
                              Pedido #{order.orderId}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.clientName}
                            </p>
                            {order.items && order.items.length > 0 && (
                              <p className="text-xs text-gray-400">
                                {order.items.length}{" "}
                                {order.items.length === 1 ? "item" : "itens"}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      ))
                    : !loading &&
                      !error && (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-gray-500">
                            Nenhum pedido recente encontrado.
                          </p>
                        </div>
                      )}
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* Modal de detalhes do pedido */}
        <OrderModal
          open={modalOpen}
          onClose={setModalOpen}
          order={selectedOrder}
          loading={loadingOrderDetails}
        />

        {/* Toast de erro para detalhes do pedido (opcional) */}
        {orderError && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg">
            <p className="text-sm">{orderError}</p>
          </div>
        )}
      </main>
    </SidebarProvider>
  );
}