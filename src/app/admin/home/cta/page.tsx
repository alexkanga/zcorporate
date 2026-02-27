'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface HomeCTA {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

export default function CTAAdminPage() {
  const queryClient = useQueryClient();

  const { data: cta, isLoading } = useQuery({
    queryKey: ['admin-home-cta'],
    queryFn: async () => { const res = await fetch('/api/admin/home-cta'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HomeCTA>) => {
      const res = await fetch('/api/admin/home-cta', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-home-cta'] }); toast.success('CTA mis à jour'); },
    onError: () => toast.error('Erreur'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      titleFr: formData.get('titleFr') as string,
      titleEn: formData.get('titleEn') as string,
      subtitleFr: formData.get('subtitleFr') as string,
      subtitleEn: formData.get('subtitleEn') as string,
      buttonTextFr: formData.get('buttonTextFr') as string,
      buttonTextEn: formData.get('buttonTextEn') as string,
      buttonUrl: formData.get('buttonUrl') as string,
    });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Appel à l&apos;action</h1><p className="text-muted-foreground">Modifiez la section CTA de la page d&apos;accueil</p></div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Contenu</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="fr">
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
              <TabsContent value="fr" className="space-y-4 mt-4">
                <div><Label htmlFor="titleFr">Titre</Label><Input id="titleFr" name="titleFr" defaultValue={cta?.titleFr || ''} required /></div>
                <div><Label htmlFor="subtitleFr">Sous-titre</Label><Input id="subtitleFr" name="subtitleFr" defaultValue={cta?.subtitleFr || ''} /></div>
                <div><Label htmlFor="buttonTextFr">Texte du bouton</Label><Input id="buttonTextFr" name="buttonTextFr" defaultValue={cta?.buttonTextFr || ''} /></div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4 mt-4">
                <div><Label htmlFor="titleEn">Title</Label><Input id="titleEn" name="titleEn" defaultValue={cta?.titleEn || ''} required /></div>
                <div><Label htmlFor="subtitleEn">Subtitle</Label><Input id="subtitleEn" name="subtitleEn" defaultValue={cta?.subtitleEn || ''} /></div>
                <div><Label htmlFor="buttonTextEn">Button text</Label><Input id="buttonTextEn" name="buttonTextEn" defaultValue={cta?.buttonTextEn || ''} /></div>
              </TabsContent>
            </Tabs>
            <div><Label htmlFor="buttonUrl">URL du bouton</Label><Input id="buttonUrl" name="buttonUrl" defaultValue={cta?.buttonUrl || ''} /></div>
            <div className="flex justify-end"><Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Enregistrer</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
