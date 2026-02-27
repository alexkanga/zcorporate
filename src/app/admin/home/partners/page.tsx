'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2, ExternalLink } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  order: number;
  visible: boolean;
}

export default function PartnersAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({ name: '', logoUrl: '', website: '', visible: true });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => { const res = await fetch('/api/admin/partners'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Partner>) => {
      const res = await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partners'] }); toast.success('Partenaire créé'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partners'] }); toast.success('Partenaire mis à jour'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-partners'] }); toast.success('Partenaire supprimé'); },
    onError: () => toast.error('Erreur'),
  });

  const resetForm = () => { setFormData({ name: '', logoUrl: '', website: '', visible: true }); setEditingItem(null); };
  const openEditDialog = (item: Partner) => { setEditingItem(item); setFormData(item); setIsDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingItem) updateMutation.mutate({ id: editingItem.id, data: formData }); else createMutation.mutate(formData); };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Partenaires</h1><p className="text-muted-foreground">Gérez les logos des partenaires</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un partenaire</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nom</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>URL du logo</Label><Input value={formData.logoUrl || ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} required /></div>
              <div><Label>Site web</Label><Input value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.visible} onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })} /><Label>Visible</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">{editingItem ? 'Mettre à jour' : 'Créer'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des partenaires</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((item: Partner) => (
              <div key={item.id} className="flex flex-col items-center gap-2 p-4 bg-card border rounded-lg">
                <img src={item.logoUrl} alt={item.name} className="w-24 h-24 object-contain" />
                <p className="font-medium text-center">{item.name}</p>
                {item.website && <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />Site web</a>}
                <div className="flex items-center gap-2 mt-2">
                  <div className={`px-2 py-1 rounded text-xs ${item.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.visible ? 'Visible' : 'Masqué'}</div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
          {partners.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun partenaire</p>}
        </CardContent>
      </Card>
    </div>
  );
}
