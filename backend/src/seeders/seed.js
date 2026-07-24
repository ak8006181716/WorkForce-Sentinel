import mongoose from 'mongoose';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/env.js';
import User from '../models/user.model.js';
import Site from '../models/site.model.js';
import Worker from '../models/worker.model.js';
import Violation from '../models/violation.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongodbUri);

    await Promise.all([
      User.deleteMany({}),
      Site.deleteMany({}),
      Worker.deleteMany({}),
      Violation.deleteMany({}),
    ]);

    const sites = await Site.create([
      { name: 'Apex Construction Hub', code: 'APEX-01', location: 'Downtown Sector 4', description: 'Commercial High-Rise' },
      { name: 'Titan Energy Refinery', code: 'TITAN-02', location: 'Industrial Zone B', description: 'Plant Expansion' },
      { name: 'Vanguard Infra Tunnel', code: 'VANG-03', location: 'East Highway Route', description: 'Metro Tunneling Operation' },
    ]);

    const siteIds = sites.map((s) => s._id);
    const siteMap = {};
    sites.forEach((s) => (siteMap[s.code] = s._id));

    await User.create({
      name: 'Admin User',
      email: 'admin@workforce.com',
      password: 'Password123!',
      role: 'ADMIN',
    });

    const supervisors = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@workforce.com',
        password: 'Password123!',
        role: 'SUPERVISOR',
        siteId: siteMap['APEX-01'],
      },
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@workforce.com',
        password: 'Password123!',
        role: 'SUPERVISOR',
        siteId: siteMap['TITAN-02'],
      },
      {
        name: 'Michael Scott',
        email: 'michael.scott@workforce.com',
        password: 'Password123!',
        role: 'SUPERVISOR',
        siteId: siteMap['VANG-03'],
      },
    ]);

    const primaryPath = path.join(__dirname, '../../data/workers_dataset.xlsx');
    const fallbackPath = 'C:\\Users\\ankit\\Downloads\\workers_dataset.xlsx';
    const excelPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const workerDocs = excelRows.map((row, index) => ({
      employeeId: row['Worker ID'] ? String(row['Worker ID']).trim() : `WRK${String(index + 1).padStart(4, '0')}`,
      name: row['Name'] ? String(row['Name']).trim() : `Worker ${index + 1}`,
      siteId: siteIds[index % siteIds.length],
      iotDeviceId: `IOT-${row['Worker ID'] || index + 1000}`,
      jobProfile: row['Job Profile'] ? String(row['Job Profile']).trim() : 'Operator',
      trade: row['Job Profile'] ? String(row['Job Profile']).trim() : 'GENERAL_CONSTRUCTION',
      department: row['Department'] ? String(row['Department']).trim() : 'Operations',
      mobileNumber: row['Mobile Number'] ? String(row['Mobile Number']).trim() : '',
      aadharNumber: row['Aadhar Number'] ? String(row['Aadhar Number']).trim() : '',
      status: 'ACTIVE',
    }));

    const createdWorkers = await Worker.create(workerDocs);
    console.log(`Loaded ${createdWorkers.length} workers from dataset.`);

    const now = new Date();
    const realisticNotes = [
      'Hardhat removed near crane operation area',
      'High-viz jacket missing during evening shift',
      'Safety glasses unequipped during grinding work',
      'Harness unhooked while working on scaffolding',
      'Steel-toe boots missing in active work zone',
      'Safety gloves removed near hot piping',
      'Ear protection missing near generator unit',
    ];

    const ppeTypes = ['HELMET', 'VEST', 'GLOVES', 'SAFETY_GLASSES', 'BOOTS', 'HARNESS'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const sampleViolations = [
      {
        workerId: createdWorkers[0]._id,
        siteId: createdWorkers[0].siteId,
        ppeType: 'HELMET',
        severity: 'HIGH',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000),
        status: 'PENDING',
        notes: 'Hardhat removed near crane zone',
      },
      {
        workerId: createdWorkers[1]._id,
        siteId: createdWorkers[1].siteId,
        ppeType: 'VEST',
        severity: 'MEDIUM',
        timestamp: new Date(now.getTime() - 4 * 60 * 1000),
        status: 'PENDING',
        notes: 'High-viz vest missing in tunnel section',
      },
      {
        workerId: createdWorkers[2]._id,
        siteId: createdWorkers[2].siteId,
        ppeType: 'SAFETY_GLASSES',
        severity: 'CRITICAL',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
        status: 'ESCALATED',
        escalatedToAdminAt: new Date(now.getTime() - 5 * 60 * 1000),
        notes: 'Eye protection missing during metal cutting',
      },
      {
        workerId: createdWorkers[3]._id,
        siteId: createdWorkers[3].siteId,
        ppeType: 'HARNESS',
        severity: 'CRITICAL',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        status: 'ESCALATED',
        escalatedToAdminAt: new Date(now.getTime() - 110 * 60 * 1000),
        notes: 'Harness unlatched on scaffolding level 3',
      },
      {
        workerId: createdWorkers[4]._id,
        siteId: createdWorkers[4].siteId,
        ppeType: 'GLOVES',
        severity: 'LOW',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        status: 'ACKNOWLEDGED',
        acknowledgedBy: supervisors[0]._id,
        acknowledgedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        notes: 'Issued fresh pair of heavy-duty gloves',
      },
    ];

    for (let i = 5; i < 18; i++) {
      const w = createdWorkers[i];
      const ppe = ppeTypes[i % ppeTypes.length];
      const sev = severities[i % severities.length];
      const timeAgo = new Date(now.getTime() - (i * 2) * 60 * 60 * 1000);
      const isAck = i % 2 === 0;

      sampleViolations.push({
        workerId: w._id,
        siteId: w.siteId,
        ppeType: ppe,
        severity: sev,
        timestamp: timeAgo,
        status: isAck ? 'ACKNOWLEDGED' : 'ESCALATED',
        acknowledgedBy: isAck ? supervisors[i % supervisors.length]._id : null,
        acknowledgedAt: isAck ? new Date(timeAgo.getTime() + 4 * 60 * 1000) : null,
        escalatedToAdminAt: !isAck ? new Date(timeAgo.getTime() + 10 * 60 * 1000) : null,
        notes: realisticNotes[i % realisticNotes.length],
      });
    }

    await Violation.create(sampleViolations);
    console.log(`Seeded ${sampleViolations.length} violation records.`);

    console.log('\nSeed completed successfully.');
    console.log('Admin Login: admin@workforce.com / Password123!');
    console.log('Supervisor Login: john.doe@workforce.com / Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
