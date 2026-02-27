import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment download count
    const resource = await db.resource.update({
      where: {
        id,
        deletedAt: null,
        published: true,
      },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: resource.fileUrl,
      fileName: resource.fileName,
    });
  } catch (error) {
    console.error('Error downloading resource:', error);
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    );
  }
}
