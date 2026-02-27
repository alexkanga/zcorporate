'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GripVertical, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { ImageUploadCompact } from '@/components/admin/ImageUpload';

interface Service {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  visible: boolean;
}

function SortableItem({ service, onEdit, onDelete }: { service: Service; onEdit: (service: Service) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: service.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-card border rounded-lg mb-2">
      <button {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <p className="font-medium">{service.titleFr}</p>
        <p className="text-sm text-muted-foreground">{service.titleEn}</p>
      </div>
      <div className={`px-2 py-1 rounded text-xs ${service.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {service.visible ? 'Visible' : 'Masqué'}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(service.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function ServicesAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', icon: '', imageUrl: '', visible: true,
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const res = await fetch('/api/admin/services');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Service>) => {
      const res = await fetch('/api/admin/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service créé'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service mis à jour'); setIsDialogOpen(false); resetForm(); },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service supprimé'); },
    onError: () => toast.error('Erreur'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      const res = await fetch('/api/admin/services', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [items, setItems] = useState<Service[]>([]);
  useEffect(() => { setItems(services); }, [services]);

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newItems = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id));
      setItems(newItems);
      reorderMutation.mutate(newItems.map((item, index) => ({ id: item.id, order: index })));
    }
  };

  const resetForm = () => {
    setFormData({ titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '', icon: '', imageUrl: '', visible: true });
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => { setEditingService(service); setFormData(service); setIsDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) updateMutation.mutate({ id: editingService.id, data: formData });
    else createMutation.mutate(formData);
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Gérez les services affichés sur la page d&apos;accueil</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Ajouter</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingService ? 'Modifier' : 'Ajouter'} un service</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="fr" className="space-y-4">
                  <div><Label>Titre</Label><Input value={formData.titleFr || ''} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={formData.descriptionFr || ''} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} /></div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <div><Label>Title</Label><Input value={formData.titleEn || ''} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} required /></div>
                  <div><Label>Description</Label><Textarea value={formData.descriptionEn || ''} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} /></div>
                </TabsContent>
              </Tabs>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Icône (Lucide)</Label><Input value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="ex: Briefcase" /></div>
                <div>
                  <Label>Image du service</Label>
                  <ImageUploadCompact
                    value={formData.imageUrl || ''}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    folder="services"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.visible} onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })} /><Label>Visible</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">{editingService ? 'Mettre à jour' : 'Créer'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des services</CardTitle></CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((service) => <SortableItem key={service.id} service={service} onEdit={openEditDialog} onDelete={(id) => deleteMutation.mutate(id)} />)}
            </SortableContext>
          </DndContext>
          {items.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun service</p>}
        </CardContent>
      </Card>
    </div>
  );
}
