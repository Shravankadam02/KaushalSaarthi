import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Family from '../models/Family.js';
import Trade from '../models/Trade.js';
import Provider from '../models/Provider.js';
import OutcomeStat from '../models/OutcomeStat.js';
import Student from '../models/Student.js';
import Note from '../models/Note.js';
import LegacyOutcomeData from '../models/OutcomeData.js';
import FamilyProfile from '../models/FamilyProfile.js';
import CounsellingSession from '../models/CounsellingSession.js';
import Escalation from '../models/Escalation.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import ObjectionLog from '../models/ObjectionLog.js';
import Notification from '../models/Notification.js';

const districts = ['Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Jalgaon'];
const years = [2023, 2024, 2025];
const sampleSource = 'SAMPLE dataset - replace with MSDE data';

const tradeDefinitions = [
    ['Electrician', 'Electrical', 4, 18000],
    ['Fitter', 'Manufacturing', 4, 17500],
    ['Welder', 'Manufacturing', 3, 16500],
    ['Computer Operator / COPA', 'IT and Office Skills', 3, 16000],
    ['Motor Vehicle Mechanic', 'Automotive', 4, 18500],
    ['Plumber', 'Construction', 3, 15500],
    ['Solar Technician', 'Renewable Energy', 4, 19000],
    ['Tractor / Agri-equipment Mechanic', 'Agriculture', 4, 17500],
    ['Beauty and Wellness', 'Services', 3, 15000],
    ['Healthcare Assistant', 'Healthcare', 4, 17000],
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function seed() {
    await connectDB();

    await Promise.all([
        Trade.deleteMany({}),
        Provider.deleteMany({}),
        OutcomeStat.deleteMany({}),
        Family.deleteMany({}),
        Student.deleteMany({}),
        Note.deleteMany({}),
        LegacyOutcomeData.deleteMany({}),
        FamilyProfile.deleteMany({}),
        CounsellingSession.deleteMany({}),
        Escalation.deleteMany({}),
        ChatSession.deleteMany({}),
        ChatMessage.deleteMany({}),
        ObjectionLog.deleteMany({}),
        Notification.deleteMany({}),
    ]);

    const trades = await Trade.insertMany(
        tradeDefinitions.map(([name, sector, nsqfLevel, baseSalary]) => ({
            tradeId: slugify(name),
            name,
            sector,
            nsqfLevel,
            durationMonths: 12,
            duration: '12 months',
            minEligibility: 'class10',
            eligibility: 'Class 10 or equivalent',
            description: `Practical ${sector.toLowerCase()} training for ${name.toLowerCase()} roles.`,
            jobRoles: [`${name} Technician`, 'Apprentice'],
            progression: 'Course -> job role -> higher skill level -> supervisor -> diploma or own business',
            safetyNotes: { en: 'Use training-centre safety equipment and follow instructor guidance.' },
            socialPerceptionNotes: { en: 'Skilled technical work can lead to stable employment and further study.' },
            furtherEducation: [{ name: 'Diploma through lateral entry', type: 'diploma' }],
            _baseSalary: baseSalary,
        }))
    );

    const providers = districts.flatMap((district, districtIndex) => [
        {
            providerId: `iti-${slugify(district)}`,
            name: `${district} Government ITI`,
            type: 'ITI',
            district,
            state: 'Maharashtra',
            address: `${district} training campus`,
            contactPhone: `0253${String(100000 + districtIndex).slice(-6)}`,
            tradesOffered: trades.slice(0, 6).map((trade) => trade.tradeId),
            fees: 8500,
            verified: false,
        },
        {
            providerId: `skill-${slugify(district)}`,
            name: `${district} Skill Development Centre`,
            type: 'NSDC_partner',
            district,
            state: 'Maharashtra',
            address: `${district} industrial area`,
            contactPhone: `020${String(200000 + districtIndex).slice(-6)}`,
            tradesOffered: trades.slice(4).map((trade) => trade.tradeId),
            fees: 12000,
            verified: false,
        },
    ]);
    await Provider.insertMany(providers);

    const outcomeStats = [];
    for (const trade of trades) {
        const [, , nsqfLevel, baseSalary] = tradeDefinitions.find(([name]) => name === trade.name);
        for (const [districtIndex, district] of districts.entries()) {
            for (const [yearIndex, year] of years.entries()) {
                const placementRatePct = Math.min(90, 58 + nsqfLevel * 5 + ((districtIndex + yearIndex) % 8));
                outcomeStats.push({
                    tradeId: trade.tradeId,
                    district,
                    state: 'Maharashtra',
                    year,
                    batchSize: 35 + ((districtIndex * 7 + yearIndex * 5) % 30),
                    placementRatePct,
                    avgStartingSalaryMonthly: baseSalary + yearIndex * 1000,
                    salaryMin: baseSalary - 2500 + yearIndex * 500,
                    salaryMax: baseSalary + 4500 + yearIndex * 1000,
                    avgSalaryAfter3YrsMonthly: baseSalary + 9000 + yearIndex * 1200,
                    selfEmployedPct: 8 + ((districtIndex + nsqfLevel) % 10),
                    higherStudyPct: 10 + ((yearIndex + nsqfLevel) % 8),
                    source: sampleSource,
                    verified: false,
                    datasetVersion: 'sample-v1',
                });
            }
        }
    }
    await OutcomeStat.insertMany(outcomeStats);

    const families = await Family.insertMany([
        {
            familyId: 'FAM-001', learnerName: 'Aarav Patil', parentName: 'Sunita Patil', phone: '9000000001', district: 'Nashik',
            areaType: 'urban', incomeBracket: '1_3L', learnerEducation: 'class10', learnerInterests: ['electrical'], preferredLanguage: 'mr', consentGiven: true,
        },
        {
            familyId: 'FAM-002', learnerName: 'Meera Shinde', parentName: 'Rajesh Shinde', phone: '9000000002', district: 'Pune',
            areaType: 'semiurban', incomeBracket: '3_6L', learnerEducation: 'class12', learnerInterests: ['computers'], preferredLanguage: 'en', consentGiven: true,
        },
        {
            familyId: 'FAM-003', learnerName: 'Imran Shaikh', parentName: 'Nazia Shaikh', phone: '9000000003', district: 'Nagpur',
            areaType: 'rural', incomeBracket: 'below_1L', learnerEducation: 'class10', learnerInterests: ['vehicles', 'farming-tech'], preferredLanguage: 'hi', consentGiven: true,
        },
    ]);

    const passwordHash = await bcrypt.hash('demo1234', 10);
    await User.deleteMany({ username: { $in: ['admin@msde.demo', 'counsellor1@msde.demo', 'counsellor2@msde.demo', ...families.map((family) => `${family.familyId.toLowerCase()}@demo.local`)] } });
    await User.insertMany([
        { username: 'admin@msde.demo', passwordHash, role: 'admin', languages: ['en', 'mr', 'hi'] },
        { username: 'counsellor1@msde.demo', passwordHash, role: 'counsellor', counsellorCode: 'C001', languages: ['en', 'mr'], districts: ['Nashik', 'Pune', 'Jalgaon'] },
        { username: 'counsellor2@msde.demo', passwordHash, role: 'counsellor', counsellorCode: 'C002', languages: ['en', 'hi'], districts: ['Nagpur', 'Kolhapur', 'Chhatrapati Sambhajinagar'] },
        ...families.map((family) => ({
            username: `${family.familyId.toLowerCase()}@demo.local`, passwordHash, role: 'family', familyId: family.familyId, phone: family.phone,
        })),
    ]);

    console.log(JSON.stringify({ trades: trades.length, providers: providers.length, outcomeStats: outcomeStats.length, families: families.length, demoPassword: 'demo1234' }, null, 2));
    await mongoose.disconnect();
}

seed().catch((error) => {
    console.error('KaushalSaarthi seed failed:', error);
    process.exit(1);
});