import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/app/dashboard/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Package, Hash, Layers, Clock } from "lucide-react";
import { Item } from "@/types/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductionListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  loading?: boolean;
}

export function ProductionList({
  items,
  onItemClick,
  loading,
}: ProductionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Itens em Produção
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Itens em Produção
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum item em produção
            </h3>
            <p className="text-muted-foreground">
              Todos os itens foram processados ou estão aguardando início da
              produção.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card
              key={index}
              className={cn(
                "group cursor-pointer bg-gradient-card shadow-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
                "border-production-border bg-production-bg/50"
              )}
              onClick={() => onItemClick(item)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96} // Equivalente a w-24 (24 * 4px = 96px)
                          height={96} // Equivalente a h-24 (24 * 4px = 96px)
                          className="object-cover" // Apenas object-cover é necessário aqui
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-medium truncate">
                        {item.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Hash className="h-3 w-3" />
                        <span>Pedido #{item.orderId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Venda:</span>
                  <span className="font-medium">{item.saleQuantity}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {item.material}
                  </Badge>
                </div>

                <div className="pt-2">
                  <StatusBadge
                    status={item.itemStatus}
                    className="w-full justify-center"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
