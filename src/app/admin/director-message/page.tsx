'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { 
  Save, Loader2, Eye, EyeOff, Image, User, FileText, 
  Target, Link2, Settings, Award, MessageSquare
} from 'lucide-react';

interface DirectorMessageData {
  id: string;
  // Hero Section
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string | null;
  heroSubtitleEn: string | null;
  heroBadgeFr: string | null;
  heroBadgeEn: string | null;
  // Director Identity
  directorFirstName: string | null;
  directorLastName: string | null;
  directorCivility: string | null;
  directorPositionFr: string | null;
  directorPositionEn: string | null;
  directorPhotoUrl: string | null;
  directorPhotoAltFr: string | null;
  directorPhotoAltEn: string | null;
  directorSignatureUrl: string | null;
  // Content
  introTextFr: string | null;
  introTextEn: string | null;
  quoteFr: string | null;
  quoteEn: string | null;
  contentFr: string | null;
  contentEn: string | null;
  // Biography
  bioShortFr: string | null;
  bioShortEn: string | null;
  bioLongFr: string | null;
  bioLongEn: string | null;
  directorStartDate: string | null;
  directorExperienceYears: number | null;
  directorSpecialties: string | null;
  directorLinkedInUrl: string | null;
  // Statistics
  showStats: boolean;
  stat1Value: string | null;
  stat1LabelFr: string | null;
  stat1LabelEn: string | null;
  stat2Value: string | null;
  stat2LabelFr: string | null;
  stat2LabelEn: string | null;
  stat3Value: string | null;
  stat3LabelFr: string | null;
  stat3LabelEn: string | null;
  // Key Messages (JSON)
  keyMessagesFr: string | null;
  keyMessagesEn: string | null;
  prioritiesFr: string | null;
  prioritiesEn: string | null;
  // CTA
  cta1TextFr: string | null;
  cta1TextEn: string | null;
  cta1Url: string | null;
  cta2TextFr: string | null;
  cta2TextEn: string | null;
  cta2Url: string | null;
  // Section Visibility
  showHero: boolean;
  showKeyMessages: boolean;
  showPriorities: boolean;
  showBiography: boolean;
  showCta: boolean;
  showNavigation: boolean;
  // Layout
  portraitPosition: string | null;
  // Publication
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export default function DirectorMessageAdmin() {
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  
  // Local states
  const [directorPhotoUrl, setDirectorPhotoUrl] = useState<string>('');
  const [directorSignatureUrl, setDirectorSignatureUrl] = useState<string>('');
  const [contentFr, setContentFr] = useState<string>('');
  const [contentEn, setContentEn] = useState<string>('');
  const [bioLongFr, setBioLongFr] = useState<string>('');
  const [bioLongEn, setBioLongEn] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [showBiography, setShowBiography] = useState<boolean>(true);
  const [showKeyMessages, setShowKeyMessages] = useState<boolean>(true);
  const [showNavigation, setShowNavigation] = useState<boolean>(true);
  const [portraitPosition, setPortraitPosition] = useState<string>('right');
  
  // Key messages as arrays
  const [keyMessagesFrList, setKeyMessagesFrList] = useState<string[]>([]);
  const [keyMessagesEnList, setKeyMessagesEnList] = useState<string[]>([]);
  const [prioritiesFrList, setPrioritiesFrList] = useState<string[]>([]);
  const [prioritiesEnList, setPrioritiesEnList] = useState<string[]>([]);

  const { data: message, isLoading } = useQuery({
    queryKey: ['admin-director-message'],
    queryFn: async () => {
      const res = await fetch('/api/admin/director-message');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<DirectorMessageData>;
    },
  });

  // Initialize form state
  if (message && !initialized) {
    setDirectorPhotoUrl(message.directorPhotoUrl || '');
    setDirectorSignatureUrl(message.directorSignatureUrl || '');
    setContentFr(message.contentFr || '');
    setContentEn(message.contentEn || '');
    setBioLongFr(message.bioLongFr || '');
    setBioLongEn(message.bioLongEn || '');
    setIsPublished(message.published ?? false);
    setShowStats(message.showStats ?? true);
    setShowBiography(message.showBiography ?? true);
    setShowKeyMessages(message.showKeyMessages ?? true);
    setShowNavigation(message.showNavigation ?? true);
    setPortraitPosition(message.portraitPosition || 'right');
    
    // Parse JSON arrays
    try { setKeyMessagesFrList(JSON.parse(message.keyMessagesFr || '[]')); } catch { setKeyMessagesFrList([]); }
    try { setKeyMessagesEnList(JSON.parse(message.keyMessagesEn || '[]')); } catch { setKeyMessagesEnList([]); }
    try { setPrioritiesFrList(JSON.parse(message.prioritiesFr || '[]')); } catch { setPrioritiesFrList([]); }
    try { setPrioritiesEnList(JSON.parse(message.prioritiesEn || '[]')); } catch { setPrioritiesEnList([]); }
    
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<DirectorMessageData>) => {
      const res = await fetch('/api/admin/director-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-director-message'] });
      toast.success('Mot du Directeur mis à jour avec succès');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: Partial<DirectorMessageData> = {
      // Hero
      heroTitleFr: (formData.get('heroTitleFr') as string) || message?.heroTitleFr || 'Mot du Directeur Exécutif',
      heroTitleEn: (formData.get('heroTitleEn') as string) || message?.heroTitleEn || 'Message from the Executive Director',
      heroSubtitleFr: formData.get('heroSubtitleFr') as string || null,
      heroSubtitleEn: formData.get('heroSubtitleEn') as string || null,
      heroBadgeFr: formData.get('heroBadgeFr') as string || null,
      heroBadgeEn: formData.get('heroBadgeEn') as string || null,
      // Director Identity
      directorFirstName: formData.get('directorFirstName') as string || null,
      directorLastName: formData.get('directorLastName') as string || null,
      directorCivility: formData.get('directorCivility') as string || null,
      directorPositionFr: formData.get('directorPositionFr') as string || null,
      directorPositionEn: formData.get('directorPositionEn') as string || null,
      directorPhotoUrl: directorPhotoUrl || null,
      directorPhotoAltFr: formData.get('directorPhotoAltFr') as string || null,
      directorPhotoAltEn: formData.get('directorPhotoAltEn') as string || null,
      directorSignatureUrl: directorSignatureUrl || null,
      // Content
      introTextFr: formData.get('introTextFr') as string || null,
      introTextEn: formData.get('introTextEn') as string || null,
      quoteFr: formData.get('quoteFr') as string || null,
      quoteEn: formData.get('quoteEn') as string || null,
      contentFr: contentFr || null,
      contentEn: contentEn || null,
      // Biography
      bioShortFr: formData.get('bioShortFr') as string || null,
      bioShortEn: formData.get('bioShortEn') as string || null,
      bioLongFr: bioLongFr || null,
      bioLongEn: bioLongEn || null,
      directorStartDate: formData.get('directorStartDate') as string || null,
      directorExperienceYears: parseInt(formData.get('directorExperienceYears') as string) || null,
      directorSpecialties: formData.get('directorSpecialties') as string || null,
      directorLinkedInUrl: formData.get('directorLinkedInUrl') as string || null,
      // Statistics
      showStats: showStats,
      stat1Value: formData.get('stat1Value') as string || null,
      stat1LabelFr: formData.get('stat1LabelFr') as string || null,
      stat1LabelEn: formData.get('stat1LabelEn') as string || null,
      stat2Value: formData.get('stat2Value') as string || null,
      stat2LabelFr: formData.get('stat2LabelFr') as string || null,
      stat2LabelEn: formData.get('stat2LabelEn') as string || null,
      stat3Value: formData.get('stat3Value') as string || null,
      stat3LabelFr: formData.get('stat3LabelFr') as string || null,
      stat3LabelEn: formData.get('stat3LabelEn') as string || null,
      // Key Messages
      keyMessagesFr: JSON.stringify(keyMessagesFrList),
      keyMessagesEn: JSON.stringify(keyMessagesEnList),
      prioritiesFr: JSON.stringify(prioritiesFrList),
      prioritiesEn: JSON.stringify(prioritiesEnList),
      // CTA
      cta1TextFr: formData.get('cta1TextFr') as string || null,
      cta1TextEn: formData.get('cta1TextEn') as string || null,
      cta1Url: formData.get('cta1Url') as string || null,
      cta2TextFr: formData.get('cta2TextFr') as string || null,
      cta2TextEn: formData.get('cta2TextEn') as string || null,
      cta2Url: formData.get('cta2Url') as string || null,
      // Section Visibility
      showHero: true,
      showKeyMessages: showKeyMessages,
      showPriorities: true,
      showBiography: showBiography,
      showCta: true,
      showNavigation: showNavigation,
      // Layout
      portraitPosition: portraitPosition,
      // Publication
      published: isPublished,
      publishedAt: isPublished && !message?.publishedAt ? new Date().toISOString() : message?.publishedAt,
    };

    updateMutation.mutate(data);
  };

  // Helper for key messages lists
  const addItem = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (value.trim()) {
      setList([...list, value.trim()]);
    }
  };
  
  const removeItem = (list: string[], setList: (v: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
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
          <h1 className="text-3xl font-bold">Mot du Directeur</h1>
          <p className="text-muted-foreground">
            Gérez le contenu de la page Mot du Directeur
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {message?.published ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">
              {message?.published ? 'Publiée' : 'Non publiée'}
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

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Directeur</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contenu</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">CTA</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
        </TabsList>

        {/* Director Identity Tab */}
        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Identité du Directeur
              </CardTitle>
              <CardDescription>
                Informations sur le directeur exécutif
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="directorCivility">Civilité</Label>
                      <Input id="directorCivility" name="directorCivility" defaultValue={message?.directorCivility || 'M.'} placeholder="M." />
                    </div>
                    <div>
                      <Label htmlFor="directorFirstName">Prénom</Label>
                      <Input id="directorFirstName" name="directorFirstName" defaultValue={message?.directorFirstName || ''} />
                    </div>
                    <div>
                      <Label htmlFor="directorLastName">Nom</Label>
                      <Input id="directorLastName" name="directorLastName" defaultValue={message?.directorLastName || ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="directorPositionFr">Poste</Label>
                      <Input id="directorPositionFr" name="directorPositionFr" defaultValue={message?.directorPositionFr || ''} placeholder="Directeur Exécutif" />
                    </div>
                    <div>
                      <Label htmlFor="directorPhotoAltFr">Texte alternatif photo</Label>
                      <Input id="directorPhotoAltFr" name="directorPhotoAltFr" defaultValue={message?.directorPhotoAltFr || ''} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="directorPositionEn">Position</Label>
                      <Input id="directorPositionEn" name="directorPositionEn" defaultValue={message?.directorPositionEn || ''} placeholder="Executive Director" />
                    </div>
                    <div>
                      <Label htmlFor="directorPhotoAltEn">Photo alt text</Label>
                      <Input id="directorPhotoAltEn" name="directorPhotoAltEn" defaultValue={message?.directorPhotoAltEn || ''} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  value={directorPhotoUrl}
                  onChange={setDirectorPhotoUrl}
                  folder="director"
                  label="Photo du Directeur"
                  previewClassName="h-64 w-full"
                />
                <ImageUpload
                  value={directorSignatureUrl}
                  onChange={setDirectorSignatureUrl}
                  folder="director"
                  label="Signature (optionnel)"
                  previewClassName="h-32 w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="directorExperienceYears">Années d'expérience</Label>
                  <Input id="directorExperienceYears" name="directorExperienceYears" type="number" defaultValue={message?.directorExperienceYears || ''} placeholder="15" />
                </div>
                <div>
                  <Label htmlFor="directorStartDate">Date de prise de fonction</Label>
                  <Input id="directorStartDate" name="directorStartDate" type="date" defaultValue={message?.directorStartDate ? message.directorStartDate.split('T')[0] : ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="directorLinkedInUrl">LinkedIn URL</Label>
                  <Input id="directorLinkedInUrl" name="directorLinkedInUrl" type="url" defaultValue={message?.directorLinkedInUrl || ''} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <Label htmlFor="directorSpecialties">Spécialités (séparées par des virgules)</Label>
                  <Input id="directorSpecialties" name="directorSpecialties" defaultValue={message?.directorSpecialties || ''} placeholder="Agriculture, Développement, Management" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Section Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroBadgeFr">Badge</Label>
                      <Input id="heroBadgeFr" name="heroBadgeFr" defaultValue={message?.heroBadgeFr || ''} placeholder="Leadership" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleFr">Titre principal</Label>
                      <Input id="heroTitleFr" name="heroTitleFr" defaultValue={message?.heroTitleFr || 'Mot du Directeur Exécutif'} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleFr">Sous-titre</Label>
                    <Input id="heroSubtitleFr" name="heroSubtitleFr" defaultValue={message?.heroSubtitleFr || ''} placeholder="À propos" />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroBadgeEn">Badge</Label>
                      <Input id="heroBadgeEn" name="heroBadgeEn" defaultValue={message?.heroBadgeEn || ''} placeholder="Leadership" />
                    </div>
                    <div>
                      <Label htmlFor="heroTitleEn">Main Title</Label>
                      <Input id="heroTitleEn" name="heroTitleEn" defaultValue={message?.heroTitleEn || 'Message from the Executive Director'} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitleEn">Subtitle</Label>
                    <Input id="heroSubtitleEn" name="heroSubtitleEn" defaultValue={message?.heroSubtitleEn || ''} placeholder="About" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Introduction & Citation</CardTitle>
              <CardDescription>Texte d'introduction et citation mise en avant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4">
                  <div>
                    <Label htmlFor="introTextFr">Texte d'introduction</Label>
                    <Textarea id="introTextFr" name="introTextFr" defaultValue={message?.introTextFr || ''} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="quoteFr">Citation</Label>
                    <Textarea id="quoteFr" name="quoteFr" defaultValue={message?.quoteFr || ''} rows={2} placeholder="Notre mission est de..." />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="introTextEn">Introduction text</Label>
                    <Textarea id="introTextEn" name="introTextEn" defaultValue={message?.introTextEn || ''} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="quoteEn">Quote</Label>
                    <Textarea id="quoteEn" name="quoteEn" defaultValue={message?.quoteEn || ''} rows={2} placeholder="Our mission is to..." />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Complet</CardTitle>
              <CardDescription>Le contenu principal du mot du directeur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr">
                  <RichTextEditor
                    value={contentFr}
                    onChange={setContentFr}
                    placeholder="Rédigez le message complet du directeur..."
                    minHeight="400px"
                  />
                </TabsContent>
                
                <TabsContent value="en">
                  <RichTextEditor
                    value={contentEn}
                    onChange={setContentEn}
                    placeholder="Write the director's full message..."
                    minHeight="400px"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Biographie
              </CardTitle>
              <CardDescription>Biographie du directeur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4">
                  <div>
                    <Label htmlFor="bioShortFr">Biographie courte</Label>
                    <Textarea id="bioShortFr" name="bioShortFr" defaultValue={message?.bioShortFr || ''} rows={2} />
                  </div>
                  <div>
                    <Label>Biographie complète</Label>
                    <RichTextEditor
                      value={bioLongFr}
                      onChange={setBioLongFr}
                      placeholder="Biographie détaillée..."
                      minHeight="200px"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="bioShortEn">Short biography</Label>
                    <Textarea id="bioShortEn" name="bioShortEn" defaultValue={message?.bioShortEn || ''} rows={2} />
                  </div>
                  <div>
                    <Label>Full biography</Label>
                    <RichTextEditor
                      value={bioLongEn}
                      onChange={setBioLongEn}
                      placeholder="Detailed biography..."
                      minHeight="200px"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages Clés</CardTitle>
              <CardDescription>Les points essentiels à retenir</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr">
                  <KeyMessagesList
                    items={keyMessagesFrList}
                    setItems={setKeyMessagesFrList}
                    addItem={addItem}
                    removeItem={removeItem}
                    placeholder="Ajouter un message clé..."
                  />
                </TabsContent>
                
                <TabsContent value="en">
                  <KeyMessagesList
                    items={keyMessagesEnList}
                    setItems={setKeyMessagesEnList}
                    addItem={addItem}
                    removeItem={removeItem}
                    placeholder="Add a key message..."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priorités</CardTitle>
              <CardDescription>Les priorités de l'année</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr">
                  <KeyMessagesList
                    items={prioritiesFrList}
                    setItems={setPrioritiesFrList}
                    addItem={addItem}
                    removeItem={removeItem}
                    placeholder="Ajouter une priorité..."
                  />
                </TabsContent>
                
                <TabsContent value="en">
                  <KeyMessagesList
                    items={prioritiesEnList}
                    setItems={setPrioritiesEnList}
                    addItem={addItem}
                    removeItem={removeItem}
                    placeholder="Add a priority..."
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
              <CardTitle>Statistiques / Chiffres Clés</CardTitle>
              <CardDescription>Les chiffres à afficher sous la photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <Label>Afficher les statistiques</Label>
                <Switch checked={showStats} onCheckedChange={setShowStats} />
              </div>

              {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((num) => (
                    <Card key={num} className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Statistique {num}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor={`stat${num}Value`}>Valeur</Label>
                          <Input id={`stat${num}Value`} name={`stat${num}Value`} defaultValue={message?.[`stat${num}Value` as keyof DirectorMessageData] || ''} placeholder={`${num}0+`} />
                        </div>
                        <div>
                          <Label htmlFor={`stat${num}LabelFr`}>Label (FR)</Label>
                          <Input id={`stat${num}LabelFr`} name={`stat${num}LabelFr`} defaultValue={message?.[`stat${num}LabelFr` as keyof DirectorMessageData] || ''} />
                        </div>
                        <div>
                          <Label htmlFor={`stat${num}LabelEn`}>Label (EN)</Label>
                          <Input id={`stat${num}LabelEn`} name={`stat${num}LabelEn`} defaultValue={message?.[`stat${num}LabelEn` as keyof DirectorMessageData] || ''} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Tab */}
        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Boutons d'Action</CardTitle>
              <CardDescription>Les boutons CTA de la page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bouton 1 (Principal)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta1TextFr">Texte (FR)</Label>
                      <Input id="cta1TextFr" name="cta1TextFr" defaultValue={message?.cta1TextFr || ''} placeholder="Voir notre équipe" />
                    </div>
                    <div>
                      <Label htmlFor="cta1TextEn">Texte (EN)</Label>
                      <Input id="cta1TextEn" name="cta1TextEn" defaultValue={message?.cta1TextEn || ''} placeholder="View our team" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cta1Url">URL</Label>
                    <Input id="cta1Url" name="cta1Url" defaultValue={message?.cta1Url || ''} placeholder="/presentation/notre-equipe" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bouton 2 (Secondaire)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta2TextFr">Texte (FR)</Label>
                      <Input id="cta2TextFr" name="cta2TextFr" defaultValue={message?.cta2TextFr || ''} placeholder="Télécharger le rapport" />
                    </div>
                    <div>
                      <Label htmlFor="cta2TextEn">Texte (EN)</Label>
                      <Input id="cta2TextEn" name="cta2TextEn" defaultValue={message?.cta2TextEn || ''} placeholder="Download report" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cta2Url">URL</Label>
                    <Input id="cta2Url" name="cta2Url" defaultValue={message?.cta2Url || ''} placeholder="/documents/rapport-annuel.pdf" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'Affichage</CardTitle>
              <CardDescription>Contrôlez les sections visibles sur la page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Publiée</Label>
                  <p className="text-sm text-muted-foreground">La page sera visible sur le site</p>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher les statistiques</Label>
                  <p className="text-sm text-muted-foreground">Chiffres clés sous la photo</p>
                </div>
                <Switch checked={showStats} onCheckedChange={setShowStats} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher les messages clés</Label>
                  <p className="text-sm text-muted-foreground">Section synthèse</p>
                </div>
                <Switch checked={showKeyMessages} onCheckedChange={setShowKeyMessages} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher la biographie</Label>
                  <p className="text-sm text-muted-foreground">Section "Le Directeur en bref"</p>
                </div>
                <Switch checked={showBiography} onCheckedChange={setShowBiography} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher la navigation</Label>
                  <p className="text-sm text-muted-foreground">Liens vers pages associées</p>
                </div>
                <Switch checked={showNavigation} onCheckedChange={setShowNavigation} />
              </div>

              <div>
                <Label>Position du portrait</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    type="button"
                    variant={portraitPosition === 'left' ? 'default' : 'outline'}
                    onClick={() => setPortraitPosition('left')}
                    className="cursor-pointer"
                  >
                    Gauche
                  </Button>
                  <Button
                    type="button"
                    variant={portraitPosition === 'right' ? 'default' : 'outline'}
                    onClick={() => setPortraitPosition('right')}
                    className="cursor-pointer"
                  >
                    Droite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

// Component for key messages list
function KeyMessagesList({
  items,
  setItems,
  addItem,
  removeItem,
  placeholder,
}: {
  items: string[];
  setItems: (v: string[]) => void;
  addItem: (list: string[], setList: (v: string[]) => void, value: string) => void;
  removeItem: (list: string[], setList: (v: string[]) => void, index: number) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState('');

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input value={item} readOnly className="flex-1" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeItem(items, setItems, index)}
            className="cursor-pointer"
          >
            ✕
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem(items, setItems, newItem);
              setNewItem('');
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            addItem(items, setItems, newItem);
            setNewItem('');
          }}
          className="cursor-pointer"
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
