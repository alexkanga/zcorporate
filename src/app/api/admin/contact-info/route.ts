import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let info = await db.contactInfo.findUnique({
      where: { id: 'contact-info' },
    });

    if (!info) {
      info = await db.contactInfo.create({
        data: {
          id: 'contact-info',
        },
      });
    }

    return NextResponse.json(info);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('PUT contact-info data:', JSON.stringify(data, null, 2));

    const info = await db.contactInfo.upsert({
      where: { id: 'contact-info' },
      update: data,
      create: { id: 'contact-info', ...data },
    });

    console.log('PUT contact-info result:', JSON.stringify(info, null, 2));
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error updating contact info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
