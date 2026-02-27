import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer transporter if SMTP is configured
const getTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

// GET - Get contact info
export async function GET() {
  try {
    const contactInfo = await db.contactInfo.findUnique({
      where: { id: 'contact-info' },
    });

    return NextResponse.json({
      data: contactInfo,
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, subject, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Save to database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });

    // Get contact info for email settings
    const contactInfo = await db.contactInfo.findUnique({
      where: { id: 'contact-info' },
    });

    // Get site settings for site name
    const settings = await db.siteSettings.findUnique({
      where: { id: 'site-settings' },
    });

    const siteName = settings?.siteNameFr || 'AAEA';

    // Build email recipients
    // Primary recipient (required) - fallback to default if not set
    const toEmail = contactInfo?.emailTo || 'kalexane@gmail.com';
    
    // Build CC list (optional)
    const ccEmails: string[] = [];
    if (contactInfo?.emailCc1 && contactInfo.emailCc1.trim()) {
      ccEmails.push(contactInfo.emailCc1.trim());
    }
    if (contactInfo?.emailCc2 && contactInfo.emailCc2.trim()) {
      ccEmails.push(contactInfo.emailCc2.trim());
    }

    // BCC (optional)
    const bccEmail = contactInfo?.emailBcc && contactInfo.emailBcc.trim() 
      ? contactInfo.emailBcc.trim() 
      : undefined;

    // Send email notification
    const emailHtml = `
      <h2>Nouveau message de contact - ${siteName}</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
      ${subject ? `<p><strong>Sujet:</strong> ${subject}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr />
      <p style="color: #666; font-size: 12px;">Ce message a été envoyé via le formulaire de contact de ${siteName}</p>
    `;

    let emailSent = false;

    // Try Resend first
    if (resend && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: toEmail,
          cc: ccEmails.length > 0 ? ccEmails : undefined,
          bcc: bccEmail,
          subject: `[${siteName}] Nouveau message de ${name}`,
          html: emailHtml,
          replyTo: email,
        });
        emailSent = true;
        console.log('Email sent via Resend to:', toEmail, ccEmails.length > 0 ? `CC: ${ccEmails.join(', ')}` : '', bccEmail ? `BCC: ${bccEmail}` : '');
      } catch (error) {
        console.error('Resend error:', error);
      }
    }

    // Fallback to Nodemailer
    if (!emailSent) {
      const transporter = getTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: toEmail,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            bcc: bccEmail,
            subject: `[${siteName}] Nouveau message de ${name}`,
            html: emailHtml,
            replyTo: email,
          });
          emailSent = true;
          console.log('Email sent via Nodemailer to:', toEmail);
        } catch (error) {
          console.error('Nodemailer error:', error);
        }
      }
    }

    if (!emailSent) {
      console.warn('No email service configured. Message saved to database only.');
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      id: contactMessage.id,
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
