import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Receipt, CreditCard, Search } from 'lucide-react';
import { useComandas, useBarMutations, useSessoesAtivas, useProdutos } from '@/hooks';
import type { Comanda, StatusComanda } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusColors: Record<StatusComanda, string> = {
  ABERTA: 'bg-success text-success-foreground',
  FECHADA: 'bg-warning text-warning-foreground',
  PAGA: 'bg-muted text-muted-foreground',
};

export default function Bar() {
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [novaComandaOpen, setNovaComandaOpen] = useState(false);
  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const [selectedSessaoId, setSelectedSessaoId] = useState('');
  const [searchProduto, setSearchProduto] = useState('');

  const { data: comandas = [], isLoading } = useComandas();
  const { data: sessoes = [] } = useSessoesAtivas();
  const { data: produtos = [] } = useProdutos({ apenasAtivos: true });
  const { criarComanda, adicionarItem, alterarQuantidade, fecharComanda, registrarPagamento } =
    useBarMutations();

  // Mantém a comanda selecionada atualizada quando os dados chegam do servidor
  const comandaAtualizada =
    selectedComanda ? comandas.find((c) => c.id === selectedComanda.id) ?? selectedComanda : null;

  const filteredProdutos = produtos.filter((p) =>
    p.nome.toLowerCase().includes(searchProduto.toLowerCase())
  );

  const handleCriarComanda = () => {
    if (!selectedSessaoId) return;
    criarComanda.mutate(selectedSessaoId, {
      onSuccess: (data) => {
        setNovaComandaOpen(false);
        setSelectedSessaoId('');
        setSelectedComanda(data);
      },
    });
  };

  const handleFechar = () => {
    if (!comandaAtualizada) return;
    fecharComanda.mutate(comandaAtualizada.id, {
      onSuccess: (data) => setSelectedComanda(data),
    });
  };

  const handlePagamento = (metodo: string) => {
    if (!comandaAtualizada) return;
    registrarPagamento.mutate(
      { id: comandaAtualizada.id, metodo },
      {
        onSuccess: () => {
          setPagamentoOpen(false);
          setSelectedComanda(null);
        },
      }
    );
  };

  return (
    <AppLayout title="Bar">
      <div className="animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de Comandas */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Comandas Ativas</h2>
              <Button size="sm" onClick={() => setNovaComandaOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando...</div>
            ) : comandas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma comanda ativa.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {comandas.map((comanda) => (
                  <Card
                    key={comanda.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      comandaAtualizada?.id === comanda.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedComanda(comanda)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{comanda.sessao?.pessoaNome}</p>
                          <p className="text-sm text-muted-foreground">
                            {comanda.itens?.length ?? 0} itens
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[comanda.status]}>{comanda.status}</Badge>
                          <p className="font-semibold mt-1">{formatCurrency(comanda.valorTotal)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detalhe da Comanda */}
          <div className="lg:col-span-2">
            {comandaAtualizada ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{comandaAtualizada.sessao?.pessoaNome}</CardTitle>
                    <Badge className={statusColors[comandaAtualizada.status]}>
                      {comandaAtualizada.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {comandaAtualizada.status === 'ABERTA' && (
                      <Button variant="outline" onClick={handleFechar}>
                        <Receipt className="h-4 w-4 mr-2" />
                        Fechar
                      </Button>
                    )}
                    {(comandaAtualizada.status === 'ABERTA' ||
                      comandaAtualizada.status === 'FECHADA') && (
                      <Button onClick={() => setPagamentoOpen(true)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Itens */}
                  <div>
                    <h3 className="font-medium mb-3">Itens</h3>
                    {!comandaAtualizada.itens?.length ? (
                      <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
                    ) : (
                      <div className="space-y-2">
                        {comandaAtualizada.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div>
                              <p className="font-medium">{item.produto?.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.valorUnitario)} cada
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {comandaAtualizada.status === 'ABERTA' && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    alterarQuantidade.mutate({
                                      comandaId: comandaAtualizada.id,
                                      itemId: item.id,
                                      delta: -1,
                                    })
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                              <span className="w-8 text-center font-medium">{item.quantidade}</span>
                              {comandaAtualizada.status === 'ABERTA' && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    alterarQuantidade.mutate({
                                      comandaId: comandaAtualizada.id,
                                      itemId: item.id,
                                      delta: 1,
                                    })
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                              <span className="w-24 text-right font-semibold">
                                {formatCurrency(item.quantidade * item.valorUnitario)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold">
                        {formatCurrency(comandaAtualizada.valorTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Adicionar Produtos */}
                  {comandaAtualizada.status === 'ABERTA' && (
                    <div>
                      <h3 className="font-medium mb-3">Adicionar Produto</h3>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar produto..."
                          value={searchProduto}
                          onChange={(e) => setSearchProduto(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-auto">
                        {filteredProdutos.map((produto) => (
                          <Button
                            key={produto.id}
                            variant="outline"
                            className="justify-start h-auto py-2 px-3"
                            disabled={adicionarItem.isPending}
                            onClick={() =>
                              adicionarItem.mutate({
                                comandaId: comandaAtualizada.id,
                                produtoId: produto.id,
                              })
                            }
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium truncate">{produto.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(produto.preco)}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Selecione uma comanda para ver os detalhes.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog nova comanda */}
        <Dialog open={novaComandaOpen} onOpenChange={setNovaComandaOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Comanda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedSessaoId} onValueChange={setSelectedSessaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a pessoa..." />
                </SelectTrigger>
                <SelectContent>
                  {sessoes.map((sessao) => (
                    <SelectItem key={sessao.id} value={sessao.id}>
                      {sessao.pessoaNome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sessoes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma pessoa no clube. Registre uma entrada primeiro.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovaComandaOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCriarComanda}
                disabled={!selectedSessaoId || criarComanda.isPending}
              >
                Criar Comanda
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pagamento */}
        <Dialog open={pagamentoOpen} onOpenChange={setPagamentoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-lg text-center">
                Total:{' '}
                <span className="font-bold">
                  {formatCurrency(comandaAtualizada?.valorTotal ?? 0)}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO'] as const).map((metodo) => (
                  <Button
                    key={metodo}
                    variant="outline"
                    disabled={registrarPagamento.isPending}
                    onClick={() => handlePagamento(metodo)}
                  >
                    {metodo === 'DINHEIRO'
                      ? 'Dinheiro'
                      : metodo === 'PIX'
                      ? 'PIX'
                      : metodo === 'CARTAO_DEBITO'
                      ? 'Débito'
                      : 'Crédito'}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
