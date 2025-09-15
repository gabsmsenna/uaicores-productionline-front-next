import AppSidebar from "@/app/dashboard/components/app-sidebar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const cardData = [
    {
      title: "Serviços em produção",
      value: "12",
      description: "Ativos no momento"
    },
    {
      title: "Pedidos Aguardando Envio",
      value: "8",
      description: "Prontos para despacho"
    },
    {
      title: "Pedidos na Linha de Produção",
      value: "24",
      description: "Em processo"
    },
    {
      title: "Pedidos postados nesta semana",
      value: "156",
      description: "Total semanal"
    }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        <div className="sm:ml-14 p-4">
          {/* Cards principais */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {cardData.map((card, index) => (
              <Card key={index} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 leading-tight mb-2">
                    {card.title}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </div>
                    <p className="text-xs text-gray-500">
                      {card.description}
                    </p>
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
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Pedido #{1000 + item}</p>
                        <p className="text-sm text-gray-500">Cliente {item}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">Concluído</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
}
