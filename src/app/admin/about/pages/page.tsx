'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AboutPagesAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pages Présentation</h1>
        <p className="text-muted-foreground">Gérez les sous-pages de la section Présentation</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Construction className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Cette fonctionnalité sera bientôt disponible</p>
        </CardContent>
      </Card>
    </div>
  );
}
