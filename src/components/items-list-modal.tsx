import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StatusBadge } from "@/app/dashboard/components/status-badge";
import { Package } from "lucide-react";
import { Item } from "@/types/types";
import Image from "next/image";

interface ItemsListModalProps {
  open: boolean;
  onClose: () => void;
  items: Item[];
}

export function ItemsListModal({ open, onClose, items }: ItemsListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Itens do Pedido</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.orderId}-${index}`}
                className="flex items-center gap-3 border-b pb-2 last:border-0"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qtd: {item.quantity} • {item.material}
                  </p>
                </div>

                <StatusBadge status={item.itemStatus} />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}