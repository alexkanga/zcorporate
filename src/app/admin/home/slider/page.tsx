'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@dnd-kit/core';
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
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';

interface Slider {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
  imageUrl: string;
  imageAltFr: string | null;
  imageAltEn: string | null;
  order: number;
  visible: boolean;
}

function SortableItem({ slider, onEdit, onDelete }: { slider: Slider; onEdit: (slider: Slider) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slider.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-card border rounded-lg mb-2">
      <button {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <img src={slider.imageUrl} alt={slider.titleFr} className="w-20 h-12 object-cover rounded" />
      <div className="flex-1">
        <p className="font-medium">{slider.titleFr}</p>
        <p className="text-sm text-muted-foreground">{slider.titleEn}</p>
      </div>
      <div className={`px-2 py-1 rounded text-xs ${slider.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {slider.visible ? 'Visible' : 'Masqué'}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(slider)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(slider.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function SliderAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState<Partial<Slider>>({
    titleFr: '',
    titleEn: '',
    subtitleFr: '',
    subtitleEn: '',
    buttonTextFr: '',
    buttonTextEn: '',
    buttonUrl: '',
    imageUrl: '',
    imageAltFr: '',
    imageAltEn: '',
    visible: true,
  });

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ['admin-sliders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sliders');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Slider>) => {
      const res = await fetch('/api/admin/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sliders'] });
      toast.success('Slider créé avec succès');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Slider> }) => {
      const res = await fetch(`/api/admin/sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sliders'] });
      toast.success('Slider mis à jour');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sliders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sliders'] });
      toast.success('Slider supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      const res = await fetch('/api/admin/sliders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sliders'] });
      setDragItems(null); // Reset drag state after successful reorder
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Use sliders directly from query for display
  // Use local state only during drag operations for immediate visual feedback
  const [dragItems, setDragItems] = useState<Slider[] | null>(null);
  
  // Display items from drag state or from query
  // When dragItems is set, we show the optimistic update
  // When the query refetches after mutation, sliders will have new data
  // and we compare with dragItems to know when to stop showing optimistic state
  const items = dragItems ?? sliders;

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setDragItems(newItems);
      reorderMutation.mutate(
        newItems.map((item, index) => ({ id: item.id, order: index }))
      );
    }
  };
  
  // Reset drag state when mutation is complete and query has new data
  // This is done in the onSuccess of reorderMutation

  const resetForm = () => {
    setFormData({
      titleFr: '',
      titleEn: '',
      subtitleFr: '',
      subtitleEn: '',
      buttonTextFr: '',
      buttonTextEn: '',
      buttonUrl: '',
      imageUrl: '',
      imageAltFr: '',
      imageAltEn: '',
      visible: true,
    });
    setEditingSlider(null);
  };

  const openEditDialog = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData(slider);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlider) {
      updateMutation.mutate({ id: editingSlider.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slider</h1>
          <p className="text-muted-foreground">Gérez les diapositives du carrousel principal</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSlider ? 'Modifier le slider' : 'Ajouter un slider'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4">
                  <div>
                    <Label>Titre</Label>
                    <Input value={formData.titleFr || ''} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Sous-titre</Label>
                    <Textarea value={formData.subtitleFr || ''} onChange={(e) => setFormData({ ...formData, subtitleFr: e.target.value })} />
                  </div>
                  <div>
                    <Label>Texte du bouton</Label>
                    <Input value={formData.buttonTextFr || ''} onChange={(e) => setFormData({ ...formData, buttonTextFr: e.target.value })} />
                  </div>
                  <div>
                    <Label>Alt image</Label>
                    <Input value={formData.imageAltFr || ''} onChange={(e) => setFormData({ ...formData, imageAltFr: e.target.value })} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={formData.titleEn || ''} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea value={formData.subtitleEn || ''} onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })} />
                  </div>
                  <div>
                    <Label>Button text</Label>
                    <Input value={formData.buttonTextEn || ''} onChange={(e) => setFormData({ ...formData, buttonTextEn: e.target.value })} />
                  </div>
                  <div>
                    <Label>Image alt</Label>
                    <Input value={formData.imageAltEn || ''} onChange={(e) => setFormData({ ...formData, imageAltEn: e.target.value })} />
                  </div>
                </TabsContent>
              </Tabs>
              <div>
                <Label>URL de l&apos;image</Label>
                <Input value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
              </div>
              <div>
                <Label>URL du bouton</Label>
                <Input value={formData.buttonUrl || ''} onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.visible} onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })} />
                <Label>Visible</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit">{editingSlider ? 'Mettre à jour' : 'Créer'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des sliders</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((slider) => (
                <SortableItem key={slider.id} slider={slider} onEdit={openEditDialog} onDelete={(id) => deleteMutation.mutate(id)} />
              ))}
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun slider. Cliquez sur le bouton pour en ajouter un.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
