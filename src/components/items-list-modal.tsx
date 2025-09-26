import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StatusBadge } from "@/app/dashboard/components/status-badge";
import { Package } from "lucide-react";
import { Item } from "@/types/types";
import Image from "next/image";

interface ItemsListModalProps {
  open: boolean;
  onClose: () => void;
  items: Item[];
  onUpdateItem?: (itemId: string | number, updatedItem: Partial<Item>) => void;
  role?: "OFFICER" | "DEV" | "ADMIN" | "USER";
}

export default function ItemsListModal({ 
  open, 
  onClose, 
  items, 
  onUpdateItem,
  role = "USER" 
}: ItemsListModalProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  };

  const handleItemModalClose = () => {
    setItemModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveItem = (itemId: string | number, updatedItem: Partial<Item>) => {
    // Chama a função do pai para atualizar o item
    if (onUpdateItem) {
      onUpdateItem(itemId, updatedItem);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden bg-card border-border shadow-2xl animate-scale-in">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Itens do Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Nenhum item encontrado neste pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item, index) => (
                <div
                  key={`${item.orderId}-${index}`}
                  className="group flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-accent/50 transition-all duration-200 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Thumbnail com melhor estilização */}
                  <div className="relative w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Informações do item */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-brand-500"></span>
                        Qtd: {item.quantity}
                      </span>
                      {item.material && (
                        <>
                          <span>•</span>
                          <span className="truncate">{item.material}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <StatusBadge status={item.itemStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer com informações adicionais (opcional) */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Total: {items.length} {items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}