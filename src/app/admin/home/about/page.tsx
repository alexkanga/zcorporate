'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

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
  badgeTextFr: string | null;
  badgeTextEn: string | null;
  stat1Value: string | null;
  stat1LabelFr: string | null;
  stat1LabelEn: string | null;
  stat2Value: string | null;
  stat2LabelFr: string | null;
  stat2LabelEn: string | null;
  stat3Value: string | null;
  stat3LabelFr: string | null;
  stat3LabelEn: string | null;
  floatingBadgeTitleFr: string | null;
  floatingBadgeTitleEn: string | null;
  floatingBadgeTextFr: string | null;
  floatingBadgeTextEn: string | null;
}

export default function AboutAdminPage() {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string>('');

  const { data: about, isLoading } = useQuery({
    queryKey: ['admin-home-about'],
    queryFn: async () => {
      const res = await fetch('/api/admin/home-about');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<HomeAbout>;
    },
  });

  // Initialize imageUrl from server data when it first loads
  if (about?.imageUrl && imageUrl === '') {
    setImageUrl(about.imageUrl);
  }

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
      imageUrl: imageUrl,
      imageAltFr: formData.get('imageAltFr') as string,
      imageAltEn: formData.get('imageAltEn') as string,
      buttonTextFr: formData.get('buttonTextFr') as string,
      buttonTextEn: formData.get('buttonTextEn') as string,
      buttonUrl: formData.get('buttonUrl') as string,
      badgeTextFr: formData.get('badgeTextFr') as string,
      badgeTextEn: formData.get('badgeTextEn') as string,
      stat1Value: formData.get('stat1Value') as string,
      stat1LabelFr: formData.get('stat1LabelFr') as string,
      stat1LabelEn: formData.get('stat1LabelEn') as string,
      stat2Value: formData.get('stat2Value') as string,
      stat2LabelFr: formData.get('stat2LabelFr') as string,
      stat2LabelEn: formData.get('stat2LabelEn') as string,
      stat3Value: formData.get('stat3Value') as string,
      stat3LabelFr: formData.get('stat3LabelFr') as string,
      stat3LabelEn: formData.get('stat3LabelEn') as string,
      floatingBadgeTitleFr: formData.get('floatingBadgeTitleFr') as string,
      floatingBadgeTitleEn: formData.get('floatingBadgeTitleEn') as string,
      floatingBadgeTextFr: formData.get('floatingBadgeTextFr') as string,
      floatingBadgeTextEn: formData.get('floatingBadgeTextEn') as string,
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
            <CardTitle>Contenu principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="fr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="badgeTextFr">Badge (petit texte au-dessus du titre)</Label>
                  <Input id="badgeTextFr" name="badgeTextFr" defaultValue={about?.badgeTextFr || ''} placeholder="À Propos" />
                </div>
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
                  <Label htmlFor="badgeTextEn">Badge (small text above title)</Label>
                  <Input id="badgeTextEn" name="badgeTextEn" defaultValue={about?.badgeTextEn || ''} placeholder="About Us" />
                </div>
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
                <Label htmlFor="buttonUrl">URL du bouton</Label>
                <Input id="buttonUrl" name="buttonUrl" defaultValue={about?.buttonUrl || ''} />
              </div>
            </div>

            {/* Image Upload Component */}
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="about"
              label="Image de la section"
              previewClassName="h-48 w-full"
            />
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Stat 1 */}
              <div className="space-y-4">
                <h4 className="font-medium">Statistique 1</h4>
                <div>
                  <Label htmlFor="stat1Value">Valeur</Label>
                  <Input id="stat1Value" name="stat1Value" defaultValue={about?.stat1Value || ''} placeholder="10+" />
                </div>
                <Tabs defaultValue="fr">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr">
                    <Input name="stat1LabelFr" defaultValue={about?.stat1LabelFr || ''} placeholder="Ans d'Expérience" />
                  </TabsContent>
                  <TabsContent value="en">
                    <Input name="stat1LabelEn" defaultValue={about?.stat1LabelEn || ''} placeholder="Years Experience" />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Stat 2 */}
              <div className="space-y-4">
                <h4 className="font-medium">Statistique 2</h4>
                <div>
                  <Label htmlFor="stat2Value">Valeur</Label>
                  <Input id="stat2Value" name="stat2Value" defaultValue={about?.stat2Value || ''} placeholder="500+" />
                </div>
                <Tabs defaultValue="fr">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr">
                    <Input name="stat2LabelFr" defaultValue={about?.stat2LabelFr || ''} placeholder="Projets Réalisés" />
                  </TabsContent>
                  <TabsContent value="en">
                    <Input name="stat2LabelEn" defaultValue={about?.stat2LabelEn || ''} placeholder="Projects Completed" />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Stat 3 */}
              <div className="space-y-4">
                <h4 className="font-medium">Statistique 3</h4>
                <div>
                  <Label htmlFor="stat3Value">Valeur</Label>
                  <Input id="stat3Value" name="stat3Value" defaultValue={about?.stat3Value || ''} placeholder="100%" />
                </div>
                <Tabs defaultValue="fr">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr">
                    <Input name="stat3LabelFr" defaultValue={about?.stat3LabelFr || ''} placeholder="Clients Satisfaits" />
                  </TabsContent>
                  <TabsContent value="en">
                    <Input name="stat3LabelEn" defaultValue={about?.stat3LabelEn || ''} placeholder="Client Satisfaction" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Badge Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Badge flottant sur l&apos;image</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="floatingBadgeTitleFr">Titre</Label>
                  <Input id="floatingBadgeTitleFr" name="floatingBadgeTitleFr" defaultValue={about?.floatingBadgeTitleFr || ''} placeholder="Excellence Certifiée" />
                </div>
                <div>
                  <Label htmlFor="floatingBadgeTextFr">Texte</Label>
                  <Input id="floatingBadgeTextFr" name="floatingBadgeTextFr" defaultValue={about?.floatingBadgeTextFr || ''} placeholder="Qualité garantie" />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="floatingBadgeTitleEn">Title</Label>
                  <Input id="floatingBadgeTitleEn" name="floatingBadgeTitleEn" defaultValue={about?.floatingBadgeTitleEn || ''} placeholder="Certified Excellence" />
                </div>
                <div>
                  <Label htmlFor="floatingBadgeTextEn">Text</Label>
                  <Input id="floatingBadgeTextEn" name="floatingBadgeTextEn" defaultValue={about?.floatingBadgeTextEn || ''} placeholder="Quality guaranteed" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
