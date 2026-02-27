'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface HomeAbout {
  id: string;
  titleFr: string;
  titleEn: string;
  contentFr: string;
  contentEn: string;
  imageUrl: string | null;
  imageAltFr: string | null;
  imageAltEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

export default function AboutAdminPage() {
  const queryClient = useQueryClient();

  const { data: about, isLoading } = useQuery({
    queryKey: ['admin-home-about'],
    queryFn: async () => {
      const res = await fetch('/api/admin/home-about');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HomeAbout>) => {
      const res = await fetch('/api/admin/home-about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-about'] });
      toast.success('Section À propos mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      titleFr: formData.get('titleFr') as string,
      titleEn: formData.get('titleEn') as string,
      contentFr: formData.get('contentFr') as string,
      contentEn: formData.get('contentEn') as string,
      imageUrl: formData.get('imageUrl') as string,
      imageAltFr: formData.get('imageAltFr') as string,
      imageAltEn: formData.get('imageAltEn') as string,
      buttonTextFr: formData.get('buttonTextFr') as string,
      buttonTextEn: formData.get('buttonTextEn') as string,
      buttonUrl: formData.get('buttonUrl') as string,
    };
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Section À propos</h1>
        <p className="text-muted-foreground">Modifiez la section À propos de la page d&apos;accueil</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="fr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="titleFr">Titre</Label>
                  <Input id="titleFr" name="titleFr" defaultValue={about?.titleFr || ''} required />
                </div>
                <div>
                  <Label htmlFor="contentFr">Contenu</Label>
                  <Textarea id="contentFr" name="contentFr" defaultValue={about?.contentFr || ''} rows={6} />
                </div>
                <div>
                  <Label htmlFor="imageAltFr">Alt image</Label>
                  <Input id="imageAltFr" name="imageAltFr" defaultValue={about?.imageAltFr || ''} />
                </div>
                <div>
                  <Label htmlFor="buttonTextFr">Texte du bouton</Label>
                  <Input id="buttonTextFr" name="buttonTextFr" defaultValue={about?.buttonTextFr || ''} />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="titleEn">Title</Label>
                  <Input id="titleEn" name="titleEn" defaultValue={about?.titleEn || ''} required />
                </div>
                <div>
                  <Label htmlFor="contentEn">Content</Label>
                  <Textarea id="contentEn" name="contentEn" defaultValue={about?.contentEn || ''} rows={6} />
                </div>
                <div>
                  <Label htmlFor="imageAltEn">Image alt</Label>
                  <Input id="imageAltEn" name="imageAltEn" defaultValue={about?.imageAltEn || ''} />
                </div>
                <div>
                  <Label htmlFor="buttonTextEn">Button text</Label>
                  <Input id="buttonTextEn" name="buttonTextEn" defaultValue={about?.buttonTextEn || ''} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="imageUrl">URL de l&apos;image</Label>
                <Input id="imageUrl" name="imageUrl" defaultValue={about?.imageUrl || ''} />
              </div>
              <div>
                <Label htmlFor="buttonUrl">URL du bouton</Label>
                <Input id="buttonUrl" name="buttonUrl" defaultValue={about?.buttonUrl || ''} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
