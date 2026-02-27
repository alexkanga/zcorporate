'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2, Download, FileText } from 'lucide-react';

interface Resource {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileName: string;
  published: boolean;
  downloadCount: number;
  categoryId: string | null;
  category?: { nameFr: string; nameEn: string } | null;
}

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
}

export default function ResourcesAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<Partial<Resource>>({
    titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', fileUrl: '', fileType: '', fileSize: 0, fileName: '', published: false, categoryId: '',
  });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: async () => { const res = await fetch('/api/admin/resources'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-resource-categories'],
    queryFn: async () => { const res = await fetch('/api/admin/resource-categories'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Resource>) => {
      const res = await fetch('/api/admin/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-resources'] }); toast.success('Ressource créée'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Resource> }) => {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-resources'] }); toast.success('Ressource mise à jour'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-resources'] }); toast.success('Ressource supprimée'); },
    onError: () => toast.error('Erreur'),
  });

  const resetForm = () => {
    setFormData({ titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', fileUrl: '', fileType: '', fileSize: 0, fileName: '', published: false, categoryId: '' });
    setEditingItem(null);
  };

  const openEditDialog = (item: Resource) => { setEditingItem(item); setFormData(item); setIsDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingItem) updateMutation.mutate({ id: editingItem.id, data: formData }); else createMutation.mutate(formData); };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Ressources</h1><p className="text-muted-foreground">Gérez les fichiers téléchargeables</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} une ressource</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="fr" className="space-y-4">
                  <div><Label>Titre</Label><Input value={formData.titleFr || ''} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={formData.descriptionFr || ''} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} rows={3} /></div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <div><Label>Title</Label><Input value={formData.titleEn || ''} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={formData.descriptionEn || ''} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} /></div>
                </TabsContent>
              </Tabs>
              <div><Label>Catégorie</Label>
                <Select value={formData.categoryId || ''} onValueChange={(value) => setFormData({ ...formData, categoryId: value || null })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.nameFr}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>URL du fichier</Label><Input value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} required /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Nom du fichier</Label><Input value={formData.fileName || ''} onChange={(e) => setFormData({ ...formData, fileName: e.target.value })} required /></div>
                <div><Label>Type MIME</Label><Input value={formData.fileType || ''} onChange={(e) => setFormData({ ...formData, fileType: e.target.value })} placeholder="application/pdf" required /></div>
                <div><Label>Taille (bytes)</Label><Input type="number" value={formData.fileSize || 0} onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) })} required /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} /><Label>Publié</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">{editingItem ? 'Mettre à jour' : 'Créer'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des ressources</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((item: Resource) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-card border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{item.titleFr}</p>
                  <p className="text-sm text-muted-foreground">{item.fileName} • {formatFileSize(item.fileSize)} • {item.category?.nameFr || 'Sans catégorie'}</p>
                  <p className="text-sm text-muted-foreground"><Download className="h-3 w-3 inline mr-1" />{item.downloadCount} téléchargements</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.published ? 'Publié' : 'Brouillon'}</div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {resources.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune ressource</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
