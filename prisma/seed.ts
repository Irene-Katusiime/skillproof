// Database Seed Script for Development/Testing
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test workers
  const worker1 = await prisma.worker.upsert({
    where: { phone: '+256700000001' },
    update: {},
    create: {
      phone: '+256700000001',
      name: 'Amina Nakato',
      email: 'amina@example.com',
    },
  });

  const worker2 = await prisma.worker.upsert({
    where: { phone: '+256700000002' },
    update: {},
    create: {
      phone: '+256700000002',
      name: 'David Okello',
      email: 'david@example.com',
    },
  });

  console.log('✅ Created test workers:', { worker1: worker1.phone, worker2: worker2.phone });

  // Create sample skill records with verification
  const skillRecord1 = await prisma.skillRecord.create({
    data: {
      workerId: worker1.id,
      audioUrl: 'https://example.com/audio/sample1.mp3',
      audioHash: crypto.createHash('sha256').update('sample_audio_1').digest('hex'),
      transcription: 'I am Amina, I have been making handmade baskets for 5 years...',
      skills: [
        {
          skillName: 'Basket Weaving',
          category: 'Handicrafts',
          level: 'advanced',
          yearsExperience: 5,
          description: 'Traditional Ugandan basket weaving with banana fibers',
        },
        {
          skillName: 'Quality Control',
          category: 'Manufacturing',
          level: 'intermediate',
          yearsExperience: 3,
        },
      ],
      clientPhone: '+256700000100',
      clientName: 'Sarah Mukasa',
      verificationStatus: 'verified',
      sha256Hash: crypto
        .createHash('sha256')
        .update(`worker1_audio1_${Date.now()}`)
        .digest('hex'),
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created skill record 1:', skillRecord1.id);

  // Create hash ledger for record 1
  await prisma.hashLedger.create({
    data: {
      recordId: skillRecord1.id,
      sha256Hash: skillRecord1.sha256Hash,
      audioHash: skillRecord1.audioHash,
      metadataHash: crypto.createHash('sha256').update('metadata1').digest('hex'),
      verificationUrl: `http://localhost:3000/api/verify/${skillRecord1.sha256Hash}`,
      qrCodeUrl: `http://localhost:3000/qr/${skillRecord1.sha256Hash}.png`,
    },
  });

  // Create photo evidence
  await prisma.photoEvidence.create({
    data: {
      recordId: skillRecord1.id,
      photoUrl: 'https://example.com/photos/basket1.jpg',
      thumbnailUrl: 'https://example.com/photos/basket1_thumb.jpg',
      hasEXIF: true,
      cameraMake: 'Samsung',
      cameraModel: 'Galaxy A12',
      capturedAt: new Date('2026-09-01'),
      latitude: 0.3136,
      longitude: 32.5811,
      width: 1920,
      height: 1080,
      pHash: 'abc123def456',
      validityScore: 0.95,
      analyzedAt: new Date(),
    },
  });

  // Create SMS verification
  await prisma.sMSVerification.create({
    data: {
      recordId: skillRecord1.id,
      clientPhone: '+256700000100',
      messageId: 'ATSms_test123',
      messageContent: 'Hi Sarah, did Amina complete basket weaving work for you? Reply YES/NO',
      status: 'confirmed',
      confirmationCode: '1234',
      clientResponse: 'YES',
      responseMethod: 'sms',
      sentAt: new Date('2026-09-01T10:00:00Z'),
      deliveredAt: new Date('2026-09-01T10:00:05Z'),
      respondedAt: new Date('2026-09-01T10:15:00Z'),
    },
  });

  // Create trust metrics for worker 1
  await prisma.trustMetrics.create({
    data: {
      workerId: worker1.id,
      totalRecords: 1,
      verifiedRecords: 1,
      pendingRecords: 0,
      failedRecords: 0,
      verificationRatio: 1.0,
      smsConfirmationRatio: 1.0,
      photoValidityAvg: 0.95,
      trustTier: 'silver',
      trustScore: 85.5,
      volumeScore: 15.0,
      verificationScore: 35.0,
      validityScore: 19.0,
      repeatClientScore: 10.0,
    },
  });

  // Create second skill record (pending)
  const skillRecord2 = await prisma.skillRecord.create({
    data: {
      workerId: worker2.id,
      audioUrl: 'https://example.com/audio/sample2.mp3',
      audioHash: crypto.createHash('sha256').update('sample_audio_2').digest('hex'),
      transcription: 'My name is David, I repair motorcycles and bicycles...',
      skills: [
        {
          skillName: 'Motorcycle Repair',
          category: 'Automotive',
          level: 'expert',
          yearsExperience: 8,
          description: 'Complete engine overhaul and electrical systems',
        },
      ],
      clientPhone: '+256700000200',
      verificationStatus: 'pending',
      sha256Hash: crypto
        .createHash('sha256')
        .update(`worker2_audio1_${Date.now()}`)
        .digest('hex'),
    },
  });

  console.log('✅ Created skill record 2:', skillRecord2.id);

  // Create hash ledger for record 2
  await prisma.hashLedger.create({
    data: {
      recordId: skillRecord2.id,
      sha256Hash: skillRecord2.sha256Hash,
      audioHash: skillRecord2.audioHash,
      metadataHash: crypto.createHash('sha256').update('metadata2').digest('hex'),
      verificationUrl: `http://localhost:3000/api/verify/${skillRecord2.sha256Hash}`,
    },
  });

  // Create trust metrics for worker 2
  await prisma.trustMetrics.create({
    data: {
      workerId: worker2.id,
      totalRecords: 1,
      verifiedRecords: 0,
      pendingRecords: 1,
      failedRecords: 0,
      verificationRatio: 0.0,
      smsConfirmationRatio: 0.0,
      photoValidityAvg: 0.0,
      trustTier: 'bronze',
      trustScore: 25.0,
      volumeScore: 10.0,
      verificationScore: 0.0,
      validityScore: 0.0,
      repeatClientScore: 0.0,
    },
  });

  // Create client confirmation
  await prisma.clientConfirmation.create({
    data: {
      clientPhone: '+256700000100',
      workerPhone: worker1.phone,
      confirmationType: 'sms',
      confirmed: true,
      rating: 5,
      feedback: 'Excellent work! Very professional and on time.',
      relatedRecordIds: [skillRecord1.id],
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log('   - 2 Workers');
  console.log('   - 2 Skill Records (1 verified, 1 pending)');
  console.log('   - 2 Hash Ledgers');
  console.log('   - 1 Photo Evidence');
  console.log('   - 1 SMS Verification');
  console.log('   - 2 Trust Metrics');
  console.log('   - 1 Client Confirmation');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
