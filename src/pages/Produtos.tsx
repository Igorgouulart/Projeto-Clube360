import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useProdutos, useProdutoMutations } from '@/hooks';
import { useDebounce } from '@/hooks/shared/useDebounce';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Produto, CreateProdutoDto } from '@/types';

const emptyForm: CreateProdutoDto = {
  nome: '', preco: 0, categoria: '', descricao: '', ativo: true,
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Produtos() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [precoStr, setPrecoStr] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  const { data: produtos = [], isLoading } = useProdutos({ search: debouncedSearch });
  const { criar, atualizar, excluir } = useProdutoMutations();

  const openEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      preco: produto.preco,
      categoria: produto.categoria ?? '',
      descricao: produto.descricao ?? '',
      ativo: produto.ativo,
    });
    setPrecoStr(produto.preco.toFixed(2).replace('.', ','));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduto(null);
    setFormData(emptyForm);
    setPrecoStr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preco = parseFloat(precoStr.replace(',', '.'));
    if (isNaN(preco) || preco <= 0) return;

    const payload = {
      ...formData,
      preco,
      categoria: formData.categoria || null,
      descricao: formData.descricao || null,
    };

    if (editingProduto) {
      atualizar.mutate({ id: editingProduto.id, ...payload }, { onSuccess: closeDialog });
    } else {
      criar.mutate(payload, { onSuccess: closeDialog });
    }
  };

  return (
    <AppLayout title="Produtos">
      <div className="animate-fade-in space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : produtos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria || '-'}</TableCell>
                      <TableCell>{formatCurrency(produto.preco)}</TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(produto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDeleteId(produto.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço *</Label>
                <Input
                  id="preco"
                  value={precoStr}
                  onChange={(e) => setPrecoStr(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria ?? ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Bebidas, Petiscos..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao ?? ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Produto ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending || atualizar.isPending}>
                {editingProduto ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Se ele já foi usado em comandas, será apenas inativado."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmDeleteId) {
            excluir.mutate(confirmDeleteId, { onSuccess: () => setConfirmDeleteId(null) });
          }
        }}
      />
    </AppLayout>
  );
}
