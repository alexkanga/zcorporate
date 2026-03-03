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
import { Save, Loader2, Eye, EyeOff, Image, BarChart3, Target, Heart, Megaphone, Award, FileText, Settings, Menu, Video } from 'lucide-react';

interface AboutPageData {
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
  // Statistics Section
  stat1Value: string | null;
  stat1LabelFr: string | null;
  stat1LabelEn: string | null;
  stat2Value: string | null;
  stat2LabelFr: string | null;
  stat2LabelEn: string | null;
  stat3Value: string | null;
  stat3LabelFr: string | null;
  stat3LabelEn: string | null;
  stat4Value: string | null;
  stat4LabelFr: string | null;
  stat4LabelEn: string | null;
  // Mission Section
  missionTitleFr: string | null;
  missionTitleEn: string | null;
  missionContentFr: string | null;
  missionContentEn: string | null;
  missionIcon: string | null;
  // Values Section
  valuesTitleFr: string | null;
  valuesTitleEn: string | null;
  valuesContentFr: string | null;
  valuesContentEn: string | null;
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
  // Menu settings
  menuLabelFr: string | null;
  menuLabelEn: string | null;
  menuOrder: number;
  showInMenu: boolean;
  // Publication
  published: boolean;
}

export default function AboutPageAdmin() {
  const queryClient = useQueryClient();
  
  // Track if form has been initialized
  const [initialized, setInitialized] = useState(false);
  
  // Track if user has made local changes (to prevent overwriting)
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Local state for images
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  
  // Local state for videos
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('');
  const [heroVideoType, setHeroVideoType] = useState<VideoType>(null);
  const [mainVideoUrl, setMainVideoUrl] = useState<string>('');
  const [mainVideoType, setMainVideoType] = useState<VideoType>(null);
  
  // Track media type selection (image or video)
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');
  const [mainMediaType, setMainMediaType] = useState<'image' | 'video'>('image');
  
  // Local state for rich text editors
  const [mainContentFr, setMainContentFr] = useState<string>('');
  const [mainContentEn, setMainContentEn] = useState<string>('');
  const [missionContentFr, setMissionContentFr] = useState<string>('');
  const [missionContentEn, setMissionContentEn] = useState<string>('');
  const [valuesContentFr, setValuesContentFr] = useState<string>('');
  const [valuesContentEn, setValuesContentEn] = useState<string>('');
  
  // Local state for settings switches
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [showInMenu, setShowInMenu] = useState<boolean>(true);

  const { data: aboutPage, isLoading } = useQuery({
    queryKey: ['admin-about-page'],
    queryFn: async () => {
      const res = await fetch('/api/admin/about-page');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<AboutPageData>;
    },
  });

  // Initialize form state once when data loads
  if (aboutPage && !initialized) {
    setMainContentFr(aboutPage.mainContentFr || '');
    setMainContentEn(aboutPage.mainContentEn || '');
    setMissionContentFr(aboutPage.missionContentFr || '');
    setMissionContentEn(aboutPage.missionContentEn || '');
    setValuesContentFr(aboutPage.valuesContentFr || '');
    setValuesContentEn(aboutPage.valuesContentEn || '');
    setHeroImageUrl(aboutPage.heroImageUrl || '');
    setMainImageUrl(aboutPage.mainImageUrl || '');
    setHeroVideoUrl(aboutPage.heroVideoUrl || '');
    setHeroVideoType(aboutPage.heroVideoType as VideoType || null);
    setMainVideoUrl(aboutPage.mainVideoUrl || '');
    setMainVideoType(aboutPage.mainVideoType as VideoType || null);
    // Set media type based on what's available (video takes priority if both exist)
    setHeroMediaType(aboutPage.heroVideoUrl ? 'video' : 'image');
    setMainMediaType(aboutPage.mainVideoUrl ? 'video' : 'image');
    setIsPublished(aboutPage.published ?? true);
    setShowInMenu(aboutPage.showInMenu ?? true);
    setInitialized(true);
  }

  // Wrapper functions to track local changes
  const handleHeroImageChange = (url: string) => {
    setHasLocalChanges(true);
    setHeroImageUrl(url);
    // Clear video when image is set
    if (url) {
      setHeroVideoUrl('');
      setHeroVideoType(null);
    }
    setHeroMediaType('image');
  };

  const handleMainImageChange = (url: string) => {
    setHasLocalChanges(true);
    setMainImageUrl(url);
    // Clear video when image is set
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
    // Clear image when video is set
    if (url) {
      setHeroImageUrl('');
    }
    setHeroMediaType('video');
  };

  const handleMainVideoChange = (url: string, type: VideoType) => {
    setHasLocalChanges(true);
    setMainVideoUrl(url);
    setMainVideoType(type);
    // Clear image when video is set
    if (url) {
      setMainImageUrl('');
    }
    setMainMediaType('video');
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AboutPageData>) => {
      const res = await fetch('/api/admin/about-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      setHasLocalChanges(false); // Reset local changes flag
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      toast.success('Page À Propos mise à jour avec succès');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: Partial<AboutPageData> = {
      // Hero Section - Required fields must have values
      heroTitleFr: (formData.get('heroTitleFr') as string) || aboutPage?.heroTitleFr || 'À Propos de Nous',
      heroTitleEn: (formData.get('heroTitleEn') as string) || aboutPage?.heroTitleEn || 'About Us',
      heroSubtitleFr: formData.get('heroSubtitleFr') as string || null,
      heroSubtitleEn: formData.get('heroSubtitleEn') as string || null,
      heroBadgeFr: formData.get('heroBadgeFr') as string || null,
      heroBadgeEn: formData.get('heroBadgeEn') as string || null,
      heroImageUrl: heroImageUrl || aboutPage?.heroImageUrl || null,
      heroImageAltFr: formData.get('heroImageAltFr') as string || null,
      heroImageAltEn: formData.get('heroImageAltEn') as string || null,
      heroVideoUrl: heroVideoUrl || null,
      heroVideoType: heroVideoType || null,
      // Main Content Section
      mainTitleFr: formData.get('mainTitleFr') as string || null,
      mainTitleEn: formData.get('mainTitleEn') as string || null,
      mainContentFr: mainContentFr || aboutPage?.mainContentFr || null,
      mainContentEn: mainContentEn || aboutPage?.mainContentEn || null,
      mainImageUrl: mainImageUrl || aboutPage?.mainImageUrl || null,
      mainImageAltFr: formData.get('mainImageAltFr') as string || null,
      mainImageAltEn: formData.get('mainImageAltEn') as string || null,
      mainVideoUrl: mainVideoUrl || null,
      mainVideoType: mainVideoType || null,
      // Statistics
      stat1Value: formData.get('stat1Value') as string || null,
      stat1LabelFr: formData.get('stat1LabelFr') as string || null,
      stat1LabelEn: formData.get('stat1LabelEn') as string || null,
      stat2Value: formData.get('stat2Value') as string || null,
      stat2LabelFr: formData.get('stat2LabelFr') as string || null,
      stat2LabelEn: formData.get('stat2LabelEn') as string || null,
      stat3Value: formData.get('stat3Value') as string || null,
      stat3LabelFr: formData.get('stat3LabelFr') as string || null,
      stat3LabelEn: formData.get('stat3LabelEn') as string || null,
      stat4Value: formData.get('stat4Value') as string || null,
      stat4LabelFr: formData.get('stat4LabelFr') as string || null,
      stat4LabelEn: formData.get('stat4LabelEn') as string || null,
      // Mission Section
      missionTitleFr: formData.get('missionTitleFr') as string || null,
      missionTitleEn: formData.get('missionTitleEn') as string || null,
      missionContentFr: missionContentFr || aboutPage?.missionContentFr || null,
      missionContentEn: missionContentEn || aboutPage?.missionContentEn || null,
      missionIcon: formData.get('missionIcon') as string || null,
      // Values Section
      valuesTitleFr: formData.get('valuesTitleFr') as string || null,
      valuesTitleEn: formData.get('valuesTitleEn') as string || null,
      valuesContentFr: valuesContentFr || aboutPage?.valuesContentFr || null,
      valuesContentEn: valuesContentEn || aboutPage?.valuesContentEn || null,
      // CTA Section
      ctaTitleFr: formData.get('ctaTitleFr') as string || null,
      ctaTitleEn: formData.get('ctaTitleEn') as string || null,
      ctaSubtitleFr: formData.get('ctaSubtitleFr') as string || null,
      ctaSubtitleEn: formData.get('ctaSubtitleEn') as string || null,
      ctaButtonTextFr: formData.get('ctaButtonTextFr') as string || null,
      ctaButtonTextEn: formData.get('ctaButtonTextEn') as string || null,
      ctaButtonUrl: formData.get('ctaButtonUrl') as string || null,
      // Floating Badge
      floatingBadgeTitleFr: formData.get('floatingBadgeTitleFr') as string || null,
      floatingBadgeTitleEn: formData.get('floatingBadgeTitleEn') as string || null,
      floatingBadgeTextFr: formData.get('floatingBadgeTextFr') as string || null,
      floatingBadgeTextEn: formData.get('floatingBadgeTextEn') as string || null,
      // Menu settings
      menuLabelFr: formData.get('menuLabelFr') as string || null,
      menuLabelEn: formData.get('menuLabelEn') as string || null,
      menuOrder: parseInt(formData.get('menuOrder') as string) || 0,
      showInMenu: showInMenu,
      // Publication
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
          <h1 className="text-3xl font-bold">Page À Propos</h1>
          <p className="text-muted-foreground">
            Gérez le contenu complet de la page À Propos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {aboutPage?.published ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">
              {aboutPage?.published ? 'Publiée' : 'Non publiée'}
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contenu</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="mission" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Mission</span>
          </TabsTrigger>
          <TabsTrigger value="values" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Valeurs</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">CTA</span>
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
                L'en-tête de la page avec le titre principal et l'image/vidéo
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
                      <Input id="heroBadgeFr" name="heroBadgeFr" defaultValue={aboutPage?.heroBadgeFr || ''} placeholder="Présentation" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleFr">Titre principal</Label>
                      <Input id="heroTitleFr" name="heroTitleFr" defaultValue={aboutPage?.heroTitleFr || 'À Propos de Nous'} required placeholder="À Propos de Nous" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleFr">Sous-titre</Label>
                    <Input id="heroSubtitleFr" name="heroSubtitleFr" defaultValue={aboutPage?.heroSubtitleFr || ''} />
                  </div>
                  <div>
                    <Label htmlFor="heroImageAltFr">Texte alternatif image</Label>
                    <Input id="heroImageAltFr" name="heroImageAltFr" defaultValue={aboutPage?.heroImageAltFr || ''} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroBadgeEn">Badge</Label>
                      <Input id="heroBadgeEn" name="heroBadgeEn" defaultValue={aboutPage?.heroBadgeEn || ''} placeholder="Presentation" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleEn">Main Title</Label>
                      <Input id="heroTitleEn" name="heroTitleEn" defaultValue={aboutPage?.heroTitleEn || 'About Us'} required placeholder="About Us" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleEn">Subtitle</Label>
                    <Input id="heroSubtitleEn" name="heroSubtitleEn" defaultValue={aboutPage?.heroSubtitleEn || ''} />
                  </div>
                  <div>
                    <Label htmlFor="heroImageAltEn">Image alt text</Label>
                    <Input id="heroImageAltEn" name="heroImageAltEn" defaultValue={aboutPage?.heroImageAltEn || ''} />
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
                    <Video className="h-4 w-4" />
                    Vidéo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                  <ImageUpload
                    value={heroImageUrl || aboutPage?.heroImageUrl || ''}
                    onChange={handleHeroImageChange}
                    folder="about"
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
                    <Input id="mainTitleFr" name="mainTitleFr" defaultValue={aboutPage?.mainTitleFr || ''} placeholder="Notre Histoire" />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <RichTextEditor
                      value={mainContentFr || aboutPage?.mainContentFr || ''}
                      onChange={setMainContentFr}
                      placeholder="Rédigez le contenu principal..."
                      minHeight="300px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mainImageAltFr">Texte alternatif image</Label>
                    <Input id="mainImageAltFr" name="mainImageAltFr" defaultValue={aboutPage?.mainImageAltFr || ''} />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="mainTitleEn">Section Title</Label>
                    <Input id="mainTitleEn" name="mainTitleEn" defaultValue={aboutPage?.mainTitleEn || ''} placeholder="Our Story" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                      value={mainContentEn || aboutPage?.mainContentEn || ''}
                      onChange={setMainContentEn}
                      placeholder="Write the main content..."
                      minHeight="300px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mainImageAltEn">Image alt text</Label>
                    <Input id="mainImageAltEn" name="mainImageAltEn" defaultValue={aboutPage?.mainImageAltEn || ''} />
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
                    <Video className="h-4 w-4" />
                    Vidéo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                  <ImageUpload
                    value={mainImageUrl || aboutPage?.mainImageUrl || ''}
                    onChange={handleMainImageChange}
                    folder="about"
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

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques
              </CardTitle>
              <CardDescription>
                Les statistiques affichées sur la page (jusqu'à 4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stat 1 */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistique 1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="stat1Value">Valeur</Label>
                      <Input id="stat1Value" name="stat1Value" defaultValue={aboutPage?.stat1Value || ''} placeholder="10+" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="stat1LabelFr">Label (FR)</Label>
                        <Input id="stat1LabelFr" name="stat1LabelFr" defaultValue={aboutPage?.stat1LabelFr || ''} placeholder="Années d'Expérience" />
                      </div>
                      <div>
                        <Label htmlFor="stat1LabelEn">Label (EN)</Label>
                        <Input id="stat1LabelEn" name="stat1LabelEn" defaultValue={aboutPage?.stat1LabelEn || ''} placeholder="Years of Experience" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat 2 */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistique 2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="stat2Value">Valeur</Label>
                      <Input id="stat2Value" name="stat2Value" defaultValue={aboutPage?.stat2Value || ''} placeholder="500+" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="stat2LabelFr">Label (FR)</Label>
                        <Input id="stat2LabelFr" name="stat2LabelFr" defaultValue={aboutPage?.stat2LabelFr || ''} placeholder="Projets Réalisés" />
                      </div>
                      <div>
                        <Label htmlFor="stat2LabelEn">Label (EN)</Label>
                        <Input id="stat2LabelEn" name="stat2LabelEn" defaultValue={aboutPage?.stat2LabelEn || ''} placeholder="Projects Completed" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat 3 */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistique 3</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="stat3Value">Valeur</Label>
                      <Input id="stat3Value" name="stat3Value" defaultValue={aboutPage?.stat3Value || ''} placeholder="100%" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="stat3LabelFr">Label (FR)</Label>
                        <Input id="stat3LabelFr" name="stat3LabelFr" defaultValue={aboutPage?.stat3LabelFr || ''} placeholder="Clients Satisfaits" />
                      </div>
                      <div>
                        <Label htmlFor="stat3LabelEn">Label (EN)</Label>
                        <Input id="stat3LabelEn" name="stat3LabelEn" defaultValue={aboutPage?.stat3LabelEn || ''} placeholder="Satisfied Clients" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat 4 */}
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistique 4 (optionnel)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="stat4Value">Valeur</Label>
                      <Input id="stat4Value" name="stat4Value" defaultValue={aboutPage?.stat4Value || ''} placeholder="50+" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="stat4LabelFr">Label (FR)</Label>
                        <Input id="stat4LabelFr" name="stat4LabelFr" defaultValue={aboutPage?.stat4LabelFr || ''} placeholder="Partenaires" />
                      </div>
                      <div>
                        <Label htmlFor="stat4LabelEn">Label (EN)</Label>
                        <Input id="stat4LabelEn" name="stat4LabelEn" defaultValue={aboutPage?.stat4LabelEn || ''} placeholder="Partners" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Tab */}
        <TabsContent value="mission" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Section Mission
              </CardTitle>
              <CardDescription>
                Présentez la mission de votre organisation
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
                    <Label htmlFor="missionTitleFr">Titre</Label>
                    <Input id="missionTitleFr" name="missionTitleFr" defaultValue={aboutPage?.missionTitleFr || ''} placeholder="Notre Mission" />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <RichTextEditor
                      value={missionContentFr || aboutPage?.missionContentFr || ''}
                      onChange={setMissionContentFr}
                      placeholder="Décrivez votre mission..."
                      minHeight="200px"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="missionTitleEn">Title</Label>
                    <Input id="missionTitleEn" name="missionTitleEn" defaultValue={aboutPage?.missionTitleEn || ''} placeholder="Our Mission" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                      value={missionContentEn || aboutPage?.missionContentEn || ''}
                      onChange={setMissionContentEn}
                      placeholder="Describe your mission..."
                      minHeight="200px"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Section Valeurs
              </CardTitle>
              <CardDescription>
                Partagez les valeurs de votre organisation
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
                    <Label htmlFor="valuesTitleFr">Titre</Label>
                    <Input id="valuesTitleFr" name="valuesTitleFr" defaultValue={aboutPage?.valuesTitleFr || ''} placeholder="Nos Valeurs" />
                  </div>
                  <div>
                    <Label>Contenu</Label>
                    <RichTextEditor
                      value={valuesContentFr || aboutPage?.valuesContentFr || ''}
                      onChange={setValuesContentFr}
                      placeholder="Décrivez vos valeurs..."
                      minHeight="200px"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="valuesTitleEn">Title</Label>
                    <Input id="valuesTitleEn" name="valuesTitleEn" defaultValue={aboutPage?.valuesTitleEn || ''} placeholder="Our Values" />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                      value={valuesContentEn || aboutPage?.valuesContentEn || ''}
                      onChange={setValuesContentEn}
                      placeholder="Describe your values..."
                      minHeight="200px"
                    />
                  </div>
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
                Section Appel à l'Action
              </CardTitle>
              <CardDescription>
                Un bloc d'appel à l'action pour encourager les visiteurs
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
                    <Input id="ctaTitleFr" name="ctaTitleFr" defaultValue={aboutPage?.ctaTitleFr || ''} placeholder="Prêt à collaborer ?" />
                  </div>
                  <div>
                    <Label htmlFor="ctaSubtitleFr">Sous-titre</Label>
                    <Input id="ctaSubtitleFr" name="ctaSubtitleFr" defaultValue={aboutPage?.ctaSubtitleFr || ''} placeholder="Contactez-nous pour discuter de votre projet" />
                  </div>
                  <div>
                    <Label htmlFor="ctaButtonTextFr">Texte du bouton</Label>
                    <Input id="ctaButtonTextFr" name="ctaButtonTextFr" defaultValue={aboutPage?.ctaButtonTextFr || ''} placeholder="Nous contacter" />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ctaTitleEn">Title</Label>
                    <Input id="ctaTitleEn" name="ctaTitleEn" defaultValue={aboutPage?.ctaTitleEn || ''} placeholder="Ready to collaborate?" />
                  </div>
                  <div>
                    <Label htmlFor="ctaSubtitleEn">Subtitle</Label>
                    <Input id="ctaSubtitleEn" name="ctaSubtitleEn" defaultValue={aboutPage?.ctaSubtitleEn || ''} placeholder="Contact us to discuss your project" />
                  </div>
                  <div>
                    <Label htmlFor="ctaButtonTextEn">Button text</Label>
                    <Input id="ctaButtonTextEn" name="ctaButtonTextEn" defaultValue={aboutPage?.ctaButtonTextEn || ''} placeholder="Contact us" />
                  </div>
                </TabsContent>
              </Tabs>
              <div>
                <Label htmlFor="ctaButtonUrl">URL du bouton</Label>
                <Input id="ctaButtonUrl" name="ctaButtonUrl" defaultValue={aboutPage?.ctaButtonUrl || ''} placeholder="/contact" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Publication Settings */}
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

            {/* Floating Badge Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badge flottant sur l'image
                </CardTitle>
                <CardDescription>
                  Le badge qui apparaît sur l'image hero
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
                      <Input id="floatingBadgeTitleFr" name="floatingBadgeTitleFr" defaultValue={aboutPage?.floatingBadgeTitleFr || ''} placeholder="Excellence Certifiée" />
                    </div>
                    <div>
                      <Label htmlFor="floatingBadgeTextFr">Texte</Label>
                      <Input id="floatingBadgeTextFr" name="floatingBadgeTextFr" defaultValue={aboutPage?.floatingBadgeTextFr || ''} placeholder="Qualité garantie" />
                    </div>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="floatingBadgeTitleEn">Title</Label>
                      <Input id="floatingBadgeTitleEn" name="floatingBadgeTitleEn" defaultValue={aboutPage?.floatingBadgeTitleEn || ''} placeholder="Certified Excellence" />
                    </div>
                    <div>
                      <Label htmlFor="floatingBadgeTextEn">Text</Label>
                      <Input id="floatingBadgeTextEn" name="floatingBadgeTextEn" defaultValue={aboutPage?.floatingBadgeTextEn || ''} placeholder="Quality guaranteed" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Menu Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Affichage dans le menu
                </CardTitle>
                <CardDescription>
                  Paramètres d'affichage dans le sous-menu "Présentation"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Afficher dans le menu</Label>
                    <p className="text-sm text-muted-foreground">
                      Le lien apparaîtra dans le sous-menu "Présentation"
                    </p>
                  </div>
                  <Switch
                    checked={showInMenu}
                    onCheckedChange={setShowInMenu}
                  />
                </div>
                <Tabs defaultValue="fr">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fr">Français</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="menuLabelFr">Label du menu (FR)</Label>
                      <Input id="menuLabelFr" name="menuLabelFr" defaultValue={aboutPage?.menuLabelFr || ''} placeholder="À Propos" />
                    </div>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="menuLabelEn">Menu label (EN)</Label>
                      <Input id="menuLabelEn" name="menuLabelEn" defaultValue={aboutPage?.menuLabelEn || ''} placeholder="About Us" />
                    </div>
                  </TabsContent>
                </Tabs>
                <div>
                  <Label htmlFor="menuOrder">Ordre dans le menu</Label>
                  <Input id="menuOrder" name="menuOrder" type="number" defaultValue={aboutPage?.menuOrder ?? 0} placeholder="0" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Ordre d'affichage (plus petit = premier)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
