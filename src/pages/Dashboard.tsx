import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DoorOpen, Beer, AlertCircle, Clock } from 'lucide-react';
import { useDashboardStats } from '@/hooks';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: 'Total de Sócios',
      value: stats?.totalSocios ?? 0,
      icon: Users,
      description: `${stats?.sociosAtivos ?? 0} ativos`,
    },
    {
      title: 'No Clube Agora',
      value: stats?.sessoesAtivas ?? 0,
      icon: DoorOpen,
      description: 'Pessoas presentes',
    },
    {
      title: 'Comandas Ativas',
      value: stats?.comandasAbertas ?? 0,
      icon: Beer,
      description: 'Abertas ou fechadas',
    },
    {
      title: 'Pendências',
      value: stats?.comandasAbertas ?? 0,
      icon: AlertCircle,
      description: 'Aguardando pagamento',
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="animate-fade-in space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : stats?.atividadeRecente?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
              ) : (
                <ul className="space-y-2">
                  {stats?.atividadeRecente?.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.pessoaNome}</span>
                      <span className="text-muted-foreground">
                        {new Date(s.dataEntrada).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-5 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sócios inadimplentes</span>
                    <span className="font-medium">
                      {(stats?.totalSocios ?? 0) - (stats?.sociosAtivos ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacidade utilizada</span>
                    <span className="font-medium">{stats?.sessoesAtivas ?? 0} pessoas</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
