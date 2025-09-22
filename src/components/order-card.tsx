import { useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { StatusBadge } from "@/app/dashboard/components/status-badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Package, User } from "lucide-react";
import { Item, Order } from "@/types/types";
import Image from "next/image";
import { ItemsListModal } from "./items-list-modal"; // 👈 import novo

interface OrderCardProps {
  order: Order;
  onItemClick: (item: Item) => void;
}

export default function OrderCard({ order, onItemClick }: OrderCardProps) {
  const [isAllItemsOpen, setIsAllItemsOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden bg-gradient-card shadow-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Cliente</span>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {order.clientName}
              </h3>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Data limite entrega
            <span>
              {order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString("pt-BR")
                : "—"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Package className="h-4 w-4" />
            <span>
              {order.items.length} {order.items.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="grid gap-2">
            {order.items.slice(0, 3).map((item, index) => (
              <Button
                key={`${item.orderId}-${index}`}
                variant="ghost"
                size="sm"
                onClick={() => onItemClick(item)}
                className={cn(
                  "h-auto p-3 justify-start text-left hover:bg-accent/50 transition-colors",
                  "border border-transparent hover:border-border"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {item.quantity} • {item.material}
                    </p>
                  </div>
                  <StatusBadge
                    status={item.itemStatus}
                    className="text-[10px] px-1.5 py-0.5"
                  />
                </div>
              </Button>
            ))}

            {order.items.length > 3 && (
              <div className="text-center py-2">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground underline"
                  onClick={() => setIsAllItemsOpen(true)}
                >
                  +{order.items.length - 3} itens adicionais
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal desacoplado */}
      <ItemsListModal
        open={isAllItemsOpen}
        onClose={() => setIsAllItemsOpen(false)}
        items={order.items}
      />
    </>
  );
}