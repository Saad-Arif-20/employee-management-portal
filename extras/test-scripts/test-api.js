/**
 * API Endpoints Test Script
 * 
 * This script tests the backend API endpoints to ensure they're working correctly.
 * Make sure the backend server is running (npm run dev) before running this script.
 * 
 * Run with: node test-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// ANSI color codes
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

let authToken = null;

async function testHealthEndpoint() {
    log.header('🏥 TEST 1: Health Check Endpoint');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        log.success('Health endpoint is working!');
        log.info(`Status: ${response.status}`);
        log.info(`Message: ${response.data.message}`);
        return true;
    } catch (error) {
        log.error(`Health check failed: ${error.message}`);
        return false;
    }
}

async function testLogin() {
    log.header('🔐 TEST 2: Login Endpoint');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'admin123'
        });

        log.success('Login successful!');
        log.info(`Status: ${response.status}`);
        log.info(`User: ${response.data.data.user.email}`);
        log.info(`Role: ${response.data.data.user.role}`);

        authToken = response.data.data.token;
        log.success('Auth token received and stored!');
        return true;
    } catch (error) {
        log.error(`Login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetCurrentUser() {
    log.header('👤 TEST 3: Get Current User (Protected Route)');
    if (!authToken) {
        log.error('No auth token available. Login test must pass first.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success('Successfully retrieved current user!');
        log.info(`Email: ${response.data.data.email}`);
        log.info(`Role: ${response.data.data.role}`);
        return true;
    } catch (error) {
        log.error(`Get current user failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetEmployees() {
    log.header('👥 TEST 4: Get All Employees');
    if (!authToken) {
        log.error('No auth token available. Login test must pass first.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success('Successfully retrieved employees!');
        log.info(`Total employees: ${response.data.data.length}`);

        if (response.data.data.length > 0) {
            const firstEmployee = response.data.data[0];
            log.info(`Sample: ${firstEmployee.name} (${firstEmployee.department})`);
        }
        return true;
    } catch (error) {
        log.error(`Get employees failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetProjects() {
    log.header('📁 TEST 5: Get All Projects');
    if (!authToken) {
        log.error('No auth token available. Login test must pass first.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success('Successfully retrieved projects!');
        log.info(`Total projects: ${response.data.data.length}`);

        if (response.data.data.length > 0) {
            const firstProject = response.data.data[0];
            log.info(`Sample: ${firstProject.name} (${firstProject.status})`);
        }
        return true;
    } catch (error) {
        log.error(`Get projects failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetAssets() {
    log.header('💻 TEST 6: Get All Assets');
    if (!authToken) {
        log.error('No auth token available. Login test must pass first.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/assets`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success('Successfully retrieved assets!');
        log.info(`Total assets: ${response.data.data.length}`);

        if (response.data.data.length > 0) {
            const firstAsset = response.data.data[0];
            log.info(`Sample: ${firstAsset.name} (${firstAsset.status})`);
        }
        return true;
    } catch (error) {
        log.error(`Get assets failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetSubscriptions() {
    log.header('📦 TEST 7: Get All Subscriptions');
    if (!authToken) {
        log.error('No auth token available. Login test must pass first.');
        return false;
    }

    try {
        const response = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success('Successfully retrieved subscriptions!');
        log.info(`Total subscriptions: ${response.data.data.length}`);

        if (response.data.data.length > 0) {
            const firstSub = response.data.data[0];
            log.info(`Sample: ${firstSub.name} (${firstSub.status})`);
        }
        return true;
    } catch (error) {
        log.error(`Get subscriptions failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testUnauthorizedAccess() {
    log.header('🚫 TEST 8: Unauthorized Access (Should Fail)');
    try {
        await axios.get(`${BASE_URL}/employees`);
        log.error('Unauthorized access was allowed! This is a security issue!');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log.success('Unauthorized access correctly blocked!');
            log.info('Security is working as expected');
            return true;
        } else {
            log.error(`Unexpected error: ${error.message}`);
            return false;
        }
    }
}

async function runAllTests() {
    log.header('🚀 STARTING API ENDPOINT TESTS');
    log.info('Make sure the backend server is running on http://localhost:5000');
    console.log('\n');

    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };

    const tests = [
        { name: 'Health Check', fn: testHealthEndpoint },
        { name: 'Login', fn: testLogin },
        { name: 'Get Current User', fn: testGetCurrentUser },
        { name: 'Get Employees', fn: testGetEmployees },
        { name: 'Get Projects', fn: testGetProjects },
        { name: 'Get Assets', fn: testGetAssets },
        { name: 'Get Subscriptions', fn: testGetSubscriptions },
        { name: 'Unauthorized Access', fn: testUnauthorizedAccess }
    ];

    for (const test of tests) {
        results.total++;
        const passed = await test.fn();
        if (passed) {
            results.passed++;
        } else {
            results.failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }

    // Final Summary
    log.header('📊 TEST RESULTS SUMMARY');
    console.log(`\n   Total Tests: ${results.total}`);
    console.log(`   ${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`   ${colors.red}Failed: ${results.failed}${colors.reset}`);

    const percentage = ((results.passed / results.total) * 100).toFixed(1);
    console.log(`\n   Success Rate: ${percentage}%\n`);

    if (results.failed === 0) {
        log.success('🎉 All API tests passed! Your backend is working perfectly! 🎉');
    } else {
        log.warning(`${results.failed} test(s) failed. Please check the errors above.`);
    }

    console.log('\n');
}

// Check if axios is available
try {
    require.resolve('axios');
    runAllTests();
} catch (e) {
    log.error('axios is not installed. Please run: npm install axios');
    process.exit(1);
}
