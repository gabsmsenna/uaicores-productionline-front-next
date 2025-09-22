/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Item } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Hash, Layers, Package, Tag, Pencil } from "lucide-react";
import { Badge } from "./ui/badge";
import { StatusBadge } from "@/app/dashboard/components/status-badge";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent } from "./ui/select";

interface ItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  role: "OFFICER" | "DEV" | "ADMIN" | "USER";
  onSave: (itemId: string | number, updatedItem: Partial<Item>) => void;
}

export default function ItemModal({
  item,
  isOpen,
  onClose,
  role,
  onSave,
}: ItemModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Item>>(item || {});

  useEffect(() => {
    setFormData(item || {});
    setIsEditing(false);
  }, [item]);

  if (!isOpen || !item) return null;

  const canEdit = role === "OFFICER" || role === "DEV" || role === "ADMIN";

  const handleChange = (field: keyof Item, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("--- ItemModal: handleSave ---");
    console.log("Enviando para onSave:", formData);
    console.log("Item ID: ", item.id);
    onSave(item.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(item || {});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            Detalhes do Item
            {canEdit && !isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-5 w-5" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          // --- Modo Visualização
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={item.itemStatus} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>Pedido #{item.orderId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Detalhes */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Package className="h-4 w-4" />
                    <span>Quantidade</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {item.quantity.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Layers className="h-4 w-4" />
                      <span>Material</span>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {item.material}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Status do Item</span>
                    </div>
                    <StatusBadge status={item.itemStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- Modo Edição
          <div className="space-y-6">
            {role === "OFFICER" && (
              <>
                <div>
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input
                    type="number"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      handleChange("quantity", Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status do Item</label>
                  <Select
                    value={formData.itemStatus}
                    onValueChange={(v) => handleChange("itemStatus", v)}
                  >
                    <SelectTrigger>{formData.itemStatus}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="EM_SILK">Em Silk</SelectItem>
                      <SelectItem value="IMPRESSO">Impresso</SelectItem>
                      <SelectItem value="ACABAMENTO">Acabamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {(role === "DEV" || role === "ADMIN") && (
              <>
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input
                    type="number"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      handleChange("quantity", Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Quantidade vendida
                  </label>
                  <Input
                    type="number"
                    value={formData.saleQuantity || ""}
                    onChange={(e) =>
                      handleChange("saleQuantity", Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Material</label>
                  <Input
                    value={formData.material || ""}
                    onChange={(e) => handleChange("material", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status do Item</label>
                  <Select
                    value={formData.itemStatus}
                    onValueChange={(v) => handleChange("itemStatus", v)}
                  >
                    <SelectTrigger>{formData.itemStatus}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="EM_SILK">Em Silk</SelectItem>
                      <SelectItem value="IMPRESSO">Impresso</SelectItem>
                      <SelectItem value="ACABAMENTO">Acabamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Imagem (URL)</label>
                  <Input
                    value={formData.image || ""}
                    onChange={(e) => handleChange("image", e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}