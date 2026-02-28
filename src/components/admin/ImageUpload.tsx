'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Image as ImageIcon, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'images',
  label = 'Image',
  className = '',
  disabled = false,
  showPreview = true,
  previewClassName = 'h-40 w-full',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP, SVG');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximum: 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du téléchargement');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange, disabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="space-y-4">
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? handleButtonClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">
                Téléchargement en cours...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Glissez une image ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP, SVG (max 5MB)
              </p>
            </div>
          )}
        </div>

        {/* URL input (alternative) */}
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Ou entrez l'URL de l'image"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isUploading}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => window.open(value, '_blank')}
              title="Voir l'image"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Preview */}
        {showPreview && value && (
          <div className="relative group">
            <div
              className={`relative overflow-hidden rounded-lg border bg-muted ${previewClassName}`}
            >
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                }}
              />
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for inline use - now with drag and drop
export function ImageUploadCompact({
  value,
  onChange,
  folder = 'images',
  disabled = false,
}: Omit<ImageUploadProps, 'label' | 'showPreview' | 'previewClassName'>) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (disabled) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onChange(data.url);
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          disabled={disabled || isUploading}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Upload...</span>
          </div>
        ) : value ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <ImageIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Image chargée</span>
            <span className="text-xs text-muted-foreground">(cliquer pour changer)</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Glisser ou cliquer pour uploader</span>
          </div>
        )}
      </div>

      {/* URL input as alternative */}
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou entrez l'URL de l'image"
          disabled={disabled}
          className="text-sm"
        />
        {value && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => window.open(value, '_blank')}
              title="Voir l'image"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              title="Supprimer"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Mini preview */}
      {value && (
        <div className="relative rounded-md overflow-hidden border bg-muted h-20">
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}

// Multi-image upload component for galleries
interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  disabled?: boolean;
  maxImages?: number;
}

export function MultiImageUpload({
  value = [],
  onChange,
  folder = 'gallery',
  disabled = false,
  maxImages = 10,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    // Filter valid files
    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Format non supporté`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Fichier trop volumineux (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    if (value.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploadée(s)`);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [folder, value, onChange, disabled, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemoveImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleAddUrl = () => {
    if (newUrl.trim() && value.length < maxImages) {
      onChange([...value, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer',
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Upload en cours...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">
              Glissez des images ou cliquez pour sélectionner
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF, WebP (max 5MB chacun)
            </span>
            {value.length > 0 && (
              <span className="text-xs text-primary mt-1">
                {value.length}/{maxImages} images
              </span>
            )}
          </div>
        )}
      </div>

      {/* URL input */}
      {value.length < maxImages && (
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Ou ajoutez une URL d'image"
            disabled={disabled}
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddUrl}
            disabled={!newUrl.trim() || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image grid preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square group rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.png';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
