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
import { Pencil, Trash2, Plus, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ImageUploadCompact } from '@/components/admin/ImageUpload';

interface Event {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  gallery: string | null;
  videos: string | null;
  published: boolean;
}

export default function EventsAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', date: '', endDate: '', location: '', imageUrl: '', gallery: '', videos: '', published: false,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => { const res = await fetch('/api/admin/events'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Événement créé'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Événement mis à jour'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Événement supprimé'); },
    onError: () => toast.error('Erreur'),
  });

  const resetForm = () => {
    setFormData({ titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', date: '', endDate: '', location: '', imageUrl: '', gallery: '', videos: '', published: false });
    setEditingItem(null);
  };

  const openEditDialog = (item: Event) => {
    setEditingItem(item);
    setFormData({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit as date-only (ISO format YYYY-MM-DD)
    const data = { 
      ...formData, 
      date: formData.date || null, 
      endDate: formData.endDate || null 
    };
    if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
    else createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Événements</h1><p className="text-muted-foreground">Gérez les événements</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingItem ? 'Modifier' : 'Ajouter'} un événement</DialogTitle></DialogHeader>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Date début</Label><Input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                <div><Label>Date fin</Label><Input type="date" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
              </div>
              <div><Label>Lieu</Label><Input value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              <div>
                <Label>Image de l'événement</Label>
                <ImageUploadCompact
                  value={formData.imageUrl || ''}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="events"
                />
              </div>
              <div><Label>Galerie (URLs JSON)</Label><Textarea value={formData.gallery || ''} onChange={(e) => setFormData({ ...formData, gallery: e.target.value })} placeholder='["url1", "url2"]' rows={2} /></div>
              <div><Label>Vidéos YouTube (URLs JSON)</Label><Textarea value={formData.videos || ''} onChange={(e) => setFormData({ ...formData, videos: e.target.value })} placeholder='["https://youtube.com/..."]' rows={2} /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} /><Label>Publié</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">{editingItem ? 'Mettre à jour' : 'Créer'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des événements</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((item: Event) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-card border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{item.titleFr}</p>
                  <p className="text-sm text-muted-foreground">{item.location} • {format(new Date(item.date), 'dd/MM/yyyy')}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.published ? 'Publié' : 'Brouillon'}</div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {events.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun événement</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
