import React, { createContext, useState, useContext, useEffect } from 'react';
import { MOCK_EMPLOYEES, MOCK_PROJECTS, MOCK_SUBSCRIPTIONS, MOCK_ASSETS } from './mockData';

const GlobalContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    // Helper to initialize data from localStorage or fallback to mock data
    const getInitialData = (key, fallback) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    };

    // Initial Mock Data (now used as fallback)
    const [employees, setEmployees] = useState(() => getInitialData('employees', MOCK_EMPLOYEES));
    const [projects, setProjects] = useState(() => getInitialData('projects', MOCK_PROJECTS));
    const [subscriptions, setSubscriptions] = useState(() => {
        const saved = localStorage.getItem('subscriptions');
        try {
            const initial = saved ? JSON.parse(saved) : MOCK_SUBSCRIPTIONS;
            // If it's an empty array, fallback to mock data
            if (Array.isArray(initial) && initial.length === 0) return MOCK_SUBSCRIPTIONS;
            return initial;
        } catch (e) {
            console.error("Error parsing subscriptions from localStorage", e);
            return MOCK_SUBSCRIPTIONS;
        }
    });
    const [assets, setAssets] = useState(() => getInitialData('assets', MOCK_ASSETS));

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('employees', JSON.stringify(employees));
    }, [employees]);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }, [subscriptions]);

    useEffect(() => {
        localStorage.setItem('assets', JSON.stringify(assets));
    }, [assets]);

    // Data Migration Effect
    useEffect(() => {
        const needsMigration = subscriptions.some(sub => !sub.price && sub.cost);
        if (needsMigration) {
            console.log("Migrating subscriptions data...");
            setSubscriptions(prev => prev.map(sub => ({
                ...sub,
                price: sub.price || sub.cost || "$0.00/mo"
            })));
        }
    }, []); // Run migration check only once after initial load


    // Actions
    const addEmployee = (employeeData) => {
        const { reportees, ...employee } = employeeData;
        const newId = Date.now();
        const newEmployee = { ...employee, id: newId, status: 'Active' };

        let updatedEmployees = [...employees, newEmployee];

        // If reportees were selected, update their reportingTo field
        if (reportees && reportees.length > 0) {
            updatedEmployees = updatedEmployees.map(emp => {
                if (reportees.includes(emp.id.toString())) {
                    return { ...emp, reportingTo: newId.toString() };
                }
                return emp;
            });
        }

        setEmployees(updatedEmployees);
    };

    const updateEmployee = (id, updatedData) => {
        setEmployees(prevEmployees => {
            const { reportees, ...employee } = updatedData;

            // 1. Update the specific employee
            let updatedEmployees = prevEmployees.map(emp => {
                if (String(emp.id) === String(id)) {
                    return { ...emp, ...employee };
                }
                return emp;
            });

            // 2. Update reportees relationships
            // Clear old reportees who are no longer in the list
            updatedEmployees = updatedEmployees.map(emp => {
                if (String(emp.reportingTo) === String(id) && (!reportees || !reportees.includes(String(emp.id)))) {
                    return { ...emp, reportingTo: null };
                }
                return emp;
            });

            // Set new reportees
            if (reportees && reportees.length > 0) {
                updatedEmployees = updatedEmployees.map(emp => {
                    if (reportees.includes(String(emp.id))) {
                        return { ...emp, reportingTo: String(id) };
                    }
                    return emp;
                });
            }

            return updatedEmployees;
        });
    };

    const removeEmployee = (id) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                return {
                    ...emp,
                    status: 'Inactive',
                    deleted: true,
                    lastWorkingDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
                };
            }
            return emp;
        }));
    };

    const addProject = (project) => {
        setProjects(prev => [...prev, { ...project, id: Date.now() }]);
    };

    const updateProject = (id, updatedProject) => {
        setProjects(prev => prev.map(p => p.id.toString() === id.toString() ? { ...p, ...updatedProject } : p));
    };

    const removeProject = (id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const addSubscription = (subscription) => {
        setSubscriptions(prev => [...prev, { ...subscription, id: Date.now(), assignedTo: [] }]);
    };

    const updateSubscription = (updatedSubscription) => {
        setSubscriptions(prev => prev.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub));
    };

    const removeSubscription = (id) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    };

    const addAsset = (asset) => {
        setAssets(prev => [...prev, { ...asset, id: Date.now() }]);
    };

    const addAssets = (newAssets) => {
        const assetsWithIds = newAssets.map((asset, index) => ({
            ...asset,
            id: Date.now() + index
        }));
        setAssets(prev => [...prev, ...assetsWithIds]);
    };

    const updateAsset = (id, updatedAsset) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedAsset } : a));
    };

    const removeAsset = (id) => {
        setAssets(prev => prev.filter(a => a.id !== id));
    };

    return (
        <GlobalContext.Provider value={{
            employees, addEmployee, updateEmployee, removeEmployee,
            projects, addProject, updateProject, removeProject,
            subscriptions, addSubscription, updateSubscription, removeSubscription,
            assets, addAsset, addAssets, updateAsset, removeAsset
        }}>
            {children}
        </GlobalContext.Provider>
    );
};
