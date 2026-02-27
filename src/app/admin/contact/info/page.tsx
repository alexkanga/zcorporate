'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2, MapPin, ExternalLink, Mail } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ContactInfo {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  workingHoursFr: string | null;
  workingHoursEn: string | null;
  mapEmbedUrl: string | null;
  emailTo: string | null;
  emailCc1: string | null;
  emailCc2: string | null;
  emailBcc: string | null;
}

const defaultFormData = {
  emailTo: 'kalexane@yahoo.fr',
  emailCc1: '',
  emailCc2: '',
  emailBcc: '',
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  address: '',
  email: '',
  phone: '',
  phone2: '',
  workingHoursFr: '',
  workingHoursEn: '',
  mapEmbedUrl: '',
};

export default function ContactInfoAdminPage() {
  const queryClient = useQueryClient();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Partial<typeof defaultFormData>>({});

  const { data: info, isLoading } = useQuery({
    queryKey: ['admin-contact-info'],
    queryFn: async () => {
      const res = await fetch('/api/admin/contact-info');
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<ContactInfo>;
    },
  });

  // Merge server data with local edits
  const formData = useMemo(() => {
    if (!info) return defaultFormData;
    return {
      emailTo: localEdits.emailTo ?? info.emailTo ?? 'kalexane@yahoo.fr',
      emailCc1: localEdits.emailCc1 ?? info.emailCc1 ?? '',
      emailCc2: localEdits.emailCc2 ?? info.emailCc2 ?? '',
      emailBcc: localEdits.emailBcc ?? info.emailBcc ?? '',
      titleFr: localEdits.titleFr ?? info.titleFr ?? '',
      titleEn: localEdits.titleEn ?? info.titleEn ?? '',
      descriptionFr: localEdits.descriptionFr ?? info.descriptionFr ?? '',
      descriptionEn: localEdits.descriptionEn ?? info.descriptionEn ?? '',
      address: localEdits.address ?? info.address ?? '',
      email: localEdits.email ?? info.email ?? '',
      phone: localEdits.phone ?? info.phone ?? '',
      phone2: localEdits.phone2 ?? info.phone2 ?? '',
      workingHoursFr: localEdits.workingHoursFr ?? info.workingHoursFr ?? '',
      workingHoursEn: localEdits.workingHoursEn ?? info.workingHoursEn ?? '',
      mapEmbedUrl: localEdits.mapEmbedUrl ?? info.mapEmbedUrl ?? '',
    };
  }, [info, localEdits]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ContactInfo>) => {
      const res = await fetch('/api/admin/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-info'] });
      setLocalEdits({});
      toast.success('Informations de contact mises à jour');
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(error.message || 'Erreur');
    },
  });

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalEdits(prev => ({ ...prev, [field]: value }));
    if (emailError) setEmailError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Validate emailTo (required)
    if (!formData.emailTo || !formData.emailTo.trim()) {
      setEmailError('L\'adresse email destinataire est obligatoire');
      return;
    }
    if (!validateEmail(formData.emailTo)) {
      setEmailError('L\'adresse email destinataire n\'est pas valide');
      return;
    }

    // Validate optional emails
    if (formData.emailCc1 && !validateEmail(formData.emailCc1)) {
      setEmailError('L\'adresse email CC 1 n\'est pas valide');
      return;
    }
    if (formData.emailCc2 && !validateEmail(formData.emailCc2)) {
      setEmailError('L\'adresse email CC 2 n\'est pas valide');
      return;
    }
    if (formData.emailBcc && !validateEmail(formData.emailBcc)) {
      setEmailError('L\'adresse email BCC n\'est pas valide');
      return;
    }

    setEmailError(null);

    updateMutation.mutate({
      titleFr: formData.titleFr,
      titleEn: formData.titleEn,
      descriptionFr: formData.descriptionFr,
      descriptionEn: formData.descriptionEn,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      phone2: formData.phone2,
      workingHoursFr: formData.workingHoursFr,
      workingHoursEn: formData.workingHoursEn,
      mapEmbedUrl: formData.mapEmbedUrl,
      emailTo: formData.emailTo,
      emailCc1: formData.emailCc1 || null,
      emailCc2: formData.emailCc2 || null,
      emailBcc: formData.emailBcc || null,
    });
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Informations de contact</h1>
        <p className="text-muted-foreground">Modifiez les informations de contact affichées sur le site</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Email Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuration des notifications email
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configurez les adresses email qui recevront les messages du formulaire de contact
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  {emailError}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="emailTo">
                    Destinataire principal <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="emailTo" 
                    type="email" 
                    required
                    value={formData.emailTo}
                    onChange={(e) => handleInputChange('emailTo', e.target.value)}
                    placeholder="destinataire@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Adresse obligatoire qui recevra les messages</p>
                </div>
                <div>
                  <Label htmlFor="emailCc1">Copie carbone (CC) 1</Label>
                  <Input 
                    id="emailCc1" 
                    type="email" 
                    value={formData.emailCc1}
                    onChange={(e) => handleInputChange('emailCc1', e.target.value)}
                    placeholder="cc1@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Première adresse en copie (optionnel)</p>
                </div>
                <div>
                  <Label htmlFor="emailCc2">Copie carbone (CC) 2</Label>
                  <Input 
                    id="emailCc2" 
                    type="email" 
                    value={formData.emailCc2}
                    onChange={(e) => handleInputChange('emailCc2', e.target.value)}
                    placeholder="cc2@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Deuxième adresse en copie (optionnel)</p>
                </div>
                <div>
                  <Label htmlFor="emailBcc">Copie cachée (BCC)</Label>
                  <Input 
                    id="emailBcc" 
                    type="email" 
                    value={formData.emailBcc}
                    onChange={(e) => handleInputChange('emailBcc', e.target.value)}
                    placeholder="bcc@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Adresse en copie cachée (optionnel)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Coordinates */}
          <Card>
            <CardHeader><CardTitle>Coordonnées</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="titleFr">Titre</Label>
                    <Input 
                      id="titleFr" 
                      value={formData.titleFr}
                      onChange={(e) => handleInputChange('titleFr', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionFr">Description</Label>
                    <Input 
                      id="descriptionFr" 
                      value={formData.descriptionFr}
                      onChange={(e) => handleInputChange('descriptionFr', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingHoursFr">Heures d&apos;ouverture</Label>
                    <Input 
                      id="workingHoursFr" 
                      value={formData.workingHoursFr}
                      onChange={(e) => handleInputChange('workingHoursFr', e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="titleEn">Title</Label>
                    <Input 
                      id="titleEn" 
                      value={formData.titleEn}
                      onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionEn">Description</Label>
                    <Input 
                      id="descriptionEn" 
                      value={formData.descriptionEn}
                      onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingHoursEn">Working hours</Label>
                    <Input 
                      id="workingHoursEn" 
                      value={formData.workingHoursEn}
                      onChange={(e) => handleInputChange('workingHoursEn', e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email public</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone principal</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">Téléphone secondaire</Label>
                  <Input 
                    id="phone2" 
                    value={formData.phone2}
                    onChange={(e) => handleInputChange('phone2', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Maps */}
          <Card>
            <CardHeader><CardTitle>Carte Google Maps</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mapEmbedUrl">URL d&apos;intégration Google Maps</Label>
                <Input 
                  id="mapEmbedUrl" 
                  value={formData.mapEmbedUrl}
                  onChange={(e) => handleInputChange('mapEmbedUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..." 
                />
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Comment obtenir l&apos;URL :</strong>
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 mt-1">
                  <li>Allez sur <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">Google Maps <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Recherchez votre adresse</li>
                  <li>Cliquez sur <strong>Partager</strong> → <strong>Intégrer une carte</strong></li>
                  <li>Copiez l&apos;URL depuis <code className="bg-muted px-1 rounded">src="..."</code> dans le code HTML</li>
                </ol>
              </div>

              {/* Map Preview */}
              {formData.mapEmbedUrl && (
                <div className="mt-4">
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Aperçu de la carte
                  </Label>
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src={formData.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map preview"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
