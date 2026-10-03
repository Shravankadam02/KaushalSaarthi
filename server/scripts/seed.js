import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Escalation from '../models/Escalation.js';

const CSV_PATH = new URL('../data/sample_students_50.csv', import.meta.url);

const DEMO_USERS = [
  { username: 'admin@demo.com', password: 'demo1234', role: 'admin' },
  { username: 'sanjay.mentor@met.edu', password: 'demo1234', role: 'mentor', mentorCode: 'M001' },
  { username: 'priya.mentor@met.edu', password: 'demo1234', role: 'mentor', mentorCode: 'M002' },
  { username: 'ravi.mentor@met.edu', password: 'demo1234', role: 'mentor', mentorCode: 'M003' },
  { username: 'kavita.mentor@met.edu', password: 'demo1234', role: 'mentor', mentorCode: 'M004' },
  { username: 'anil.mentor@met.edu', password: 'demo1234', role: 'mentor', mentorCode: 'M005' },
  { username: 'ramesh.student@met.edu', password: 'demo1234', role: 'student', studentId: 'IT-2024001' },
];

async function readCsv(path) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Student.deleteMany({});
  await User.deleteMany({});
  await Note.deleteMany({});
  await Escalation.deleteMany({});

  console.log('Loading students from CSV...');
  const rows = await readCsv(CSV_PATH);

  for (const row of rows) {
    await Student.create({
      studentId: row.student_id,
      firstName: row.first_name,
      lastName: row.last_name,
      class: row.class,
      rollNo: row.roll_no,
      department: row.department,
      college: row.college,
      mentorId: row.mentor_id || null,
      attendancePercent: Number(row.attendance_percent),
      feesDueDays: Number(row.fees_due_days),
      attemptsInSubjectX: Number(row.attempts_in_subject_x),
      lastTest1: Number(row.last_test_1),
      lastTest2: Number(row.last_test_2),
      lastTest3: Number(row.last_test_3),
      last3TestsAvg: Number(row.last_3_tests_avg),
      previous3TestsAvg: Number(row.previous_3_tests_avg),
      email: row.email,
      phone: row.phone,
      guardianContact: row.guardian_contact,
      semester: row.semester,
    });
  }
  console.log(`${rows.length} students seeded.`);

  console.log('Creating demo accounts...');
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({
      username: u.username,
      passwordHash,
      role: u.role,
      studentId: u.studentId || null,
      mentorCode: u.mentorCode || null,
    });
  }
  console.log(`${DEMO_USERS.length} demo accounts created.`);

  console.log('\nDemo login credentials (password for all: demo1234):');
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(8)} → ${u.username}`));

  await mongoose.disconnect();
  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});