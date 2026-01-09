import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, CardBody, Badge, Progress, Button } from 'reactstrap';
import { Users, Briefcase, CreditCard, Building2, Clock, ArrowRight, DollarSign, TrendingUp, TrendingDown, UserMinus, AlertCircle } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Title
} from 'chart.js';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Title
);

const SectionCard = ({ title, icon: Icon, color, children, link }) => {
    const navigate = useNavigate();

    // Professional gradient backgrounds - green theme
    const gradientMap = {
        primary: 'linear-gradient(135deg, rgba(13, 59, 46, 0.04) 0%, rgba(20, 92, 71, 0.04) 100%)',
        success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(52, 211, 153, 0.04) 100%)',
        info: 'linear-gradient(135deg, rgba(20, 184, 166, 0.04) 0%, rgba(45, 212, 191, 0.04) 100%)',
        warning: 'linear-gradient(135deg, rgba(251, 191, 36, 0.04) 0%, rgba(253, 224, 113, 0.04) 100%)',
    };

    return (
        <Card
            className="border-0 h-100 shadow-sm hover-lift"
            style={{
                background: gradientMap[color] || 'white',
                transition: 'all 0.3s ease'
            }}
        >
            <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="p-3 rounded-3"
                            style={{
                                background: color === 'primary' ? 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)' :
                                    color === 'success' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' :
                                        color === 'info' ? 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' :
                                            color === 'warning' ? 'linear-gradient(135deg, #fbbf24 0%, #fde047 100%)' :
                                                '#475569',
                                boxShadow: `0 4px 12px ${color === 'primary' ? 'rgba(13, 59, 46, 0.15)' :
                                    color === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                        color === 'info' ? 'rgba(20, 184, 166, 0.15)' :
                                            color === 'warning' ? 'rgba(251, 191, 36, 0.15)' :
                                                'rgba(71, 85, 105, 0.15)'}`
                            }}
                        >
                            <Icon size={28} className="text-white" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold text-dark">{title}</h5>
                        </div>
                    </div>
                    {link && (
                        <Button
                            color="light"
                            size="sm"
                            className="d-flex align-items-center gap-2 border-0"
                            onClick={() => navigate(link)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            View Details
                            <ArrowRight size={14} />
                        </Button>
                    )}
                </div>
                {children}
            </CardBody>
        </Card>
    );
};

const Dashboard = () => {
    const { employees, projects, subscriptions, assets } = useGlobal();

    // Track which datasets are visible in the monthly spending chart
    const [visibleDatasets, setVisibleDatasets] = useState({
        salaries: true,
        subscriptions: true,
        assets: true
    });


    // Employee Metrics
    const employeeMetrics = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'Active').length;
        const onLeave = employees.filter(e => e.status === 'On Leave').length;
        const inactive = employees.filter(e => e.status === 'Inactive').length;

        return {
            total,
            active,
            onLeave,
            inactive,
        };
    }, [employees]);

    // Project Metrics
    const projectMetrics = useMemo(() => {
        const total = projects.length;
        const inProgress = projects.filter(p => p.status === 'In Progress').length;
        const planning = projects.filter(p => p.status === 'Planning').length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const onHold = projects.filter(p => p.status === 'On Hold').length;

        return {
            total,
            inProgress,
            planning,
            completed,
            onHold,
        };
    }, [projects]);

    // Asset Metrics
    const assetMetrics = useMemo(() => {
        const total = assets.length;
        const available = assets.filter(a => a.status === 'Available').length;
        const inUse = assets.filter(a => a.status === 'In Use' || a.status === 'Assigned').length;
        const maintenance = assets.filter(a => a.status === 'Under maintenance').length;
        const discarded = assets.filter(a => a.status === 'Discarded').length;

        return {
            total,
            available,
            inUse,
            maintenance,
            discarded,
            inUsePercentage: total > 0 ? Math.round((inUse / total) * 100) : 0,
        };
    }, [assets]);

    // Subscription Metrics
    const subscriptionMetrics = useMemo(() => {
        const total = subscriptions.length;
        let activeCount = 0;
        let pausedCount = 0;

        subscriptions.forEach(sub => {
            if (sub.status === 'Paused') {
                pausedCount++;
            } else if (sub.status === 'Active') {
                activeCount++;
            } else if (Array.isArray(sub.assignedTo) && sub.assignedTo.length > 0) {
                const hasActive = sub.assignedTo.some(a =>
                    (typeof a === 'object' && a.status === 'Active') || (typeof a === 'string')
                );
                const allPaused = sub.assignedTo.every(a =>
                    typeof a === 'object' && a.status === 'Paused'
                );
                if (hasActive) activeCount++;
                else if (allPaused) pausedCount++;
            } else if (sub.assignedTo) {
                if (typeof sub.assignedTo === 'object' && sub.assignedTo.status === 'Paused') pausedCount++;
                else activeCount++;
            } else {
                activeCount++;
            }
        });

        return {
            total,
            active: activeCount,
            paused: pausedCount,
        };
    }, [subscriptions]);

    // Salary & Payroll Analytics
    const salaryMetrics = useMemo(() => {
        const activeEmployees = employees.filter(e => e.status === 'Active');
        // Calculate annual payroll
        const totalAnnualPayroll = activeEmployees.reduce((sum, emp) => {
            const salary = parseFloat(String(emp.salary).replace(/,/g, '')) || 0;
            return sum + salary;
        }, 0);

        // Calculate monthly payroll (annual / 12)
        const totalMonthlyPayroll = totalAnnualPayroll / 12;

        const averageSalary = activeEmployees.length > 0 ? totalAnnualPayroll / activeEmployees.length : 0;
        const averageMonthlySalary = averageSalary / 12;

        // Salary by department
        const deptSalaries = {};
        activeEmployees.forEach(emp => {
            const salary = parseFloat(String(emp.salary).replace(/,/g, '')) || 0;
            if (!deptSalaries[emp.department]) {
                deptSalaries[emp.department] = { total: 0, count: 0 };
            }
            deptSalaries[emp.department].total += salary;
            deptSalaries[emp.department].count += 1;
        });

        return {
            totalAnnualPayroll,
            totalMonthlyPayroll,
            averageSalary,
            averageMonthlySalary,
            deptSalaries,
        };
    }, [employees]);

    // Subscription Cost Analytics
    const subscriptionCostMetrics = useMemo(() => {
        let totalMonthlyCost = 0;
        let activeSubscriptionCost = 0;

        subscriptions.forEach(sub => {
            const match = sub.price?.match(/\$([\d,]+\.?\d*)/);
            if (match) {
                const cost = parseFloat(match[1].replace(/,/g, ''));

                // Check if subscription is active
                const isActive = sub.status === 'Active' ||
                    (Array.isArray(sub.assignedTo) && sub.assignedTo.length > 0 &&
                        sub.assignedTo.some(a => (typeof a === 'object' && a.status === 'Active') || typeof a === 'string'));

                // Only count active subscriptions in the total
                if (isActive) {
                    totalMonthlyCost += cost;
                    activeSubscriptionCost += cost;
                }
            }
        });

        // Calculate assets purchased in current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let currentMonthAssetCost = 0;
        assets.forEach(asset => {
            if (asset.purchaseDate) {
                const purchaseDate = new Date(asset.purchaseDate);
                if (purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear) {
                    const assetPrice = parseFloat(String(asset.price || '0').replace(/,/g, ''));
                    currentMonthAssetCost += assetPrice;
                }
            }
        });

        // Add asset cost to total monthly cost
        const totalWithAssets = totalMonthlyCost + currentMonthAssetCost;

        const totalAnnualCost = totalMonthlyCost * 12;
        const unusedSubscriptions = subscriptions.filter(
            sub => {
                // Check if no users are assigned
                const noUsers = !sub.assignedTo || (Array.isArray(sub.assignedTo) && sub.assignedTo.length === 0);
                // Check if not assigned to any projects
                const noProjects = !sub.selectedProjects || (Array.isArray(sub.selectedProjects) && sub.selectedProjects.length === 0);
                // Check if subscription is active (not paused)
                const isActive = sub.status !== 'Paused';
                // Only flag as unused if ALL conditions are true: no users AND no projects AND active status
                return noUsers && noProjects && isActive;
            }
        );

        let wastedCost = 0;
        unusedSubscriptions.forEach(sub => {
            const match = sub.price?.match(/\$([\d,]+\.?\d*)/);
            if (match) {
                wastedCost += parseFloat(match[1].replace(/,/g, ''));
            }
        });

        return {
            totalMonthlyCost: totalWithAssets,
            subscriptionOnlyCost: totalMonthlyCost,
            currentMonthAssetCost,
            totalAnnualCost,
            activeSubscriptionCost,
            unusedCount: unusedSubscriptions.length,
            wastedMonthlyCost: wastedCost,
            wastedAnnualCost: wastedCost * 12,
            costPerEmployee: employees.length > 0 ? totalMonthlyCost / employees.length : 0
        };
    }, [subscriptions, employees, assets]);

    // Employee Growth Trend (Based on actual join dates and departures)
    const employeeGrowthData = useMemo(() => {
        const months = [];
        const data = [];
        const today = new Date();

        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));

            // Count active employees at the end of this month
            const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            const employeeCount = employees.filter(emp => {
                const joinDate = new Date(emp.joinDate);
                // Must have joined by this month
                if (joinDate > endOfMonth) return false;

                // If employee has a lastWorkingDate, check if they were still working at end of this month
                if (emp.lastWorkingDate) {
                    const departureDate = new Date(emp.lastWorkingDate);
                    // If they left before the end of this month, don't count them
                    if (departureDate <= endOfMonth) return false;
                }

                // Count all employees (active, on leave, or inactive) if they were working during this month
                return true;
            }).length;

            data.push(employeeCount);
        }

        // Update the last data point (current month) with actual current count
        // Count all employees who have joined by today and haven't left
        const currentDate = new Date();
        const actualCurrentCount = employees.filter(emp => {
            const joinDate = new Date(emp.joinDate);

            // Must have joined by today
            if (joinDate > currentDate) return false;

            // Exclude inactive employees (unless they have a future lastWorkingDate)
            if (emp.status === 'Inactive' && !emp.lastWorkingDate) return false;

            // If they have a lastWorkingDate, check if they've already left
            if (emp.lastWorkingDate) {
                const departureDate = new Date(emp.lastWorkingDate);
                if (departureDate <= currentDate) return false;
            }

            return true;
        }).length;
        data[data.length - 1] = actualCurrentCount;

        // Calculate month-over-month growth from the last two data points
        // This makes the percentage consistent with what the chart shows
        const currentMonthCount = data[data.length - 1]; // Current month (December)
        const previousMonthCount = data.length >= 2 ? data[data.length - 2] : currentMonthCount; // Previous month (November)

        // Net change = current - previous
        const netChange = currentMonthCount - previousMonthCount;

        const growthPercent = previousMonthCount > 0
            ? ((netChange / previousMonthCount) * 100).toFixed(1)
            : '0.0';

        return {
            labels: months,
            data: data,
            currentTotal: employees.length,
            growthTrend: `${growthPercent >= 0 ? '+' : ''}${growthPercent}%`,
            netChange: netChange,
            currentActive: currentMonthCount,
            previousActive: previousMonthCount
        };
    }, [employees]);

    // Alerts & Action Items
    const alerts = useMemo(() => {
        const alertList = [];

        // Projects with approaching deadlines (within 7 days)
        const today = new Date();
        const projectsWithApproachingDeadlines = projects.filter(p => {
            if (p.status === 'Completed') return false;
            const deadline = new Date(p.deadline);
            const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            return daysRemaining <= 7 && daysRemaining > 0;
        }).length;

        if (projectsWithApproachingDeadlines > 0) {
            alertList.push({
                type: 'info',
                icon: Clock,
                message: `${projectsWithApproachingDeadlines} project${projectsWithApproachingDeadlines > 1 ? 's have' : ' has'} deadline${projectsWithApproachingDeadlines > 1 ? 's' : ''} approaching within 7 days`,
                action: 'Review deadlines'
            });
        }

        // Overdue projects
        const overdueProjects = projects.filter(p => {
            if (p.status === 'Completed') return false;
            const deadline = new Date(p.deadline);
            const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            return daysRemaining <= 0;
        }).length;

        if (overdueProjects > 0) {
            alertList.push({
                type: 'warning',
                icon: AlertCircle,
                message: `${overdueProjects} project${overdueProjects > 1 ? 's are' : ' is'} overdue`,
                action: 'Update project timelines'
            });
        }

        // Employees without managers
        const employeesWithoutManagers = employees.filter(e =>
            !e.reportingTo && e.status === 'Active'
        ).length;
        if (employeesWithoutManagers > 0) {
            alertList.push({
                type: 'info',
                icon: UserMinus,
                message: `${employeesWithoutManagers} employee${employeesWithoutManagers > 1 ? 's' : ''} without managers`,
                action: 'Review reporting structure'
            });
        }

        // Unused subscriptions
        if (subscriptionCostMetrics.unusedCount > 0) {
            alertList.push({
                type: 'warning',
                icon: CreditCard,
                message: `${subscriptionCostMetrics.unusedCount} unused subscription${subscriptionCostMetrics.unusedCount > 1 ? 's' : ''} wasting $${subscriptionCostMetrics.wastedMonthlyCost.toLocaleString()}/mo`,
                action: 'Optimize licenses'
            });
        }

        // Projects without team members
        const unstaffedProjects = projects.filter(p =>
            (!p.team || p.team.length === 0) && p.status !== 'Completed'
        ).length;
        if (unstaffedProjects > 0) {
            alertList.push({
                type: 'info',
                icon: Briefcase,
                message: `${unstaffedProjects} project${unstaffedProjects > 1 ? 's' : ''} without team members`,
                action: 'Assign resources'
            });
        }


        return alertList;
    }, [employees, subscriptionCostMetrics, projects, salaryMetrics]);

    // Salary Distribution Data - Optimized
    const salaryDistributionData = useMemo(() => {
        if (!employees || employees.length === 0) {
            return {
                under30k: 0,
                range30to50k: 0,
                range50to70k: 0,
                range70to100k: 0,
                over100k: 0,
            };
        }

        return {
            under30k: employees.filter(e => {
                const sal = parseFloat(String(e.salary).replace(/,/g, ''));
                return sal < 30000;
            }).length,
            range30to50k: employees.filter(e => {
                const sal = parseFloat(String(e.salary).replace(/,/g, ''));
                return sal >= 30000 && sal < 50000;
            }).length,
            range50to70k: employees.filter(e => {
                const sal = parseFloat(String(e.salary).replace(/,/g, ''));
                return sal >= 50000 && sal < 70000;
            }).length,
            range70to100k: employees.filter(e => {
                const sal = parseFloat(String(e.salary).replace(/,/g, ''));
                return sal >= 70000 && sal < 100000;
            }).length,
            over100k: employees.filter(e => {
                const sal = parseFloat(String(e.salary).replace(/,/g, ''));
                return sal >= 100000;
            }).length,
        };
    }, [employees]);

    // Tenure Distribution Data - Optimized
    const tenureDistributionData = useMemo(() => {
        if (!employees || employees.length === 0) {
            return {
                under1yr: 0,
                range1to3yr: 0,
                range3to5yr: 0,
                over5yr: 0,
                avgTenure: 0
            };
        }

        return {
            under1yr: employees.filter(e => {
                const years = (new Date() - new Date(e.joinDate)) / (1000 * 60 * 60 * 24 * 365);
                return years < 1;
            }).length,
            range1to3yr: employees.filter(e => {
                const years = (new Date() - new Date(e.joinDate)) / (1000 * 60 * 60 * 24 * 365);
                return years >= 1 && years < 3;
            }).length,
            range3to5yr: employees.filter(e => {
                const years = (new Date() - new Date(e.joinDate)) / (1000 * 60 * 60 * 24 * 365);
                return years >= 3 && years < 5;
            }).length,
            over5yr: employees.filter(e => {
                const years = (new Date() - new Date(e.joinDate)) / (1000 * 60 * 60 * 24 * 365);
                return years >= 5;
            }).length,
            avgTenure: employees.reduce((sum, emp) => {
                const joinDate = new Date(emp.joinDate);
                const now = new Date();
                const years = (now - joinDate) / (1000 * 60 * 60 * 24 * 365);
                return sum + years;
            }, 0) / employees.length
        };
    }, [employees]);


    // Department Breakdown
    const departmentStats = useMemo(() => {
        const deptCounts = employees.reduce((acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    }, [employees]);

    // --- Chart Data & Options ---

    // 1. Employees: Modern Doughnut with Gradients
    const employeeChartData = {
        labels: ['Active', 'On Leave', 'Inactive'],
        datasets: [{
            data: [employeeMetrics.active, employeeMetrics.onLeave, employeeMetrics.inactive],
            backgroundColor: [
                'rgba(16, 185, 129, 0.9)',
                'rgba(251, 191, 36, 0.9)',
                'rgba(239, 68, 68, 0.9)'
            ],
            borderWidth: 0,
            cutout: '70%',
            spacing: 0
        }]
    };
    const employeeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12 },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 12,
                displayColors: true,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 }
            }
        }
    };

    // 2. Projects: Gradient Bar Chart
    const projectChartData = {
        labels: ['In Progress', 'Planning', 'Completed', 'On Hold'],
        datasets: [{
            label: 'Projects',
            data: [projectMetrics.inProgress, projectMetrics.planning, projectMetrics.completed, projectMetrics.onHold],
            backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(14, 165, 233, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(100, 116, 139, 0.85)'
            ],
            borderRadius: 10,
            barThickness: 35,
        }]
    };
    const projectChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 12,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    stepSize: 1,
                    font: { family: "'Inter', sans-serif", size: 11 },
                    color: '#94a3b8'
                }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    color: '#94a3b8'
                }
            }
        }
    };

    // 3. Assets: Modern Polar Area
    const assetChartData = {
        labels: ['Available', 'In Use', 'Maintenance', 'Discarded'],
        datasets: [{
            data: [assetMetrics.available, assetMetrics.inUse, assetMetrics.maintenance, assetMetrics.discarded],
            backgroundColor: [
                'rgba(16, 185, 129, 0.75)',
                'rgba(59, 130, 246, 0.75)',
                'rgba(251, 191, 36, 0.75)',
                'rgba(239, 68, 68, 0.75)'
            ],
            borderWidth: 0,
        }]
    };
    const assetChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    font: { family: "'Inter', sans-serif", size: 12 },
                    color: '#64748b',
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 12,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            r: {
                ticks: { display: false },
                grid: { color: 'rgba(148, 163, 184, 0.15)' }
            }
        }
    };

    // 4. Subscriptions: Modern Pie Chart
    // 4. Subscriptions: Modern Pie Chart
    const subscriptionChartData = {
        labels: ['Active', 'Paused'],
        datasets: [{
            data: [subscriptionMetrics.active, subscriptionMetrics.paused],
            backgroundColor: [
                'rgba(16, 185, 129, 0.9)',
                'rgba(251, 191, 36, 0.9)'
            ],
            hoverBackgroundColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(251, 191, 36, 1)'
            ],
            borderWidth: 0,
            hoverOffset: 0
        }]
    };
    const subscriptionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12 },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 12,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1
            }
        }
    };

    // 5. Department: Modern Vertical Bar with Gradients
    const departmentChartData = {
        labels: departmentStats.map(([dept]) => dept),
        datasets: [{
            label: 'Employees',
            data: departmentStats.map(([, count]) => count),
            backgroundColor: 'rgba(139, 92, 246, 0.85)',
            borderRadius: 10,
            maxBarThickness: 60,
        }]
    };
    const departmentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 12,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    stepSize: 1,
                    font: { family: "'Inter', sans-serif", size: 11 },
                    color: '#94a3b8'
                }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    color: '#94a3b8'
                }
            }
        }
    };

    // 6. Employee Growth Trend - Professional Line Chart (Dynamic colors based on growth)
    const isNegativeGrowth = employeeGrowthData.netChange < 0;
    const chartColor = isNegativeGrowth ? '#ef4444' : '#14b8a6'; // Red for negative, Teal for positive
    const chartColorRgba = isNegativeGrowth ? '239, 68, 68' : '20, 184, 166';

    const growthChartData = {
        labels: employeeGrowthData.labels,
        datasets: [{
            label: 'Total Employees',
            data: employeeGrowthData.data,
            borderColor: chartColor,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, `rgba(${chartColorRgba}, 0.4)`);
                gradient.addColorStop(1, `rgba(${chartColorRgba}, 0.0)`);
                return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4, // Smooth curve
            pointRadius: 0, // Hide points by default for cleaner look
            pointHoverRadius: 6,
            pointBackgroundColor: chartColor,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: chartColor,
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
        }]
    };

    const growthChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(13, 59, 46, 0.95)', // Dark Green background
                padding: 12,
                cornerRadius: 8,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(20, 184, 166, 0.2)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `Total Employees: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    font: { family: "'Outfit', sans-serif", size: 11 },
                    color: '#94a3b8',
                    stepSize: 1,
                    padding: 10
                },
                border: { display: false }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    font: { family: "'Outfit', sans-serif", size: 11 },
                    color: '#94a3b8',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6
                },
                border: { display: false }
            }
        }
    };

    // 12-Month Spending Trend Data (Real data based on employees, assets, and subscriptions)
    const monthlySpendingData = useMemo(() => {
        const currentDate = new Date();
        const months = [];
        const salaryData = [];
        const assetData = [];
        const subscriptionData = [];

        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
            months.push(monthName);

            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

            // Calculate salary for active employees in this month
            let monthlySalary = 0;
            employees.forEach(emp => {
                const joinDate = new Date(emp.joinDate);

                // Payroll rules:
                // 1. If employee joins mid-month, pay pro-rated salary for days worked
                // 2. If employee leaves mid-month, pay pro-rated salary for days worked

                let shouldIncludeSalary = false;
                let salaryMultiplier = 1.0; // Default: full month salary

                // Check if employee had joined by the end of this month
                if (joinDate <= monthEnd) {
                    if (!emp.lastWorkingDate) {
                        // Employee is still active (or On Leave), include salary
                        shouldIncludeSalary = true;

                        // Check if they joined during this month (pro-rate salary)
                        if (joinDate >= monthStart && joinDate <= monthEnd) {
                            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                            const dayJoined = joinDate.getDate();
                            const daysWorked = daysInMonth - dayJoined + 1;
                            salaryMultiplier = daysWorked / daysInMonth;
                        }

                        // Handle Unpaid Leaves
                        // Check dates regardless of current status to ensure historical accuracy
                        if (emp.leaveStartDate && emp.leaveEndDate && emp.unpaidLeaveDays > 0) {
                            const leaveStart = new Date(emp.leaveStartDate);
                            const leaveEnd = new Date(emp.leaveEndDate);

                            // Calculate when unpaid leave starts (after paid days)
                            // Assuming paid days are taken first
                            const unpaidStart = new Date(leaveStart);
                            unpaidStart.setDate(leaveStart.getDate() + (emp.paidLeaveDays || 0));

                            // Check for overlap between Unpaid Window and Current Month
                            const overlapStart = unpaidStart > monthStart ? unpaidStart : monthStart;
                            const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;

                            if (overlapStart <= overlapEnd) {
                                const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                                const diffTime = Math.abs(overlapEnd - overlapStart);
                                const unpaidDaysInMonth = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                                // Deduct unpaid portion
                                salaryMultiplier -= (unpaidDaysInMonth / daysInMonth);
                                if (salaryMultiplier < 0) salaryMultiplier = 0;
                            }
                        }

                    } else {
                        const lastWorkingDate = new Date(emp.lastWorkingDate);

                        // If they left before this month started, don't include
                        if (lastWorkingDate < monthStart) {
                            shouldIncludeSalary = false;
                        }
                        // If they left during this month, pro-rate the salary
                        else if (lastWorkingDate >= monthStart && lastWorkingDate <= monthEnd) {
                            shouldIncludeSalary = true;

                            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

                            // If they also joined during this month
                            if (joinDate >= monthStart && joinDate <= monthEnd) {
                                // Calculate days between join and leave
                                const dayJoined = joinDate.getDate();
                                const dayLeft = lastWorkingDate.getDate();
                                const daysWorked = dayLeft - dayJoined + 1; // +1 to include both days
                                salaryMultiplier = daysWorked / daysInMonth;
                            } else {
                                // Joined before this month, calculate from month start to leave date
                                const dayLeft = lastWorkingDate.getDate();
                                salaryMultiplier = dayLeft / daysInMonth;
                            }
                        }
                        // If they left after this month, include salary
                        else if (lastWorkingDate > monthEnd) {
                            shouldIncludeSalary = true;

                            // Check if they joined during this month (pro-rate salary)
                            if (joinDate >= monthStart && joinDate <= monthEnd) {
                                const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                                const dayJoined = joinDate.getDate();
                                const daysWorked = daysInMonth - dayJoined + 1;
                                salaryMultiplier = daysWorked / daysInMonth;
                            }
                        }
                    }
                }

                if (shouldIncludeSalary) {
                    // Convert annual salary to monthly by dividing by 12
                    const annualSalary = parseFloat(String(emp.salary).replace(/,/g, '')) || 0;
                    const monthlySalaryAmount = (annualSalary / 12) * salaryMultiplier;
                    monthlySalary += monthlySalaryAmount;
                }
            });
            salaryData.push(monthlySalary);

            // Calculate assets purchased in this month
            let monthlyAssetCost = 0;
            assets.forEach(asset => {
                if (asset.purchaseDate) {
                    const purchaseDate = new Date(asset.purchaseDate);
                    if (purchaseDate >= monthStart && purchaseDate <= monthEnd) {
                        const assetPrice = parseFloat(String(asset.price || '0').replace(/,/g, ''));
                        monthlyAssetCost += assetPrice;
                    }
                }
            });
            assetData.push(monthlyAssetCost);

            // Calculate subscription costs (active subscriptions only)
            let monthlySubscriptionCost = 0;
            subscriptions.forEach(sub => {
                const match = sub.price?.match(/\$([\d,]+\.?\d*)/);
                if (match) {
                    const cost = parseFloat(match[1].replace(/,/g, ''));

                    // Check if subscription is active
                    const isActive = sub.status === 'Active' ||
                        (Array.isArray(sub.assignedTo) && sub.assignedTo.length > 0 &&
                            sub.assignedTo.some(a => (typeof a === 'object' && a.status === 'Active') || typeof a === 'string'));

                    // Check if subscription existed during this month
                    const subStartDate = sub.startDate ? new Date(sub.startDate) : new Date(0);
                    const wasActiveThisMonth = subStartDate <= monthEnd && isActive;

                    if (wasActiveThisMonth) {
                        monthlySubscriptionCost += cost;
                    }
                }
            });
            subscriptionData.push(monthlySubscriptionCost);
        }

        return {
            labels: months,
            datasets: [
                {
                    label: 'Salaries',
                    data: salaryData,
                    backgroundColor: '#0d3b2e',
                    borderRadius: 4,
                    barThickness: 20,
                    stack: 'Stack 0',
                },
                {
                    label: 'Subscriptions',
                    data: subscriptionData,
                    backgroundColor: '#fbbf24',
                    borderRadius: 4,
                    barThickness: 20,
                    stack: 'Stack 0',
                },
                {
                    label: 'Assets',
                    data: assetData,
                    backgroundColor: '#14b8a6',
                    borderRadius: 4,
                    barThickness: 20,
                    stack: 'Stack 0',
                }
            ]
        };
    }, [employees, assets, subscriptions]);

    const monthlySpendingOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    font: { family: "'Outfit', sans-serif", size: 10 },
                    color: '#64748b',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 15
                },
                onClick: function (e, legendItem, legend) {
                    const index = legendItem.datasetIndex;
                    const chart = legend.chart;
                    const meta = chart.getDatasetMeta(index);

                    // Toggle visibility
                    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                    chart.update();

                    // Update state to track visibility
                    const datasetLabels = ['salaries', 'subscriptions', 'assets'];
                    setVisibleDatasets(prev => ({
                        ...prev,
                        [datasetLabels[index]]: !meta.hidden
                    }));
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(13, 59, 46, 0.95)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    title: function (context) {
                        return context[0].label;
                    },
                    label: function (context) {
                        // Get the actual value directly from the dataset
                        const value = context.dataset.data[context.dataIndex];
                        return `${context.dataset.label}: $${value.toLocaleString()}`;
                    },
                    footer: function (tooltipItems) {
                        // Only show total if more than one dataset is visible
                        if (tooltipItems.length <= 1) {
                            return '';
                        }

                        let total = 0;
                        tooltipItems.forEach(item => {
                            // Get the actual value for this dataset
                            const datasetIndex = item.datasetIndex;
                            const dataIndex = item.dataIndex;
                            const chart = item.chart;
                            const value = chart.data.datasets[datasetIndex].data[dataIndex];
                            total += value;
                        });
                        return `Total: $${total.toLocaleString()}`;
                    }
                },
                footerFont: {
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: {
                    font: { family: "'Outfit', sans-serif", size: 10 },
                    color: '#94a3b8',
                    callback: function (value) {
                        return '$' + (value / 1000).toFixed(0) + 'K';
                    }
                }
            },
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { family: "'Outfit', sans-serif", size: 10 }, color: '#64748b' }
            }
        }
    };


    // Scroll helper
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-2">Dashboard Overview</h2>
                <p className="text-muted mb-0">Welcome back, Admin. Here's your organization at a glance.</p>
            </div>

            {/* Section 1: Key Metrics - 4 Cards */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card
                        className="border-0 shadow-sm h-100 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #0d3b2e 0%, #145c47 100%)', cursor: 'pointer' }}
                        onClick={() => scrollToSection('employee-status-chart')}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                    <Users size={24} className="text-white" />
                                </div>
                                <div
                                    className="d-flex align-items-center gap-1 px-2 py-1 rounded"
                                    style={{
                                        background: employeeGrowthData.netChange < 0
                                            ? 'rgba(239, 68, 68, 0.2)'  // Red for negative
                                            : 'rgba(163, 230, 53, 0.2)' // Green for positive
                                    }}
                                >
                                    {employeeGrowthData.netChange < 0 ? (
                                        <TrendingDown size={14} style={{ color: '#ef4444' }} />
                                    ) : (
                                        <TrendingUp size={14} style={{ color: '#a3e635' }} />
                                    )}
                                    <span
                                        className="small fw-bold"
                                        style={{
                                            color: employeeGrowthData.netChange < 0 ? '#ef4444' : '#a3e635'
                                        }}
                                    >
                                        {employeeGrowthData.growthTrend}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold text-white">{employeeMetrics.total}</h2>
                                <p className="mb-0 text-white-50 small">TOTAL EMPLOYEES</p>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card
                        className="border-0 shadow-sm h-100 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', cursor: 'pointer' }}
                        onClick={() => scrollToSection('project-status-chart')}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                    <Briefcase size={24} className="text-white" />
                                </div>
                                <div className="d-flex align-items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                                    <span className="small fw-bold text-white">{projectMetrics.inProgress} Active</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold text-white">{projectMetrics.total}</h2>
                                <p className="mb-0 text-white-50 small">TOTAL PROJECTS</p>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card
                        className="border-0 shadow-sm h-100 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, rgb(251, 191, 36) 0%, rgb(191, 170, 60) 100%)', cursor: 'pointer' }}
                        onClick={() => scrollToSection('monthly-spending-chart')}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                    <DollarSign size={24} className="text-white" />
                                </div>
                                <div className="d-flex align-items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                                    <span className="small fw-bold text-white">Monthly</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold text-white">
                                    ${(() => {
                                        // Get current month's salary from chart data (last data point)
                                        const lastIndex = monthlySpendingData.datasets[0].data.length - 1;
                                        const currentMonthSalary = monthlySpendingData.datasets[0].data[lastIndex] || 0;
                                        return currentMonthSalary.toLocaleString();
                                    })()}
                                </h2>
                                <p className="mb-0 text-white-50 small">EMPLOYEE PAYROLL</p>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card
                        className="border-0 shadow-sm h-100 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)', cursor: 'pointer' }}
                        onClick={() => scrollToSection('subscription-status-chart')}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                                    <CreditCard size={24} className="text-white" />
                                </div>
                                <div className="d-flex align-items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                                    <span className="small fw-bold text-white">Monthly</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-1 fw-bold text-white">${(subscriptionCostMetrics.totalMonthlyCost || (subscriptionMetrics.total * 50)).toLocaleString()}</h2>
                                <p className="mb-0 text-white-50 small">SUBSCRIPTIONS + ASSETS</p>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Section 2: Analytics Charts - 2 Rows */}
            <Row className="g-4 mb-4">
                {/* Employee Status */}
                <Col lg={4} id="employee-status-chart">
                    <SectionCard title="Employee Status" icon={Users} color="primary" link="/employees">
                        <Row>
                            <Col md={6}>
                                <div style={{ height: '220px' }}>
                                    <Doughnut
                                        data={{
                                            ...employeeChartData,
                                            datasets: [{
                                                ...employeeChartData.datasets[0],
                                                backgroundColor: ['#0d3b2e', '#fbbf24', '#ef4444'],
                                                borderWidth: 0,
                                            }]
                                        }}
                                        options={{
                                            ...employeeChartOptions,
                                            animation: false,
                                            cutout: '65%',
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: 'bottom',
                                                    labels: {
                                                        font: { family: "'Outfit', sans-serif", size: 10 },
                                                        color: '#64748b',
                                                        padding: 8,
                                                        usePointStyle: true,
                                                        pointStyle: 'circle'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(13, 59, 46, 0.95)',
                                                    padding: 12,
                                                    cornerRadius: 8,
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="h-100 d-flex flex-column justify-content-center">
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">Active</span>
                                            <span className="fw-bold" style={{ color: '#0d3b2e' }}>{employeeMetrics.active}</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar" style={{ width: `${(employeeMetrics.active / employeeMetrics.total) * 100}%`, backgroundColor: '#0d3b2e' }}></div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">On Leave</span>
                                            <span className="fw-bold" style={{ color: '#fbbf24' }}>{employeeMetrics.onLeave}</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar" style={{ width: `${(employeeMetrics.onLeave / employeeMetrics.total) * 100}%`, backgroundColor: '#fbbf24' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">Inactive</span>
                                            <span className="fw-bold" style={{ color: '#ef4444' }}>{employeeMetrics.inactive}</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar" style={{ width: `${(employeeMetrics.inactive / employeeMetrics.total) * 100}%`, backgroundColor: '#ef4444' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </SectionCard>
                </Col>

                {/* Project Status */}
                <Col lg={4} id="project-status-chart">
                    <SectionCard title="Project Status" icon={Briefcase} color="success" link="/projects">
                        <div style={{ height: '220px' }}>
                            <Bar
                                data={{
                                    ...projectChartData,
                                    datasets: [{
                                        ...projectChartData.datasets[0],
                                        backgroundColor: ['#10b981', '#81C14B', '#0d3b2e', '#d6a323'],
                                        borderRadius: 8,
                                        barThickness: 40
                                    }]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    animation: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(13, 59, 46, 0.95)',
                                            padding: 12,
                                            cornerRadius: 8,
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            grid: { display: false },
                                            ticks: { font: { family: "'Outfit', sans-serif", size: 11 }, color: '#94a3b8' }
                                        },
                                        y: {
                                            grid: { display: false },
                                            ticks: { font: { family: "'Outfit', sans-serif", size: 11 }, color: '#64748b' }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </SectionCard>
                </Col>

                {/* Monthly Spending Breakdown */}
                <Col lg={4} id="monthly-spending-chart">
                    <SectionCard title="Monthly Spending" icon={DollarSign} color="warning">
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">Total Monthly Cost</span>
                                <span className="h5 mb-0 fw-bold" style={{ color: '#fbbf24' }}>
                                    ${(() => {
                                        // Get the last month's data from the chart (current month = January)
                                        let total = 0;
                                        const lastIndex = monthlySpendingData.datasets[0].data.length - 1;

                                        if (visibleDatasets.salaries) {
                                            total += monthlySpendingData.datasets[0].data[lastIndex] || 0;
                                        }
                                        if (visibleDatasets.subscriptions) {
                                            total += monthlySpendingData.datasets[1].data[lastIndex] || 0;
                                        }
                                        if (visibleDatasets.assets) {
                                            total += monthlySpendingData.datasets[2].data[lastIndex] || 0;
                                        }
                                        return total.toLocaleString();
                                    })()}
                                </span>
                            </div>
                        </div>
                        <div style={{ height: '220px' }}>
                            <Bar data={monthlySpendingData} options={monthlySpendingOptions} />
                        </div>
                    </SectionCard>
                </Col>
            </Row>

            {/* Section 3: Department & Subscriptions */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <SectionCard title="Department Distribution" icon={Building2} color="primary" link="/employees">
                        <div style={{ height: '280px' }}>
                            <Bar
                                data={{
                                    ...departmentChartData,
                                    datasets: [{
                                        ...departmentChartData.datasets[0],
                                        backgroundColor: ['#0d3b2e', '#145c47', '#10b981', '#14b8a6', '#a3e635'],
                                        borderRadius: 8,
                                        barThickness: 35
                                    }]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    animation: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(13, 59, 46, 0.95)',
                                            padding: 12,
                                            cornerRadius: 8,
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(148, 163, 184, 0.1)' },
                                            ticks: { font: { family: "'Outfit', sans-serif", size: 12 }, color: '#94a3b8' }
                                        },
                                        y: {
                                            grid: { display: false },
                                            ticks: { font: { family: "'Outfit', sans-serif", size: 12 }, color: '#64748b', padding: 10 }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </SectionCard>
                </Col>
                <Col lg={4} id="subscription-status-chart">
                    <SectionCard title="Subscription Status" icon={CreditCard} color="info" link="/subscriptions">
                        <div style={{ height: '280px' }}>
                            <Pie
                                data={subscriptionChartData}
                                options={subscriptionChartOptions}
                            />
                        </div>
                    </SectionCard>
                </Col>
            </Row>

            {/* Section 4: Growth & Alerts - 2 Columns */}
            <Row className="g-4">
                {/* Employee Growth Trend */}
                <Col lg={8}>
                    <SectionCard title="Employee Growth Trend" icon={TrendingUp} color="info">
                        <div className="mb-3">
                            <Row>
                                <Col xs={6}>
                                    <div>
                                        <span className="text-muted d-block small mb-1">12-Mo Trajectory</span>
                                        <span className="h5 fw-bold" style={{ color: '#14b8a6' }}>
                                            {employeeGrowthData.currentTotal} Employees
                                        </span>
                                    </div>
                                </Col>
                                <Col xs={6} className="text-end">
                                    <div>
                                        <span className="text-muted d-block small mb-1">Growth Trend</span>
                                        <span className={`h5 fw-bold ${employeeGrowthData.netChange < 0 ? 'text-danger' : 'text-success'}`}>
                                            {employeeGrowthData.growthTrend}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div style={{ height: '200px' }}>
                            <Line data={growthChartData} options={growthChartOptions} />
                        </div>
                    </SectionCard>
                </Col>

                {/* Alerts & Action Items */}
                <Col lg={4}>
                    <SectionCard title="Alerts & Action Items" icon={AlertCircle} color="warning">
                        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                            {alerts.map((alert, index) => {
                                // Determine colors based on alert type
                                const getAlertColors = (type) => {
                                    switch (type) {
                                        case 'warning':
                                            return {
                                                bg: 'rgba(220, 38, 38, 0.1)',
                                                border: 'rgba(220, 38, 38, 0.2)',
                                                icon: '#dc2626',
                                                badge: '#dc2626'
                                            };
                                        case 'info':
                                            return {
                                                bg: 'rgba(251, 191, 36, 0.1)',
                                                border: 'rgba(251, 191, 36, 0.2)',
                                                icon: '#fbbf24',
                                                badge: '#fbbf24'
                                            };
                                        case 'danger':
                                        default:
                                            return {
                                                bg: 'rgba(220, 38, 38, 0.1)',
                                                border: 'rgba(220, 38, 38, 0.2)',
                                                icon: '#dc2626',
                                                badge: '#dc2626'
                                            };
                                    }
                                };

                                const colors = getAlertColors(alert.type);

                                return (
                                    <div
                                        key={index}
                                        className="d-flex align-items-start gap-2 p-2 mb-2 rounded"
                                        style={{
                                            background: colors.bg,
                                            border: `1px solid ${colors.border}`
                                        }}
                                    >
                                        <div className="mt-1">
                                            <AlertCircle size={14} style={{ color: colors.icon }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '0.8rem', lineHeight: '1.3' }}>{alert.message}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{alert.action}</div>
                                        </div>
                                        <div>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: colors.badge,
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    padding: '0.25rem 0.5rem'
                                                }}
                                            >
                                                {alert.type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
