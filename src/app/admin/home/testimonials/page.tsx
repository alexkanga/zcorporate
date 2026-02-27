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
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2, Star } from 'lucide-react';
import { ImageUploadCompact } from '@/components/admin/ImageUpload';

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  textFr: string;
  textEn: string;
  avatar: string | null;
  rating: number;
  visible: boolean;
}

export default function TestimonialsAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({ name: '', company: '', textFr: '', textEn: '', avatar: '', rating: 5, visible: true });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => { const res = await fetch('/api/admin/testimonials'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Testimonial>) => {
      const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }); toast.success('Témoignage créé'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Testimonial> }) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }); toast.success('Témoignage mis à jour'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }); toast.success('Témoignage supprimé'); },
    onError: () => toast.error('Erreur'),
  });

  const resetForm = () => { setFormData({ name: '', company: '', textFr: '', textEn: '', avatar: '', rating: 5, visible: true }); setEditingItem(null); };
  const openEditDialog = (item: Testimonial) => { setEditingItem(item); setFormData(item); setIsDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingItem) updateMutation.mutate({ id: editingItem.id, data: formData }); else createMutation.mutate(formData); };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Témoignages</h1><p className="text-muted-foreground">Gérez les témoignages clients</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un témoignage</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Nom</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><Label>Entreprise</Label><Input value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
              </div>
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="fr" className="space-y-4"><div><Label>Témoignage</Label><Textarea value={formData.textFr || ''} onChange={(e) => setFormData({ ...formData, textFr: e.target.value })} required rows={4} /></div></TabsContent>
                <TabsContent value="en" className="space-y-4"><div><Label>Testimonial</Label><Textarea value={formData.textEn || ''} onChange={(e) => setFormData({ ...formData, textEn: e.target.value })} required rows={4} /></div></TabsContent>
              </Tabs>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Avatar</Label>
                  <ImageUploadCompact
                    value={formData.avatar || ''}
                    onChange={(url) => setFormData({ ...formData, avatar: url })}
                    folder="testimonials"
                  />
                </div>
                <div><Label>Note (1-5)</Label><Input type="number" min={1} max={5} value={formData.rating || 5} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.visible} onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })} /><Label>Visible</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">{editingItem ? 'Mettre à jour' : 'Créer'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des témoignages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((item: Testimonial) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-card border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.company && <span className="text-sm text-muted-foreground">- {item.company}</span>}
                  </div>
                  <p className="text-sm mt-1">{item.textFr}</p>
                  <div className="flex gap-1 mt-2">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${item.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.visible ? 'Visible' : 'Masqué'}</div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {testimonials.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun témoignage</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
