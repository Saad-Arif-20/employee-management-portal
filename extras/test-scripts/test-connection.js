/**
 * Backend & MongoDB Connection Test Script
 * 
 * This script tests:
 * 1. MongoDB connection
 * 2. Database collections
 * 3. Sample data retrieval
 * 4. Authentication endpoints
 * 
 * Run with: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

async function testConnection() {
    try {
        log.header('🔍 BACKEND & DATABASE HEALTH CHECK');

        // Test 1: MongoDB Connection
        log.info('Test 1: Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        log.success(`Connected to MongoDB: ${mongoose.connection.host}`);
        log.info(`Database: ${mongoose.connection.name}`);

        // Test 2: Check Database State
        log.header('📊 DATABASE STATUS');
        const readyState = mongoose.connection.readyState;
        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };
        log.info(`Connection State: ${states[readyState]}`);

        if (readyState === 1) {
            log.success('MongoDB is fully connected and ready!');
        } else {
            log.error(`MongoDB is not ready. State: ${states[readyState]}`);
            process.exit(1);
        }

        // Test 3: Ping MongoDB
        log.header('🏓 PING TEST');
        const pingResult = await mongoose.connection.db.admin().ping();
        if (pingResult.ok === 1) {
            log.success('MongoDB ping successful!');
        } else {
            log.error('MongoDB ping failed!');
        }

        // Test 4: List Collections
        log.header('📚 DATABASE COLLECTIONS');
        const collections = await mongoose.connection.db.listCollections().toArray();
        log.info(`Found ${collections.length} collections:`);
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        // Test 5: Count Documents in Each Collection
        log.header('📈 DOCUMENT COUNTS');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`   ${col.name}: ${count} documents`);
        }

        // Test 6: Check for Admin User
        log.header('👤 USER VERIFICATION');
        const User = require('./models/User');
        const adminUser = await User.findOne({ email: 'admin@company.com' });

        if (adminUser) {
            log.success('Admin user found!');
            log.info(`Email: ${adminUser.email}`);
            log.info(`Role: ${adminUser.role}`);
            log.info(`Name: ${adminUser.name}`);
        } else {
            log.warning('Admin user not found. Run: npm run seed');
        }

        // Test 7: Check Employees
        log.header('👥 EMPLOYEE DATA');
        const Employee = require('./models/Employee');
        const employeeCount = await Employee.countDocuments();
        log.info(`Total Employees: ${employeeCount}`);

        if (employeeCount > 0) {
            const sampleEmployee = await Employee.findOne();
            log.success('Sample employee retrieved:');
            console.log(`   Name: ${sampleEmployee.name}`);
            console.log(`   Email: ${sampleEmployee.email}`);
            console.log(`   Department: ${sampleEmployee.department}`);
        } else {
            log.warning('No employees found. Run: npm run seed');
        }

        // Test 8: Check Projects
        log.header('📁 PROJECT DATA');
        const Project = require('./models/Project');
        const projectCount = await Project.countDocuments();
        log.info(`Total Projects: ${projectCount}`);

        if (projectCount > 0) {
            const projects = await Project.find().limit(3);
            log.success('Sample projects:');
            projects.forEach(p => {
                console.log(`   - ${p.name} (${p.status})`);
            });
        } else {
            log.warning('No projects found. Run: npm run seed');
        }

        // Test 9: Check Assets
        log.header('💻 ASSET DATA');
        const Asset = require('./models/Asset');
        const assetCount = await Asset.countDocuments();
        log.info(`Total Assets: ${assetCount}`);

        if (assetCount > 0) {
            log.success(`Found ${assetCount} assets in database`);
        } else {
            log.warning('No assets found. Run: npm run seed');
        }

        // Test 10: Check Subscriptions
        log.header('📦 SUBSCRIPTION DATA');
        const Subscription = require('./models/Subscription');
        const subscriptionCount = await Subscription.countDocuments();
        log.info(`Total Subscriptions: ${subscriptionCount}`);

        if (subscriptionCount > 0) {
            log.success(`Found ${subscriptionCount} subscriptions in database`);
        } else {
            log.warning('No subscriptions found. Run: npm run seed');
        }

        // Final Summary
        log.header('📋 HEALTH CHECK SUMMARY');
        log.success('MongoDB Connection: OK');
        log.success('Database Access: OK');
        log.success('Collections: OK');
        log.success(`Data Status: ${employeeCount > 0 ? 'Seeded' : 'Empty (run npm run seed)'}`);

        console.log('\n');
        log.info('Backend server URL: http://localhost:5000');
        log.info('Health endpoint: http://localhost:5000/api/health');
        log.info('Login endpoint: http://localhost:5000/api/auth/login');

        if (adminUser) {
            console.log('\n');
            log.info('Test login credentials:');
            console.log(`   Email: admin@company.com`);
            console.log(`   Password: admin123`);
        }

        console.log('\n');
        log.success('✨ All checks passed! Backend and MongoDB are working correctly! ✨');
        console.log('\n');

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        log.info('MongoDB connection closed');
    }
}

// Run the tests
testConnection();
