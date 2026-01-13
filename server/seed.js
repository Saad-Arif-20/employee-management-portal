const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');
const Project = require('./models/Project');
const Asset = require('./models/Asset');
const Subscription = require('./models/Subscription');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Sample data
const seedData = async () => {
    try {
        // Clear existing data
        await Employee.deleteMany();
        await Project.deleteMany();
        await Asset.deleteMany();
        await Subscription.deleteMany();
        await User.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@company.com',
            password: 'Admin123',
            role: 'admin'
        });

        console.log('👤 Created admin user (email: admin@company.com, password: Admin123)');

        // Create sample employees with varied join dates for dynamic monthly spending
        const employees = await Employee.create([
            // Core team - joined before 12-month window
            {
                employeeId: '284756',
                name: 'Sarah Jenkins',
                email: 'sarah.j@company.com',
                role: 'Engineering Manager',
                department: 'Engineering',
                salary: 450000,
                joinDate: new Date('2020-03-15'),
                status: 'Active'
            },
            {
                employeeId: '591823',
                name: 'Mike Chen',
                email: 'mike.c@company.com',
                role: 'Senior Frontend Developer',
                department: 'Engineering',
                salary: 350000,
                joinDate: new Date('2021-01-10'),
                status: 'Active'
            },
            {
                employeeId: '736492',
                name: 'Jessica Wu',
                email: 'jessica.w@company.com',
                role: 'Product Designer',
                department: 'Design',
                salary: 280000,
                joinDate: new Date('2021-05-20'),
                status: 'Active'
            },

            // Employees who joined in the past 12 months (Feb 2025 - Jan 2026)
            {
                employeeId: '418965',
                name: 'David Miller',
                email: 'david.m@company.com',
                role: 'Backend Developer',
                department: 'Engineering',
                salary: 320000,
                joinDate: new Date('2025-03-15'), // March 2025
                status: 'Active'
            },
            {
                employeeId: '925374',
                name: 'Emily Wilson',
                email: 'emily.w@company.com',
                role: 'Product Manager',
                department: 'Product',
                salary: 380000,
                joinDate: new Date('2025-05-01'), // May 2025
                status: 'Active'
            },
            {
                employeeId: '652189',
                name: 'Alex Rodriguez',
                email: 'alex.r@company.com',
                role: 'DevOps Engineer',
                department: 'Engineering',
                salary: 340000,
                joinDate: new Date('2025-06-10'), // June 2025
                status: 'Active'
            },
            {
                employeeId: '783421',
                name: 'Rachel Green',
                email: 'rachel.g@company.com',
                role: 'UX Designer',
                department: 'Design',
                salary: 290000,
                joinDate: new Date('2025-07-20'), // July 2025
                status: 'Active'
            },
            {
                employeeId: '894532',
                name: 'Tom Anderson',
                email: 'tom.a@company.com',
                role: 'QA Engineer',
                department: 'Engineering',
                salary: 270000,
                joinDate: new Date('2025-09-05'), // September 2025
                status: 'Active'
            },
            {
                employeeId: '561234',
                name: 'Lisa Park',
                email: 'lisa.p@company.com',
                role: 'Marketing Manager',
                department: 'Marketing',
                salary: 360000,
                joinDate: new Date('2025-10-15'), // October 2025
                status: 'Active'
            },
            {
                employeeId: '672345',
                name: 'James Taylor',
                email: 'james.t@company.com',
                role: 'Sales Representative',
                department: 'Sales',
                salary: 310000,
                joinDate: new Date('2025-11-01'), // November 2025
                status: 'Active'
            },

            // Employee who left during the period (to show salary decrease)
            {
                employeeId: '123456',
                name: 'Robert Brown',
                email: 'robert.b@company.com',
                role: 'Senior Developer',
                department: 'Engineering',
                salary: 370000,
                joinDate: new Date('2019-06-15'),
                lastWorkingDate: new Date('2025-08-31'), // Left in August 2025
                status: 'Inactive'
            },
            {
                employeeId: '234567',
                name: 'Maria Garcia',
                email: 'maria.g@company.com',
                role: 'HR Manager',
                department: 'HR',
                salary: 330000,
                joinDate: new Date('2020-02-10'),
                lastWorkingDate: new Date('2025-04-30'), // Left in April 2025
                status: 'Inactive'
            }
        ]);

        console.log(`✅ Created ${employees.length} employees`);

        // Create sample projects
        const projects = await Project.create([
            {
                title: 'E-Commerce Platform Launch',
                description: 'Development and launch of a new e-commerce platform with payment integration and inventory management.',
                status: 'In Progress',
                startDate: new Date('2025-06-15'),
                deadline: new Date('2025-09-30'),
                lead: employees[0]._id,
                team: [employees[1]._id, employees[3]._id],
                progress: 45
            },
            {
                title: 'Mobile App Redesign',
                description: 'Complete UI/UX overhaul of the mobile application for iOS and Android platforms.',
                status: 'Planning',
                startDate: new Date('2025-07-01'),
                deadline: new Date('2025-10-15'),
                lead: employees[2]._id,
                team: [employees[2]._id],
                progress: 10
            },
            {
                title: 'Customer Portal Enhancement',
                description: 'Adding new features to the customer portal including live chat, ticketing system, and knowledge base.',
                status: 'Completed',
                startDate: new Date('2025-06-20'),
                deadline: new Date('2025-08-30'),
                lead: employees[4]._id,
                team: [employees[4]._id],
                progress: 100
            }
        ]);

        console.log(`✅ Created ${projects.length} projects`);

        // Create sample assets with purchases spread across 12 months
        const assets = await Asset.create([
            // Recent purchases (past 3 months)
            {
                assetId: 'AST-LP-001',
                assetTag: '482901',
                name: 'MacBook Pro 16" M3',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[0]._id,
                purchaseDate: new Date('2025-11-15'),
                price: 2499,
                serialNumber: 'C02XJ0AAJGH5'
            },
            {
                assetId: 'AST-LP-002',
                assetTag: '756234',
                name: 'Dell XPS 15',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[1]._id,
                purchaseDate: new Date('2025-11-20'),
                price: 1899,
                serialNumber: 'DXP15-2023-8920'
            },
            {
                assetId: 'AST-MN-001',
                assetTag: '329847',
                name: 'Dell UltraSharp 27"',
                type: 'Monitor',
                status: 'Available',
                purchaseDate: new Date('2025-10-05'),
                price: 450
            },
            {
                assetId: 'AST-LP-003',
                assetTag: '891234',
                name: 'MacBook Air M2',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[3]._id,
                purchaseDate: new Date('2025-10-12'),
                price: 1499
            },

            // Mid-year purchases (4-8 months ago)
            {
                assetId: 'AST-LP-004',
                assetTag: '567890',
                name: 'ThinkPad X1 Carbon',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[5]._id,
                purchaseDate: new Date('2025-08-15'),
                price: 1799
            },
            {
                assetId: 'AST-MN-002',
                assetTag: '234567',
                name: 'LG UltraWide 34"',
                type: 'Monitor',
                status: 'Assigned',
                assignedTo: employees[6]._id,
                purchaseDate: new Date('2025-07-22'),
                price: 599
            },
            {
                assetId: 'AST-MN-003',
                assetTag: '345678',
                name: 'Samsung 27" 4K',
                type: 'Monitor',
                status: 'Assigned',
                assignedTo: employees[7]._id,
                purchaseDate: new Date('2025-06-18'),
                price: 399
            },
            {
                assetId: 'AST-LP-005',
                assetTag: '456789',
                name: 'HP EliteBook 840',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[8]._id,
                purchaseDate: new Date('2025-05-10'),
                price: 1399
            },

            // Earlier purchases (9-12 months ago)
            {
                assetId: 'AST-DK-001',
                assetTag: '678901',
                name: 'Ergonomic Desk',
                type: 'Other',
                status: 'Assigned',
                assignedTo: employees[4]._id,
                purchaseDate: new Date('2025-04-05'),
                price: 899
            },
            {
                assetId: 'AST-CH-001',
                assetTag: '789012',
                name: 'Herman Miller Chair',
                type: 'Other',
                status: 'Assigned',
                assignedTo: employees[4]._id,
                purchaseDate: new Date('2025-03-20'),
                price: 1299
            },
            {
                assetId: 'AST-LP-006',
                assetTag: '890123',
                name: 'Surface Laptop 5',
                type: 'Laptop',
                status: 'Assigned',
                assignedTo: employees[9]._id,
                purchaseDate: new Date('2025-02-28'),
                price: 1599
            },
            {
                assetId: 'AST-TB-001',
                assetTag: '901234',
                name: 'iPad Pro 12.9"',
                type: 'Tablet',
                status: 'Available',
                purchaseDate: new Date('2025-02-15'),
                price: 1099
            }
        ]);

        console.log(`✅ Created ${assets.length} assets`);

        // Create sample subscriptions with varied start dates
        const subscriptions = await Subscription.create([
            // Long-running subscriptions (started before 12-month window)
            {
                name: 'GitHub Enterprise',
                type: 'Software',
                price: '$21.00/mo',
                priceAmount: 21.00,
                billingCycle: 'monthly',
                startDate: new Date('2024-02-15'),
                status: 'Active',
                assignedTo: [
                    { employee: employees[0]._id, status: 'Active', startDate: new Date('2024-02-15') },
                    { employee: employees[1]._id, status: 'Active', startDate: new Date('2024-02-15') },
                    { employee: employees[3]._id, status: 'Active', startDate: new Date('2024-02-20') }
                ],
                selectedProjects: [projects[0]._id, projects[1]._id]
            },

            // Subscriptions started during the 12-month period
            {
                name: 'Adobe Creative Cloud',
                type: 'Software',
                price: '$52.99/mo',
                priceAmount: 52.99,
                billingCycle: 'monthly',
                startDate: new Date('2025-03-15'), // March 2025
                status: 'Active',
                assignedTo: [
                    { employee: employees[2]._id, status: 'Active', startDate: new Date('2025-03-15') },
                    { employee: employees[6]._id, status: 'Active', startDate: new Date('2025-07-20') }
                ],
                selectedProjects: []
            },
            {
                name: 'Slack Business+',
                type: 'Software',
                price: '$12.50/mo',
                priceAmount: 12.50,
                billingCycle: 'monthly',
                startDate: new Date('2025-05-01'), // May 2025
                status: 'Active',
                assignedTo: [
                    { employee: employees[0]._id, status: 'Active', startDate: new Date('2025-05-01') },
                    { employee: employees[1]._id, status: 'Active', startDate: new Date('2025-05-01') },
                    { employee: employees[4]._id, status: 'Active', startDate: new Date('2025-05-01') },
                    { employee: employees[8]._id, status: 'Active', startDate: new Date('2025-10-15') }
                ],
                selectedProjects: [projects[0]._id]
            },
            {
                name: 'Figma Professional',
                type: 'Software',
                price: '$15.00/mo',
                priceAmount: 15.00,
                billingCycle: 'monthly',
                startDate: new Date('2025-07-01'), // July 2025
                status: 'Active',
                assignedTo: [
                    { employee: employees[2]._id, status: 'Active', startDate: new Date('2025-07-01') },
                    { employee: employees[6]._id, status: 'Active', startDate: new Date('2025-07-20') }
                ],
                selectedProjects: [projects[1]._id]
            },
            {
                name: 'Jira Software',
                type: 'Software',
                price: '$8.15/mo',
                priceAmount: 8.15,
                billingCycle: 'monthly',
                startDate: new Date('2025-09-10'), // September 2025
                status: 'Active',
                assignedTo: [
                    { employee: employees[0]._id, status: 'Active', startDate: new Date('2025-09-10') },
                    { employee: employees[4]._id, status: 'Active', startDate: new Date('2025-09-10') },
                    { employee: employees[7]._id, status: 'Active', startDate: new Date('2025-09-10') }
                ],
                selectedProjects: [projects[0]._id, projects[1]._id]
            },
            {
                name: 'AWS Cloud Services',
                type: 'Infrastructure',
                price: '$150.00/mo',
                priceAmount: 150.00,
                billingCycle: 'monthly',
                startDate: new Date('2025-11-01'), // November 2025
                status: 'Active',
                assignedTo: [
                    { employee: employees[0]._id, status: 'Active', startDate: new Date('2025-11-01') },
                    { employee: employees[3]._id, status: 'Active', startDate: new Date('2025-11-01') },
                    { employee: employees[5]._id, status: 'Active', startDate: new Date('2025-11-01') }
                ],
                selectedProjects: [projects[0]._id]
            }
        ]);

        console.log(`✅ Created ${subscriptions.length} subscriptions`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Email: admin@company.com');
        console.log('   Password: Admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
connectDB().then(() => seedData());
