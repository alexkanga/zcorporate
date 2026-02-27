'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  order: number;
}

export default function ResourceCategoriesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({ nameFr: '', nameEn: '', slug: '' });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-resource-categories'],
    queryFn: async () => { const res = await fetch('/api/admin/resource-categories'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const res = await fetch('/api/admin/resource-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-resource-categories'] }); toast.success('Catégorie créée'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const resetForm = () => { setFormData({ nameFr: '', nameEn: '', slug: '' }); setEditingItem(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, slug: formData.slug || formData.nameFr?.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '') });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Catégories de ressources</h1><p className="text-muted-foreground">Gérez les catégories</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter une catégorie</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nom (FR)</Label><Input value={formData.nameFr || ''} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} required /></div>
              <div><Label>Nom (EN)</Label><Input value={formData.nameEn || ''} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} required /></div>
              <div><Label>Slug</Label><Input value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="Auto-généré si vide" /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">Créer</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des catégories</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((cat: Category) => (
              <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">{cat.nameFr}</p><p className="text-sm text-muted-foreground">{cat.nameEn} • {cat.slug}</p></div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune catégorie</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
