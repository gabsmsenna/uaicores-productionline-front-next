
import { cn } from "@/lib/utils";
import { OrderStatus, ItemStatus } from "@/types/order";

interface StatusBadgeProps {
  status: OrderStatus | ItemStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus | ItemStatus) => {
    switch (status) {
      case OrderStatus.PENDENTE:
        return {
          label: "Pendente",
          className: "bg-status-pending/10 text-status-pending border-status-pending/20"
        };
      case OrderStatus.PRODUCAO:
        case ItemStatus.EM_SILK:
        case ItemStatus.CHAPADO:
        case ItemStatus.IMPRESSO:
        return {
          label: status === ItemStatus.EM_SILK ? "Em Produção" : "Processando",
          className: "bg-status-processing/10 text-status-processing border-status-processing/20"
        };
      case OrderStatus.FINALIZADO:
        return {
          label: "Finalizado",
          className: "bg-status-completed/10 text-status-completed border-status-completed/20"
        };
      case OrderStatus.POSTADO:
        return {
          label: "Postado",
          className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20"
        };
      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border-border"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}