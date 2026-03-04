'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { VideoUrlInput, type VideoType } from '@/components/admin/VideoUrlInput';
import { toast } from 'sonner';
import { Save, Loader2, Eye, EyeOff, Image, FileText, Megaphone, Settings } from 'lucide-react';

interface ServicesPageData {
  id: string;
  // Hero Section
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string | null;
  heroSubtitleEn: string | null;
  heroBadgeFr: string | null;
  heroBadgeEn: string | null;
  heroImageUrl: string | null;
  heroImageAltFr: string | null;
  heroImageAltEn: string | null;
  heroVideoUrl: string | null;
  heroVideoType: string | null;
  // Main Content Section
  mainTitleFr: string | null;
  mainTitleEn: string | null;
  mainContentFr: string | null;
  mainContentEn: string | null;
  mainImageUrl: string | null;
  mainImageAltFr: string | null;
  mainImageAltEn: string | null;
  mainVideoUrl: string | null;
  mainVideoType: string | null;
  // CTA Section
  ctaTitleFr: string | null;
  ctaTitleEn: string | null;
  ctaSubtitleFr: string | null;
  ctaSubtitleEn: string | null;
  ctaButtonTextFr: string | null;
  ctaButtonTextEn: string | null;
  ctaButtonUrl: string | null;
  // Floating Badge
  floatingBadgeTitleFr: string | null;
  floatingBadgeTitleEn: string | null;
  floatingBadgeTextFr: string | null;
  floatingBadgeTextEn: string | null;
  // Settings
  published: boolean;
}

export default function ServicesPageAdmin() {
  const queryClient = useQueryClient();
  
  const [initialized, setInitialized] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Local state for images
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  
  // Local state for videos
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('');
  const [heroVideoType, setHeroVideoType] = useState<VideoType>(null);
  const [mainVideoUrl, setMainVideoUrl] = useState<string>('');
  const [mainVideoType, setMainVideoType] = useState<VideoType>(null);
  
  // Track media type selection
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');
  const [mainMediaType, setMainMediaType] = useState<'image' | 'video'>('image');
  
  // Local state for rich text editors
  const [mainContentFr, setMainContentFr] = useState<string>('');
  const [mainContentEn, setMainContentEn] = useState<string>('');
  
  // Local state for settings
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const { data: servicesPage, isLoading } = useQuery({
    queryKey: ['admin-services-page'],
    queryFn: async () => {
      const res = await fetch('/api/admin/services-page');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<ServicesPageData>;
    },
  });

  // Initialize form state once when data loads
  if (servicesPage && !initialized) {
    setMainContentFr(servicesPage.mainContentFr || '');
    setMainContentEn(servicesPage.mainContentEn || '');
    setHeroImageUrl(servicesPage.heroImageUrl || '');
    setMainImageUrl(servicesPage.mainImageUrl || '');
    setHeroVideoUrl(servicesPage.heroVideoUrl || '');
    setHeroVideoType(servicesPage.heroVideoType as VideoType || null);
    setMainVideoUrl(servicesPage.mainVideoUrl || '');
    setMainVideoType(servicesPage.mainVideoType as VideoType || null);
    setHeroMediaType(servicesPage.heroVideoUrl ? 'video' : 'image');
    setMainMediaType(servicesPage.mainVideoUrl ? 'video' : 'image');
    setIsPublished(servicesPage.published ?? true);
    setInitialized(true);
  }

  // Wrapper functions to track local changes
  const handleHeroImageChange = (url: string) => {
    setHasLocalChanges(true);
    setHeroImageUrl(url);
    if (url) {
      setHeroVideoUrl('');
      setHeroVideoType(null);
    }
    setHeroMediaType('image');
  };

  const handleMainImageChange = (url: string) => {
    setHasLocalChanges(true);
    setMainImageUrl(url);
    if (url) {
      setMainVideoUrl('');
      setMainVideoType(null);
    }
    setMainMediaType('image');
  };

  const handleHeroVideoChange = (url: string, type: VideoType) => {
    setHasLocalChanges(true);
    setHeroVideoUrl(url);
    setHeroVideoType(type);
    if (url) {
      setHeroImageUrl('');
    }
    setHeroMediaType('video');
  };

  const handleMainVideoChange = (url: string, type: VideoType) => {
    setHasLocalChanges(true);
    setMainVideoUrl(url);
    setMainVideoType(type);
    if (url) {
      setMainImageUrl('');
    }
    setMainMediaType('video');
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ServicesPageData>) => {
      const res = await fetch('/api/admin/services-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      setHasLocalChanges(false);
      queryClient.invalidateQueries({ queryKey: ['admin-services-page'] });
      toast.success('Page Services mise à jour avec succès');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: Partial<ServicesPageData> = {
      heroTitleFr: (formData.get('heroTitleFr') as string) || servicesPage?.heroTitleFr || 'Nos Services',
      heroTitleEn: (formData.get('heroTitleEn') as string) || servicesPage?.heroTitleEn || 'Our Services',
      heroSubtitleFr: formData.get('heroSubtitleFr') as string || null,
      heroSubtitleEn: formData.get('heroSubtitleEn') as string || null,
      heroBadgeFr: formData.get('heroBadgeFr') as string || null,
      heroBadgeEn: formData.get('heroBadgeEn') as string || null,
      heroImageUrl: heroImageUrl || servicesPage?.heroImageUrl || null,
      heroImageAltFr: formData.get('heroImageAltFr') as string || null,
      heroImageAltEn: formData.get('heroImageAltEn') as string || null,
      heroVideoUrl: heroVideoUrl || null,
      heroVideoType: heroVideoType || null,
      mainTitleFr: formData.get('mainTitleFr') as string || null,
      mainTitleEn: formData.get('mainTitleEn') as string || null,
      mainContentFr: mainContentFr || servicesPage?.mainContentFr || null,
      mainContentEn: mainContentEn || servicesPage?.mainContentEn || null,
      mainImageUrl: mainImageUrl || servicesPage?.mainImageUrl || null,
      mainImageAltFr: formData.get('mainImageAltFr') as string || null,
      mainImageAltEn: formData.get('mainImageAltEn') as string || null,
      mainVideoUrl: mainVideoUrl || null,
      mainVideoType: mainVideoType || null,
      ctaTitleFr: formData.get('ctaTitleFr') as string || null,
      ctaTitleEn: formData.get('ctaTitleEn') as string || null,
      ctaSubtitleFr: formData.get('ctaSubtitleFr') as string || null,
      ctaSubtitleEn: formData.get('ctaSubtitleEn') as string || null,
      ctaButtonTextFr: formData.get('ctaButtonTextFr') as string || null,
      ctaButtonTextEn: formData.get('ctaButtonTextEn') as string || null,
      ctaButtonUrl: formData.get('ctaButtonUrl') as string || null,
      floatingBadgeTitleFr: formData.get('floatingBadgeTitleFr') as string || null,
      floatingBadgeTitleEn: formData.get('floatingBadgeTitleEn') as string || null,
      floatingBadgeTextFr: formData.get('floatingBadgeTextFr') as string || null,
      floatingBadgeTextEn: formData.get('floatingBadgeTextEn') as string || null,
      published: isPublished,
    };

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page Services</h1>
          <p className="text-muted-foreground">
            Gérez le contenu de la page Services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {servicesPage?.published ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">
              {servicesPage?.published ? 'Publiée' : 'Non publiée'}
            </span>
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contenu</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">CTA</span>
          </TabsTrigger>
          <TabsTrigger value="badge" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Badge</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Section Hero
              </CardTitle>
              <CardDescription>
                L&apos;en-tête de la page avec le titre principal et l&apos;image/vidéo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroBadgeFr">Badge</Label>
                      <Input id="heroBadgeFr" name="heroBadgeFr" defaultValue={servicesPage?.heroBadgeFr || ''} placeholder="Services" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleFr">Titre principal</Label>
                      <Input id="heroTitleFr" name="heroTitleFr" defaultValue={servicesPage?.heroTitleFr || 'Nos Services'} required placeholder="Nos Services" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleFr">Sous-titre</Label>
                    <Input id="heroSubtitleFr" name="heroSubtitleFr" defaultValue={servicesPage?.heroSubtitleFr || ''} />
                  </div>
                  <div>
                    <Label htmlFor="heroImageAltFr">Texte alternatif image</Label>
                    <Input id="heroImageAltFr" name="heroImageAltFr" defaultValue={servicesPage?.heroImageAltFr || ''} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroBadgeEn">Badge</Label>
                      <Input id="heroBadgeEn" name="heroBadgeEn" defaultValue={servicesPage?.heroBadgeEn || ''} placeholder="Services" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleEn">Main Title</Label>
                      <Input id="heroTitleEn" name="heroTitleEn" defaultValue={servicesPage?.heroTitleEn || 'Our Services'} required placeholder="Our Services" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleEn">Subtitle</Label>
                    <Input id="heroSubtitleEn" name="heroSubtitleEn" defaultValue={servicesPage?.heroSubtitleEn || ''} />
                  </div>
                  <div>
                    <Label htmlFor="heroImageAltEn">Image alt text</Label>
                    <Input id="heroImageAltEn" name="heroImageAltEn" defaultValue={servicesPage?.heroImageAltEn || ''} />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Media selection tabs */}
              <Tabs value={heroMediaType} onValueChange={(v) => setHeroMediaType(v as 'image' | 'video')} className="border rounded-lg p-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Vidéo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                  <ImageUpload
                    value={heroImageUrl || servicesPage?.heroImageUrl || ''}
                    onChange={handleHeroImageChange}
                    folder="services"
                    label="Image Hero"
                    previewClassName="h-48 w-full"
                  />
                </TabsContent>
                <TabsContent value="video">
                  <VideoUrlInput
                    value={heroVideoUrl}
                    type={heroVideoType}
                    onChange={handleHeroVideoChange}
                    label="Vidéo Hero (YouTube, Vimeo, Dailymotion)"
                    showPreview={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Main Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenu Principal
              </CardTitle>
              <CardDescription>
                Le contenu principal de la page avec texte et média
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="mainTitleFr">Titre de section</Label>
                    <Input id="mainTitleFr" name="mainTitleFr" defaultValue={servicesPage?.mainTitleFr || ''} placeholder="À propos de nos services" />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <RichTextEditor
                      value={mainContentFr || servicesPage?.mainContentFr || ''}
                      onChange={setMainContentFr}
                      placeholder="Rédigez le contenu principal..."
                      minHeight="300px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mainImageAltFr">Texte alternatif image</Label>
                    <Input id="mainImageAltFr" name="mainImageAltFr" defaultValue={servicesPage?.mainImageAltFr || ''} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="mainTitleEn">Section Title</Label>
                    <Input id="mainTitleEn" name="mainTitleEn" defaultValue={servicesPage?.mainTitleEn || ''} placeholder="About our services" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                      value={mainContentEn || servicesPage?.mainContentEn || ''}
                      onChange={setMainContentEn}
                      placeholder="Write the main content..."
                      minHeight="300px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mainImageAltEn">Image alt text</Label>
                    <Input id="mainImageAltEn" name="mainImageAltEn" defaultValue={servicesPage?.mainImageAltEn || ''} />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Media selection tabs */}
              <Tabs value={mainMediaType} onValueChange={(v) => setMainMediaType(v as 'image' | 'video')} className="border rounded-lg p-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Vidéo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                  <ImageUpload
                    value={mainImageUrl || servicesPage?.mainImageUrl || ''}
                    onChange={handleMainImageChange}
                    folder="services"
                    label="Image du contenu principal"
                    previewClassName="h-48 w-full"
                  />
                </TabsContent>
                <TabsContent value="video">
                  <VideoUrlInput
                    value={mainVideoUrl}
                    type={mainVideoType}
                    onChange={handleMainVideoChange}
                    label="Vidéo du contenu principal"
                    showPreview={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Tab */}
        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Section Appel à l&apos;Action
              </CardTitle>
              <CardDescription>
                Un bloc d&apos;appel à l&apos;action pour encourager les visiteurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ctaTitleFr">Titre</Label>
                    <Input id="ctaTitleFr" name="ctaTitleFr" defaultValue={servicesPage?.ctaTitleFr || ''} placeholder="Prêt à démarrer ?" />
                  </div>
                  <div>
                    <Label htmlFor="ctaSubtitleFr">Sous-titre</Label>
                    <Input id="ctaSubtitleFr" name="ctaSubtitleFr" defaultValue={servicesPage?.ctaSubtitleFr || ''} placeholder="Contactez-nous pour discuter de votre projet" />
                  </div>
                  <div>
                    <Label htmlFor="ctaButtonTextFr">Texte du bouton</Label>
                    <Input id="ctaButtonTextFr" name="ctaButtonTextFr" defaultValue={servicesPage?.ctaButtonTextFr || ''} placeholder="Nous contacter" />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ctaTitleEn">Title</Label>
                    <Input id="ctaTitleEn" name="ctaTitleEn" defaultValue={servicesPage?.ctaTitleEn || ''} placeholder="Ready to start?" />
                  </div>
                  <div>
                    <Label htmlFor="ctaSubtitleEn">Subtitle</Label>
                    <Input id="ctaSubtitleEn" name="ctaSubtitleEn" defaultValue={servicesPage?.ctaSubtitleEn || ''} placeholder="Contact us to discuss your project" />
                  </div>
                  <div>
                    <Label htmlFor="ctaButtonTextEn">Button text</Label>
                    <Input id="ctaButtonTextEn" name="ctaButtonTextEn" defaultValue={servicesPage?.ctaButtonTextEn || ''} placeholder="Contact us" />
                  </div>
                </TabsContent>
              </Tabs>
              <div>
                <Label htmlFor="ctaButtonUrl">URL du bouton</Label>
                <Input id="ctaButtonUrl" name="ctaButtonUrl" defaultValue={servicesPage?.ctaButtonUrl || ''} placeholder="/contact" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badge Tab */}
        <TabsContent value="badge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Badge flottant sur l&apos;image
              </CardTitle>
              <CardDescription>
                Le badge qui apparaît sur l&apos;image hero
              </CardDescription>
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
                    <Input id="floatingBadgeTitleFr" name="floatingBadgeTitleFr" defaultValue={servicesPage?.floatingBadgeTitleFr || ''} placeholder="Excellence Certifiée" />
                  </div>
                  <div>
                    <Label htmlFor="floatingBadgeTextFr">Texte</Label>
                    <Input id="floatingBadgeTextFr" name="floatingBadgeTextFr" defaultValue={servicesPage?.floatingBadgeTextFr || ''} placeholder="Qualité garantie" />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="floatingBadgeTitleEn">Title</Label>
                    <Input id="floatingBadgeTitleEn" name="floatingBadgeTitleEn" defaultValue={servicesPage?.floatingBadgeTitleEn || ''} placeholder="Certified Excellence" />
                  </div>
                  <div>
                    <Label htmlFor="floatingBadgeTextEn">Text</Label>
                    <Input id="floatingBadgeTextEn" name="floatingBadgeTextEn" defaultValue={servicesPage?.floatingBadgeTextEn || ''} placeholder="Quality guaranteed" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
              <CardDescription>
                Paramètres de publication de la page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publiée</Label>
                  <p className="text-sm text-muted-foreground">
                    La page sera visible sur le site frontend
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
