'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const SECTIONS = [
  { id: 'services', label: 'Services' },
  { id: 'testimonials', label: 'Témoignages' },
  { id: 'partners', label: 'Partenaires' },
  { id: 'articles', label: 'Articles' },
];

interface HomeSection {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  buttonUrl: string | null;
}

export default function SectionsAdminPage() {
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-home-sections'],
    queryFn: async () => {
      const res = await fetch('/api/admin/home-sections');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<HomeSection[]>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: HomeSection) => {
      const res = await fetch(`/api/admin/home-sections/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-sections'] });
      toast.success('Section mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleSubmit = (sectionId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: HomeSection = {
      id: sectionId,
      titleFr: formData.get(`${sectionId}-titleFr`) as string,
      titleEn: formData.get(`${sectionId}-titleEn`) as string,
      subtitleFr: formData.get(`${sectionId}-subtitleFr`) as string,
      subtitleEn: formData.get(`${sectionId}-subtitleEn`) as string,
      buttonTextFr: formData.get(`${sectionId}-buttonTextFr`) as string || null,
      buttonTextEn: formData.get(`${sectionId}-buttonTextEn`) as string || null,
      buttonUrl: formData.get(`${sectionId}-buttonUrl`) as string || null,
    };
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const getSection = (id: string) => sections?.find(s => s.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Titres des sections</h1>
        <p className="text-muted-foreground">Modifiez les titres et sous-titres des sections de la page d&apos;accueil</p>
      </div>

      <div className="grid gap-6">
        {SECTIONS.map((section) => {
          const sectionData = getSection(section.id);
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(section.id, e)}>
                  <Tabs defaultValue="fr">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="fr">Français</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fr" className="space-y-4">
                      <div>
                        <Label>Titre</Label>
                        <Input 
                          name={`${section.id}-titleFr`} 
                          defaultValue={sectionData?.titleFr || ''} 
                        />
                      </div>
                      <div>
                        <Label>Sous-titre</Label>
                        <Input 
                          name={`${section.id}-subtitleFr`} 
                          defaultValue={sectionData?.subtitleFr || ''} 
                        />
                      </div>
                      {(section.id === 'partners' || section.id === 'articles') && (
                        <div>
                          <Label>Texte du bouton</Label>
                          <Input 
                            name={`${section.id}-buttonTextFr`} 
                            defaultValue={sectionData?.buttonTextFr || ''} 
                          />
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input 
                          name={`${section.id}-titleEn`} 
                          defaultValue={sectionData?.titleEn || ''} 
                        />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input 
                          name={`${section.id}-subtitleEn`} 
                          defaultValue={sectionData?.subtitleEn || ''} 
                        />
                      </div>
                      {(section.id === 'partners' || section.id === 'articles') && (
                        <div>
                          <Label>Button text</Label>
                          <Input 
                            name={`${section.id}-buttonTextEn`} 
                            defaultValue={sectionData?.buttonTextEn || ''} 
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  {(section.id === 'partners' || section.id === 'articles') && (
                    <div className="mt-4">
                      <Label>URL du bouton</Label>
                      <Input 
                        name={`${section.id}-buttonUrl`} 
                        defaultValue={sectionData?.buttonUrl || ''} 
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
