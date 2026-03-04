'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadCompact } from '@/components/admin/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  icon: string | null;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  order: number;
  visible: boolean;
}

const ICON_OPTIONS = [
  { value: 'Wrench', label: 'Clé / Outils' },
  { value: 'Droplets', label: 'Gouttes / Eau' },
  { value: 'Building2', label: 'Bâtiment' },
  { value: 'Users', label: 'Utilisateurs' },
  { value: 'Target', label: 'Cible' },
  { value: 'Shield', label: 'Bouclier' },
  { value: 'Leaf', label: 'Feuille / Environnement' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Heart', label: 'Cœur' },
  { value: 'Lightbulb', label: 'Ampoule' },
  { value: 'Settings', label: 'Engrenage' },
  { value: 'CheckCircle', label: 'Validation' },
];

const defaultService: Omit<Service, 'id'> = {
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  icon: 'Wrench',
  imageUrl: '',
  imageAltFr: '',
  imageAltEn: '',
  order: 0,
  visible: true,
};

export default function ServicesListPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, 'id'>>(defaultService);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const res = await fetch('/api/admin/services');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<Service[]>;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Service, 'id'>) => {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service créé avec succès');
      handleCloseDialog();
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service mis à jour avec succès');
      handleCloseDialog();
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service supprimé avec succès');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (services: { id: string; order: number }[]) => {
      const res = await fetch('/api/admin/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  // Toggle visibility mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({ ...defaultService, order: services.length });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      titleFr: service.titleFr,
      titleEn: service.titleEn,
      descriptionFr: service.descriptionFr || '',
      descriptionEn: service.descriptionEn || '',
      icon: service.icon || 'Wrench',
      imageUrl: service.imageUrl || '',
      imageAltFr: service.imageAltFr || '',
      imageAltEn: service.imageAltEn || '',
      order: service.order,
      visible: service.visible,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData(defaultService);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    const reorderData = newServices.map((s, i) => ({ id: s.id, order: i }));
    reorderMutation.mutate(reorderData);
  };

  const handleMoveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    const reorderData = newServices.map((s, i) => ({ id: s.id, order: i }));
    reorderMutation.mutate(reorderData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liste des Services</h1>
          <p className="text-muted-foreground">
            Gérez les services affichés dans les cartes sur la page Services
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un service
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun service</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par ajouter votre premier service
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card key={service.id} className={cn(!service.visible && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Drag handle */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </Button>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === services.length - 1}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </div>

                  {/* Service content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      {service.imageUrl ? (
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={service.imageUrl}
                            alt={service.titleFr}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{service.titleFr}</h3>
                          <span className="text-xs text-muted-foreground">/ {service.titleEn}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.descriptionFr || 'Pas de description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            Ordre: {service.order + 1}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            Icône: {service.icon}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleMutation.mutate({ id: service.id, visible: !service.visible })}
                        >
                          {service.visible ? (
                            <Eye className="h-5 w-5 text-green-500" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(service)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(service.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Modifier le service' : 'Ajouter un service'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du service
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* French fields */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase text-muted-foreground">Français</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleFr">Titre (FR) *</Label>
                  <Input
                    id="titleFr"
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    placeholder="Titre du service"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageAltFr">Texte alternatif image (FR)</Label>
                  <Input
                    id="imageAltFr"
                    value={formData.imageAltFr || ''}
                    onChange={(e) => setFormData({ ...formData, imageAltFr: e.target.value })}
                    placeholder="Description de l'image"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descriptionFr">Description (FR)</Label>
                <Textarea
                  id="descriptionFr"
                  value={formData.descriptionFr || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  placeholder="Description du service"
                  rows={3}
                />
              </div>
            </div>

            {/* English fields */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase text-muted-foreground">English</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleEn">Title (EN) *</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Service title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageAltEn">Image alt text (EN)</Label>
                  <Input
                    id="imageAltEn"
                    value={formData.imageAltEn || ''}
                    onChange={(e) => setFormData({ ...formData, imageAltEn: e.target.value })}
                    placeholder="Image description"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descriptionEn">Description (EN)</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Service description"
                  rows={3}
                />
              </div>
            </div>

            {/* Image and icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Image</Label>
                <ImageUploadCompact
                  value={formData.imageUrl || ''}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="services"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icône</Label>
                <select
                  id="icon"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.icon || 'Wrench'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {ICON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Visible</Label>
                <p className="text-sm text-muted-foreground">
                  Le service sera affiché sur le site
                </p>
              </div>
              <Switch
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  editingService ? 'Modifier' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
