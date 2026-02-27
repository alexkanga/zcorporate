'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ContactInfo {
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
}

async function fetchContactInfo() {
  const response = await fetch('/api/contact');
  const data = await response.json();
  return data;
}

async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to send message');
  }
  return result;
}

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const locale = useLocale() as 'fr' | 'en';
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contact-info'],
    queryFn: fetchContactInfo,
  });

  const contactInfo: ContactInfo | null = data?.data;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  const getTitle = () =>
    contactInfo
      ? locale === 'fr'
        ? contactInfo.titleFr || 'Contactez-nous'
        : contactInfo.titleEn || 'Contact us'
      : locale === 'fr'
        ? 'Contactez-nous'
        : 'Contact us';

  const getDescription = () =>
    contactInfo
      ? locale === 'fr'
        ? contactInfo.descriptionFr
        : contactInfo.descriptionEn
      : null;

  const getWorkingHours = () =>
    contactInfo
      ? locale === 'fr'
        ? contactInfo.workingHoursFr
        : contactInfo.workingHoursEn
      : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-background to-[var(--color-secondary)]/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              {locale === 'fr' ? 'Contact' : 'Contact'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {getTitle()}
            </h1>
            {getDescription() && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {getDescription()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Skeleton className="h-80 w-full" />
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <>
                {/* Map and Contact Info Row */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Map - Left Side */}
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">
                      {locale === 'fr' ? 'Notre localisation' : 'Our location'}
                    </h2>
                    <div className="flex-1 min-h-[400px]">
                      {contactInfo?.mapEmbedUrl ? (
                        <div className="h-full rounded-lg overflow-hidden border shadow-sm">
                          <iframe
                            src={contactInfo.mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location map"
                          />
                        </div>
                      ) : (
                        <Card className="h-full flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              {locale === 'fr'
                                ? 'Carte non disponible'
                                : 'Map not available'}
                            </p>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Contact Info - Right Side */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">
                      {locale === 'fr' ? 'Informations de contact' : 'Contact information'}
                    </h2>
                    <div className="space-y-4">
                      {/* Address */}
                      {contactInfo?.address && (
                        <Card>
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">
                                {locale === 'fr' ? 'Adresse' : 'Address'}
                              </h3>
                              <p className="text-muted-foreground">
                                {contactInfo.address}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Phone Numbers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {contactInfo?.phone && (
                          <Card>
                            <CardContent className="p-4 flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-[var(--color-primary)]" />
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">
                                  {locale === 'fr' ? 'Téléphone' : 'Phone'}
                                </h3>
                                <a
                                  href={`tel:${contactInfo.phone}`}
                                  className="text-muted-foreground hover:text-[var(--color-primary)] transition-colors"
                                >
                                  {contactInfo.phone}
                                </a>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {contactInfo?.phone2 && (
                          <Card>
                            <CardContent className="p-4 flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-[var(--color-secondary)]" />
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">
                                  {locale === 'fr' ? 'Téléphone 2' : 'Phone 2'}
                                </h3>
                                <a
                                  href={`tel:${contactInfo.phone2}`}
                                  className="text-muted-foreground hover:text-[var(--color-secondary)] transition-colors"
                                >
                                  {contactInfo.phone2}
                                </a>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Email */}
                      {contactInfo?.email && (
                        <Card>
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">Email</h3>
                              <a
                                href={`mailto:${contactInfo.email}`}
                                className="text-muted-foreground hover:text-[var(--color-primary)] transition-colors"
                              >
                                {contactInfo.email}
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Working Hours */}
                      {getWorkingHours() && (
                        <Card>
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">
                                {locale === 'fr' ? 'Horaires d\'ouverture' : 'Opening hours'}
                              </h3>
                              <p className="text-muted-foreground">
                                {getWorkingHours()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Form - Below */}
                <div>
                  <h2 className="text-xl font-bold mb-6 text-center text-[var(--color-primary)]">
                    {locale === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}
                  </h2>

                  {submitted ? (
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                      <CardContent className="p-6 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
                          {locale === 'fr' ? 'Message envoyé !' : 'Message sent!'}
                        </h3>
                        <p className="text-green-600 dark:text-green-500">
                          {locale === 'fr'
                            ? 'Nous vous répondrons dans les plus brefs délais.'
                            : 'We will get back to you as soon as possible.'}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setSubmitted(false)}
                        >
                          {locale === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        {mutation.isError && (
                          <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {locale === 'fr'
                                ? 'Une erreur est survenue. Veuillez réessayer.'
                                : 'An error occurred. Please try again.'}
                            </AlertDescription>
                          </Alert>
                        )}

                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {locale === 'fr' ? 'Nom complet' : 'Full name'} *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {locale === 'fr' ? 'Email' : 'Email'} *
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {locale === 'fr' ? 'Téléphone' : 'Phone'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={locale === 'fr' ? '+33 6 00 00 00 00' : '+1 234 567 890'}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {locale === 'fr' ? 'Sujet' : 'Subject'}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={locale === 'fr' ? 'Objet de votre message' : 'Message subject'}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {locale === 'fr' ? 'Message' : 'Message'} *
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={locale === 'fr' ? 'Votre message...' : 'Your message...'}
                                      rows={5}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
                              disabled={mutation.isPending}
                            >
                              {mutation.isPending ? (
                                <>
                                  <span className="animate-spin mr-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                  </span>
                                  {locale === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  {locale === 'fr' ? 'Envoyer le message' : 'Send message'}
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
