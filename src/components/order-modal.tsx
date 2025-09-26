"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item, OrderStatus } from "@/types/types";

interface OrderDetails {
  orderId: number;
  saleDate: string;
  deliveryDate: string;
  clientName: string;
  status: OrderStatus;
  items: Item[];
}

interface OrderModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  order: OrderDetails | null;
  loading?: boolean;
}

export default function OrderModal({ open, onClose, order, loading = false }: OrderModalProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {order ? `Pedido #${order.orderId}` : "Carregando..."}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Carregando detalhes do pedido...</p>
          </div>
        )}

        {order && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Cliente</p>
                <p className="text-gray-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-gray-900">{getStatusText(order.status)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Data de Venda</p>
                <p className="text-gray-900">{formatDate(order.saleDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Data de Entrega</p>
                <p className="text-gray-900">{formatDate(order.deliveryDate)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">
                Itens ({order.items.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item: Item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}