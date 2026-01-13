// Quick Backend Health Check Script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
    console.log('🔍 Testing Backend & Database...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣  Testing Health Endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('   ✅ Health Check:', healthResponse.data.message);
        console.log('   📅 Timestamp:', healthResponse.data.timestamp);
        console.log();

        // Test 2: Login
        console.log('2️⃣  Testing Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'admin123'
        });
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        console.log('   ✅ Login Successful');
        console.log('   👤 User:', user.username);
        console.log('   🔑 Role:', user.role);
        console.log();

        // Test 3: Get Employees
        console.log('3️⃣  Testing Employees Endpoint...');
        const employeesResponse = await axios.get(`${BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Employees Retrieved:', employeesResponse.data.count);
        console.log('   📊 Sample:', employeesResponse.data.data.slice(0, 3).map(e => e.name).join(', '));
        console.log();

        // Test 4: Get Projects
        console.log('4️⃣  Testing Projects Endpoint...');
        const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Projects Retrieved:', projectsResponse.data.count);
        console.log('   📊 Sample:', projectsResponse.data.data.map(p => p.title).join(', '));
        console.log();

        // Test 5: Get Assets
        console.log('5️⃣  Testing Assets Endpoint...');
        const assetsResponse = await axios.get(`${BASE_URL}/assets`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Assets Retrieved:', assetsResponse.data.count);
        console.log('   📊 Sample:', assetsResponse.data.data.slice(0, 3).map(a => a.name).join(', '));
        console.log();

        // Test 6: Get Subscriptions
        console.log('6️⃣  Testing Subscriptions Endpoint...');
        const subscriptionsResponse = await axios.get(`${BASE_URL}/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Subscriptions Retrieved:', subscriptionsResponse.data.count);
        console.log('   📊 Sample:', subscriptionsResponse.data.data.map(s => s.name).join(', '));
        console.log();

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ALL TESTS PASSED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Backend Server: Running');
        console.log('✅ MongoDB Database: Connected');
        console.log('✅ Authentication: Working');
        console.log('✅ API Endpoints: Responding');
        console.log('✅ Data Seeding: Complete');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        process.exit(1);
    }
}

testBackend();
