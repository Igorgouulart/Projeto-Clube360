import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoorOpen, LogOut, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { useSessoesAtivas, useSociosAtivosSelect, useSessoesMutations } from '@/hooks';
import { sessoesService } from '@/services';
import { toast } from 'sonner';
import type { Sessao, VerificarSaidaResult } from '@/types';

export default function Sessoes() {
  const [entradaDialogOpen, setEntradaDialogOpen] = useState(false);
  const [saidaDialogOpen, setSaidaDialogOpen] = useState(false);
  const [saidaCheck, setSaidaCheck] = useState<VerificarSaidaResult | null>(null);
  const [verificandoSaida, setVerificandoSaida] = useState(false);
  const [formData, setFormData] = useState({ pessoaNome: '', socioId: '' });

  const { data: sessoes = [], isLoading } = useSessoesAtivas();
  const { data: sociosData } = useSociosAtivosSelect();
  const socios = sociosData?.socios ?? [];
  const { registrarEntrada, registrarSaida } = useSessoesMutations();

  const handleEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pessoaNome && !formData.socioId) {
      toast.error('Informe o nome ou selecione um sócio');
      return;
    }

    const socioSelecionado = socios.find((s) => s.id === formData.socioId);
    registrarEntrada.mutate(
      {
        pessoaNome: socioSelecionado ? socioSelecionado.nome : formData.pessoaNome,
        socioId: formData.socioId || null,
      },
      {
        onSuccess: () => {
          setEntradaDialogOpen(false);
          setFormData({ pessoaNome: '', socioId: '' });
        },
      }
    );
  };

  const verificarSaida = async (sessao: Sessao) => {
    setVerificandoSaida(true);
    try {
      const result = await sessoesService.verificarSaida(sessao.id);
      setSaidaCheck(result);
      setSaidaDialogOpen(true);
    } catch (error: unknown) {
      toast.error('Erro ao verificar pendências');
    } finally {
      setVerificandoSaida(false);
    }
  };

  const confirmarSaida = () => {
    if (!saidaCheck) return;
    registrarSaida.mutate(saidaCheck.sessao.id, {
      onSuccess: () => {
        setSaidaDialogOpen(false);
        setSaidaCheck(null);
      },
    });
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AppLayout title="Controle de Entrada/Saída">
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-medium">{sessoes.length} pessoa(s) no clube</span>
          </div>
          <Button onClick={() => setEntradaDialogOpen(true)}>
            <DoorOpen className="h-4 w-4 mr-2" />
            Registrar Entrada
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pessoas no Clube</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : sessoes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma pessoa no clube no momento.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead className="w-32">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessoes.map((sessao) => (
                    <TableRow key={sessao.id}>
                      <TableCell className="font-medium">{sessao.pessoaNome}</TableCell>
                      <TableCell>
                        <Badge variant={sessao.socioId ? 'default' : 'secondary'}>
                          {sessao.socioId ? 'Sócio' : 'Visitante'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatTime(sessao.dataEntrada)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verificarSaida(sessao)}
                          disabled={verificandoSaida}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Saída
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de entrada */}
      <Dialog open={entradaDialogOpen} onOpenChange={setEntradaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Entrada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEntrada} className="space-y-4">
            <div className="space-y-2">
              <Label>Sócio (opcional)</Label>
              <Select
                value={formData.socioId}
                onValueChange={(v) =>
                  setFormData({ socioId: v === '_visitante' ? '' : v, pessoaNome: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um sócio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_visitante">Visitante (sem cadastro)</SelectItem>
                  {socios.map((socio) => (
                    <SelectItem key={socio.id} value={socio.id}>
                      {socio.nome} — {socio.documento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!formData.socioId && (
              <div className="space-y-2">
                <Label htmlFor="pessoaNome">Nome do Visitante *</Label>
                <Input
                  id="pessoaNome"
                  value={formData.pessoaNome}
                  onChange={(e) => setFormData({ ...formData, pessoaNome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEntradaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={registrarEntrada.isPending}>
                {registrarEntrada.isPending ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de saída */}
      <Dialog open={saidaDialogOpen} onOpenChange={setSaidaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificação de Saída</DialogTitle>
            <DialogDescription>{saidaCheck?.sessao.pessoaNome}</DialogDescription>
          </DialogHeader>

          {saidaCheck && (
            <div className="space-y-4">
              {saidaCheck.podeSair ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Saída Liberada</p>
                    <p className="text-sm text-muted-foreground">Sem pendências financeiras.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Pendência Financeira</p>
                    <p className="text-sm text-muted-foreground">
                      {saidaCheck.comandasPendentes.length} comanda(s) —{' '}
                      Total: {formatCurrency(saidaCheck.totalPendente)}
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSaidaDialogOpen(false)}>
                  Cancelar
                </Button>
                {saidaCheck.podeSair ? (
                  <Button onClick={confirmarSaida} disabled={registrarSaida.isPending}>
                    Confirmar Saída
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={confirmarSaida}
                    disabled={registrarSaida.isPending}
                  >
                    Liberar Manualmente
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
