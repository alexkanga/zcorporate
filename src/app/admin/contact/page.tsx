'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Loader2, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  readAt: string | null;
  replied: boolean;
  repliedAt: string | null;
  replyMessage: string | null;
  createdAt: string;
}

export default function ContactAdminPage() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: async () => { const res = await fetch('/api/admin/contact-messages'); if (!res.ok) throw new Error('Failed'); return res.json(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContactMessage> }) => {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] }); toast.success('Message mis à jour'); },
    onError: () => toast.error('Erreur'),
  });

  const markAsRead = (message: ContactMessage) => {
    if (!message.isRead) {
      updateMutation.mutate({ id: message.id, data: { isRead: true } });
    }
    setSelectedMessage(message);
    setReplyMessage(message.replyMessage || '');
  };

  const sendReply = () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    updateMutation.mutate(
      { id: selectedMessage.id, data: { replyMessage, isRead: true } },
      { onSuccess: () => { setSelectedMessage(null); setReplyMessage(''); } }
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] }); toast.success('Message supprimé'); },
    onError: () => toast.error('Erreur'),
  });

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const unreadCount = messages.filter((m: ContactMessage) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Messages de contact</h1><p className="text-muted-foreground">Gérez les messages reçus via le formulaire de contact {unreadCount > 0 && <span className="text-primary">({unreadCount} non lu{unreadCount > 1 ? 's' : ''})</span>}</p></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Messages ({messages.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {messages.map((message: ContactMessage) => (
                <div
                  key={message.id}
                  onClick={() => markAsRead(message)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedMessage?.id === message.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {!message.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                      <div>
                        <p className="font-medium">{message.name}</p>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {message.replied ? <CheckCircle className="h-4 w-4 text-green-500" /> : message.isRead ? <CheckCircle className="h-4 w-4 text-muted-foreground" /> : <Clock className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                  <p className="text-sm mt-2 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun message</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{selectedMessage ? 'Détail du message' : 'Sélectionnez un message'}</CardTitle></CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nom</Label><p className="text-sm">{selectedMessage.name}</p></div>
                  <div><Label>Email</Label><p className="text-sm">{selectedMessage.email}</p></div>
                  <div><Label>Téléphone</Label><p className="text-sm">{selectedMessage.phone || '-'}</p></div>
                  <div><Label>Date</Label><p className="text-sm">{format(new Date(selectedMessage.createdAt), 'dd/MM/yyyy HH:mm')}</p></div>
                </div>
                <div><Label>Sujet</Label><p className="text-sm">{selectedMessage.subject || '-'}</p></div>
                <div><Label>Message</Label><div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">{selectedMessage.message}</div></div>
                
                {selectedMessage.replied && selectedMessage.replyMessage && (
                  <div><Label>Réponse envoyée</Label><div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">{selectedMessage.replyMessage}</div></div>
                )}

                <div>
                  <Label>Répondre</Label>
                  <Textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={4} placeholder="Écrivez votre réponse..." />
                </div>
                <div className="flex justify-between">
                  <Button variant="destructive" onClick={() => { deleteMutation.mutate(selectedMessage.id); setSelectedMessage(null); }}>Supprimer</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild><a href={`mailto:${selectedMessage.email}`}>Ouvrir email</a></Button>
                    <Button onClick={sendReply} disabled={!replyMessage.trim() || updateMutation.isPending}>
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mb-4" />
                <p>Sélectionnez un message pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
