'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, FileText, Briefcase, Calendar, File } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface SearchResult {
  type: 'article' | 'resource' | 'realisation' | 'event';
  id: string;
  slug?: string;
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  fileType?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchContent();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'resource': return <File className="h-4 w-4" />;
      case 'realisation': return <Briefcase className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLink = (result: SearchResult) => {
    switch (result.type) {
      case 'article': return `/blog/${result.slug}`;
      case 'resource': return `/ressources?id=${result.id}`;
      case 'realisation': return `/realisations/${result.id}`;
      case 'event': return `/evenements?id=${result.id}`;
      default: return '#';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return locale === 'fr' ? 'Article' : 'Article';
      case 'resource': return locale === 'fr' ? 'Ressource' : 'Resource';
      case 'realisation': return locale === 'fr' ? 'Réalisation' : 'Project';
      case 'event': return locale === 'fr' ? 'Événement' : 'Event';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
            className="pl-9"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={getTypeLink(result)}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="p-2 bg-muted rounded">{getTypeIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{result.excerpt || getTypeLabel(result.type)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {locale === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
