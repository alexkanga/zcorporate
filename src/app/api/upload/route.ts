import { NextRequest, NextResponse } from 'next/server';
import { put, del, head } from '@vercel/blob';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Check if we're in production (Vercel) or development
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Check if Vercel Blob is configured
const isVercelBlobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum: 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const folderPath = folder.replace(/^\/+|\/+$/g, '');

    let url: string;
    let storageType: 'vercel-blob' | 'local';

    if (isProduction && isVercelBlobConfigured) {
      // Use Vercel Blob in production with BLOB_READ_WRITE_TOKEN
      console.log('[Upload] Using Vercel Blob storage');
      
      const blob = await put(`${folderPath}/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      url = blob.url;
      storageType = 'vercel-blob';
      
      console.log(`[Upload] File uploaded to Vercel Blob: ${url}`);
    } else {
      // Use local filesystem in development
      console.log('[Upload] Using local filesystem storage');
      
      const publicDir = path.join(process.cwd(), 'public', 'uploads', folderPath);

      // Create directory if it doesn't exist
      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
      }

      const filePath = path.join(publicDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);

      // Return the public URL
      url = `/uploads/${folderPath}/${filename}`;
      storageType = 'local';
      
      console.log(`[Upload] File saved locally: ${filePath}`);
    }

    return NextResponse.json({
      success: true,
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      storageType,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement du fichier';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle DELETE for removing files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL du fichier non fournie' },
        { status: 400 }
      );
    }

    // Determine if it's a Vercel Blob URL or local file
    const isVercelBlobUrl = url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com');

    if (isVercelBlobUrl && isVercelBlobConfigured) {
      // Delete from Vercel Blob
      console.log(`[Upload] Deleting from Vercel Blob: ${url}`);
      
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      console.log('[Upload] File deleted from Vercel Blob');
    } else if (url.startsWith('/uploads/')) {
      // Delete local file
      const filePath = path.join(process.cwd(), 'public', url);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`[Upload] Local file deleted: ${filePath}`);
      } else {
        console.log(`[Upload] Local file not found: ${filePath}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé',
    });
  } catch (error) {
    console.error('[Upload] Delete error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
}

// Handle HEAD request to check if file exists
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL du fichier non fournie' },
        { status: 400 }
      );
    }

    const isVercelBlobUrl = url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com');

    if (isVercelBlobUrl && isVercelBlobConfigured) {
      // Check Vercel Blob
      const blobInfo = await head(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      return NextResponse.json({
        exists: !!blobInfo,
        size: blobInfo?.size,
        uploadedAt: blobInfo?.uploadedAt,
      });
    } else if (url.startsWith('/uploads/')) {
      // Check local file
      const filePath = path.join(process.cwd(), 'public', url);
      const exists = existsSync(filePath);
      
      return NextResponse.json({
        exists,
        path: exists ? url : undefined,
      });
    }

    return NextResponse.json({
      exists: false,
    });
  } catch (error) {
    console.error('[Upload] HEAD error:', error);
    return NextResponse.json(
      { exists: false },
      { status: 200 }
    );
  }
}
