/**
 * Populates the database with realistic demo data so the app is fully usable the
 * moment it's run - no manual data entry required.
 *
 * Dates are computed relative to "now" (not hardcoded) so that, whenever this is run
 * (during review, a week from now, whenever), the seeded competitions land in the
 * lifecycle phase they're meant to demonstrate: one currently open for registration
 * (matching the provided design almost field-for-field), one deliberately down to its
 * last spot (for demonstrating/testing the concurrency-safe registration flow), one
 * not yet open, and one fully finished with results announced.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

function daysFromNow(now, days, extraMs = 0) {
  return new Date(now.getTime() + days * DAY + extraMs);
}

/** Creates `count` throwaway seed users and registers them all for `competition`, decrementing spotsLeft to match. */
async function fillSpots(competition, count, labelPrefix) {
  const users = await User.insertMany(
    Array.from({ length: count }, (_, i) => ({
      deviceId: `${labelPrefix}-${i + 1}`,
      displayName: `${labelPrefix.replace(/-/g, ' ')} ${i + 1}`,
    }))
  );

  await Registration.insertMany(
    users.map((u) => ({ competition: competition._id, user: u._id, registeredAt: new Date() }))
  );

  competition.spotsLeft -= count;
  await competition.save();
}

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('Connected. Clearing existing demo data...');

  await Promise.all([
    Registration.deleteMany({}),
    Competition.deleteMany({}),
    User.deleteMany({}),
  ]);

  const now = new Date();

  // --- Competition 3 (created first -> appears oldest/last in default listing): UPCOMING.
  const photography = await Competition.create({
    title: 'Feedants Photography Sprint',
    category: 'Photography',
    tags: ['Photography', 'Multi-Win'],
    hasCertificate: true,
    prizePool: 2000,
    entryFee: 149,
    totalSpots: 50,
    spotsLeft: 50,
    judge: {
      name: 'Arjun Rao',
      title: 'Award-Winning Travel Photographer',
      experienceYears: 10,
      photoUrl: 'https://i.pravatar.cc/150?img=12',
      introVideoUrl: '',
    },
    importantDates: {
      registrationOpensAt: daysFromNow(now, 3),
      registrationDeadline: daysFromNow(now, 10),
      submissionStartsAt: daysFromNow(now, 11),
      submissionEndsAt: daysFromNow(now, 20),
      resultDate: daysFromNow(now, 25),
    },
    previousWinners: [],
    about: 'Capture the world through your lens. Open for all skill levels, submit your best original shot.',
    judgingParameters: 'Composition, originality, technical quality and storytelling.',
    rulesAndEligibility: 'Open worldwide. One entry per participant. Must be your own original work.',
    rewards: [
      { rank: 1, label: '1st Winner', amount: 800 },
      { rank: 2, label: '2nd Winner', amount: 500 },
      { rank: 3, label: '3rd Winner', amount: 300 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payment: { provider: 'Razorpay', refundPolicyUrl: 'https://feedants.example.com/refund-policy' },
    referral: { code: 'REFERRAL456', link: 'https://feedants.example.com/r/referral456', rewardAmount: 10 },
  });

  // --- Competition 2: REGISTRATION_OPEN, deliberately down to its LAST spot.
  // Use this one to demo/test the concurrency-safe registration flow.
  const comedy = await Competition.create({
    title: 'Feedants Standup Comedy Slam',
    category: 'Comedy',
    tags: ['Comedy', 'Single-Win'],
    hasCertificate: true,
    prizePool: 1000,
    entryFee: 49,
    totalSpots: 5,
    spotsLeft: 5,
    judge: {
      name: 'Kabir Sethi',
      title: 'Stand-up Comedian & Writer',
      experienceYears: 8,
      photoUrl: 'https://i.pravatar.cc/150?img=33',
      introVideoUrl: '',
    },
    importantDates: {
      registrationOpensAt: daysFromNow(now, -3),
      registrationDeadline: daysFromNow(now, 2),
      submissionStartsAt: daysFromNow(now, 3),
      submissionEndsAt: daysFromNow(now, 10),
      resultDate: daysFromNow(now, 15),
    },
    previousWinners: [],
    about: 'A 3-minute online open mic. Make us laugh, get judged, win prizes.',
    judgingParameters: 'Originality, timing, audience reaction.',
    rulesAndEligibility: 'Ages 16+. Clean or adult content both welcome (marked accordingly). One submission per participant.',
    rewards: [
      { rank: 1, label: '1st Winner', amount: 600 },
      { rank: 2, label: '2nd Winner', amount: 250 },
      { rank: 3, label: '3rd Winner', amount: 150 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payment: { provider: 'Razorpay', refundPolicyUrl: 'https://feedants.example.com/refund-policy' },
    referral: { code: 'REFERRAL789', link: 'https://feedants.example.com/r/referral789', rewardAmount: 10 },
  });
  await fillSpots(comedy, 4, 'seed-comedy-user'); // -> spotsLeft becomes 1

  // --- Competition 4: everything in the past, RESULTS_ANNOUNCED, fully booked.
  const poetry = await Competition.create({
    title: 'Feedants Poetry Slam — Season 1',
    category: 'Poetry',
    tags: ['Poetry', 'Multi-Win'],
    hasCertificate: true,
    prizePool: 1200,
    entryFee: 79,
    totalSpots: 30,
    spotsLeft: 30,
    judge: {
      name: 'Meera Iyer',
      title: 'Published Poet & Spoken Word Artist',
      experienceYears: 15,
      photoUrl: 'https://i.pravatar.cc/150?img=45',
      introVideoUrl: '',
    },
    importantDates: {
      registrationOpensAt: daysFromNow(now, -60),
      registrationDeadline: daysFromNow(now, -50),
      submissionStartsAt: daysFromNow(now, -55),
      submissionEndsAt: daysFromNow(now, -40),
      resultDate: daysFromNow(now, -10),
    },
    previousWinners: [
      { name: 'Devika Nair', rank: 1, label: '1st Winner', imageUrl: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Rohan Das', rank: 2, label: '2nd Winner', imageUrl: 'https://i.pravatar.cc/150?img=51' },
    ],
    about: 'Season 1 of our online poetry slam, open to poets of all styles and languages.',
    judgingParameters: 'Imagery, rhythm, emotional impact, originality.',
    rulesAndEligibility: 'One original poem per participant, under 3 minutes when read aloud.',
    rewards: [
      { rank: 1, label: '1st Winner', amount: 500 },
      { rank: 2, label: '2nd Winner', amount: 350 },
      { rank: 3, label: '3rd Winner', amount: 200 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payment: { provider: 'Razorpay', refundPolicyUrl: 'https://feedants.example.com/refund-policy' },
    referral: { code: 'REFERRAL321', link: 'https://feedants.example.com/r/referral321', rewardAmount: 10 },
  });
  await fillSpots(poetry, 30, 'seed-poetry-user'); // -> spotsLeft becomes 0

  // --- Competition 1 (created LAST -> newest -> the default competition the mobile
  // app opens into): REGISTRATION_OPEN, closely matching Objective_Page.png.
  const dance = await Competition.create({
    title: 'Feedants Classical Dance',
    category: 'Dance',
    tags: ['Dance', 'Multi-Win'],
    hasCertificate: true,
    prizePool: 1500,
    entryFee: 99,
    totalSpots: 20,
    spotsLeft: 20,
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experienceYears: 12,
      photoUrl: 'https://i.pravatar.cc/150?img=32',
      introVideoUrl: '',
    },
    importantDates: {
      registrationOpensAt: daysFromNow(now, -5),
      registrationDeadline: daysFromNow(now, 1, 6 * HOUR + 28 * MIN),
      submissionStartsAt: daysFromNow(now, -2),
      submissionEndsAt: daysFromNow(now, 10),
      resultDate: daysFromNow(now, 15),
    },
    previousWinners: [
      { name: 'Riya Shah', rank: 1, label: '1st Winner', imageUrl: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Aarav Mehta', rank: 1, label: '1st Winner', imageUrl: 'https://i.pravatar.cc/150?img=13' },
      { name: 'Neha Verma', rank: 2, label: '2nd Winner', imageUrl: 'https://i.pravatar.cc/150?img=9' },
      { name: 'Ishita Chopra', rank: 3, label: '3rd Winner', imageUrl: 'https://i.pravatar.cc/150?img=20' },
    ],
    about:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    judgingParameters: 'Technique, expression (abhinaya), rhythm accuracy, costume & presentation, and originality of choreography.',
    rulesAndEligibility:
      'Open to all age groups, worldwide. One submission per participant. Video must be recorded in a single take, under 5 minutes, in any classical Indian dance style.',
    rewards: [
      { rank: 1, label: '1st Winner', amount: 550 },
      { rank: 2, label: '2nd Winner', amount: 300 },
      { rank: 3, label: '3rd Winner', amount: 240 },
      { rank: 4, label: '4th Winner', amount: 200 },
      { rank: 5, label: '5th Winner', amount: 130 },
      { rank: 6, label: '6th Winner', amount: 80 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payment: {
      provider: 'Razorpay',
      refundPolicyUrl: 'https://feedants.example.com/refund-policy',
      payoutInfoVideoUrl: 'https://feedants.example.com/videos/how-you-get-paid',
    },
    referral: { code: 'REFERRAL123', link: 'https://feedants.com/r/referral123', rewardAmount: 10 },
  });
  await fillSpots(dance, 1, 'seed-dance-user'); // -> spotsLeft becomes 19, "1 / 20 Booked" like the design

  // eslint-disable-next-line no-console
  console.log('\nSeed complete. Competitions created:');
  // eslint-disable-next-line no-console
  console.table(
    [dance, comedy, poetry, photography].map((c) => ({
      title: c.title,
      id: c._id.toString(),
      spotsLeft: c.spotsLeft,
      totalSpots: c.totalSpots,
    }))
  );
  // eslint-disable-next-line no-console
  console.log(
    `\nThe mobile app auto-discovers the most recently created competition (${dance.title}) via GET /api/competitions, so no manual ID copying is needed.\n` +
      `To specifically exercise the concurrency-safe registration flow, use "${comedy.title}" (id: ${comedy._id}), which has exactly 1 spot left.\n`
  );

  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', err);
    process.exit(1);
  });

module.exports = { seed };
