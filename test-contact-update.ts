import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('=== Test mise à jour ContactInfo via API ===\n');

  // 1. Connexion avec superadmin (password: SuperAdmin123!)
  console.log('1. Connexion avec superadmin@aaea.com...');
  
  // D'abord obtenir le CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  console.log('CSRF token obtenu');

  // Connexion
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=superadmin%40aaea.com&password=SuperAdmin123%21&csrfToken=${csrfData.csrfToken}`
  });

  const cookies = loginRes.headers.get('set-cookie') || '';
  console.log('Status connexion:', loginRes.status);

  // Extraire les cookies de session
  const sessionCookie = cookies.split(',').find(c => c.includes('next-auth.session-token'));
  
  // 2. Vérifier la session
  console.log('\n2. Vérification session...');
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: sessionCookie ? { 'Cookie': sessionCookie.split(';')[0].trim() } : {}
  });
  const session = await sessionRes.json();
  console.log('Session:', JSON.stringify(session, null, 2));

  if (!session?.user) {
    console.log('❌ Échec de connexion');
    return;
  }

  // 3. Lire les données actuelles
  console.log('\n3. Lecture ContactInfo actuel...');
  const getRes = await fetch(`${BASE_URL}/api/admin/contact-info`, {
    headers: { 'Cookie': sessionCookie.split(';')[0].trim() }
  });
  const currentData = await getRes.json();
  console.log('Données actuelles:', JSON.stringify(currentData, null, 2));

  // 4. Mise à jour avec emailTo = kalexane@yahoo.fr
  console.log('\n4. Mise à jour avec emailTo = kalexane@yahoo.fr...');
  const updateRes = await fetch(`${BASE_URL}/api/admin/contact-info`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie.split(';')[0].trim()
    },
    body: JSON.stringify({
      titleFr: 'Contactez-nous',
      titleEn: 'Contact us',
      descriptionFr: 'Nous sommes à votre disposition pour répondre à toutes vos questions.',
      descriptionEn: 'We are at your disposal to answer all your questions.',
      address: 'Riviera 2, Bureau Annexe AFWASA, AAEA, Abidjan, Côte d\'Ivoire',
      email: 'contact@aaea.org',
      phone: '+225 07 00 00 00 00',
      phone2: '+225 07 00 00 00 01',
      workingHoursFr: 'Lundi - Vendredi: 8h00 - 17h00',
      workingHoursEn: 'Monday - Friday: 8:00 AM - 5:00 PM',
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127066.36867947827!2d-4.02849795!3d5.3397184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ebea7b5c2c3f%3A0x3a3e3a3a3a3a3a3a!2sRiviera%202%2C%20Abidjan%2C%20C%C3%B4te%20d'Ivoire!5e0!3m2!1sfr!2sfr!4v1708900000000!5m2!1sfr!2sfr",
      emailTo: 'kalexane@yahoo.fr',
      emailCc1: null,
      emailCc2: null,
      emailBcc: null,
    })
  });

  console.log('Status mise à jour:', updateRes.status);
  const updateData = await updateRes.json();
  console.log('Réponse:', JSON.stringify(updateData, null, 2));

  if (updateRes.ok) {
    console.log('\n✅ Mise à jour réussie!');
  } else {
    console.log('\n❌ Échec de la mise à jour');
  }
}

main().catch(console.error);
