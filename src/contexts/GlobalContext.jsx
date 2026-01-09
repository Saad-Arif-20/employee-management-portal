import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    employeeService,
    projectService,
    assetService,
    subscriptionService
} from '../services/api.service';

const GlobalContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Fetch all data from API
    const fetchAllData = async () => {
        // Check if user is authenticated by checking for token
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, skipping data fetch');
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching data from API...');

            const [employeesRes, projectsRes, assetsRes, subscriptionsRes] = await Promise.all([
                employeeService.getAll(),
                projectService.getAll(),
                assetService.getAll(),
                subscriptionService.getAll()
            ]);

            console.log('API Responses:', {
                employees: employeesRes,
                projects: projectsRes,
                assets: assetsRes,
                subscriptions: subscriptionsRes
            });

            // Map _id to id for frontend compatibility
            const mapData = (items) => items.map(item => {
                const mapped = {
                    ...item,
                    id: item._id || item.id
                };

                // Handle populated fields - convert back to IDs for frontend compatibility
                if (mapped.lead && typeof mapped.lead === 'object') {
                    mapped.leadName = mapped.lead.name;
                    mapped.lead = mapped.lead._id || mapped.lead.id;
                }

                if (mapped.team && Array.isArray(mapped.team)) {
                    mapped.teamMembers = mapped.team.map(t => ({
                        id: t._id || t.id,
                        name: t.name,
                        employeeId: t.employeeId
                    }));
                    mapped.team = mapped.team.map(t => t._id || t.id);
                }

                if (mapped.assignedTo) {
                    if (typeof mapped.assignedTo === 'object' && !Array.isArray(mapped.assignedTo)) {
                        mapped.assignedToName = mapped.assignedTo.name;
                        mapped.assignedTo = mapped.assignedTo._id || mapped.assignedTo.id;
                    } else if (Array.isArray(mapped.assignedTo)) {
                        mapped.assignedToDetails = mapped.assignedTo.map(a => ({
                            employee: a.employee?._id || a.employee,
                            status: a.status,
                            startDate: a.startDate
                        }));
                    }
                }

                if (mapped.reportingTo && typeof mapped.reportingTo === 'object') {
                    mapped.reportingToName = mapped.reportingTo.name;
                    mapped.reportingTo = mapped.reportingTo._id || mapped.reportingTo.id;
                }

                return mapped;
            });

            setEmployees(mapData(employeesRes.data || []));
            setProjects(mapData(projectsRes.data || []));
            setAssets(mapData(assetsRes.data || []));
            setSubscriptions(mapData(subscriptionsRes.data || []));
            setIsDataLoaded(true);

            console.log('Data loaded successfully!');
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount and when token changes
    useEffect(() => {
        console.log('GlobalContext mounted');
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);

        if (token) {
            console.log('Token found, fetching data immediately...');
            fetchAllData();
        } else {
            console.log('No token found, skipping data fetch');
        }

        // Listen for storage changes (login/logout)
        const handleStorageChange = (e) => {
            console.log('Storage changed:', e.key);
            if (e.key === 'token') {
                const newToken = localStorage.getItem('token');
                if (newToken) {
                    console.log('New token detected, fetching data...');
                    fetchAllData();
                } else {
                    console.log('Token removed, clearing data...');
                    setEmployees([]);
                    setProjects([]);
                    setAssets([]);
                    setSubscriptions([]);
                    setIsDataLoaded(false);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for a custom event we'll dispatch after login
        const handleLoginEvent = () => {
            console.log('Login event received, fetching data...');
            fetchAllData();
        };

        window.addEventListener('userLoggedIn', handleLoginEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleLoginEvent);
        };
    }, []);

    // Employee CRUD
    const addEmployee = async (employeeData) => {
        try {
            const response = await employeeService.create(employeeData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add employee' };
        }
    };

    const updateEmployee = async (id, employeeData) => {
        try {
            const response = await employeeService.update(id, employeeData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to update employee' };
        }
    };

    const removeEmployee = async (id) => {
        try {
            const response = await employeeService.delete(id);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing employee:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to remove employee' };
        }
    };

    // Project CRUD
    const addProject = async (projectData) => {
        try {
            const response = await projectService.create(projectData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding project:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add project' };
        }
    };

    const updateProject = async (id, projectData) => {
        try {
            const response = await projectService.update(id, projectData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating project:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to update project' };
        }
    };

    const removeProject = async (id) => {
        try {
            const response = await projectService.delete(id);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing project:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to remove project' };
        }
    };

    // Asset CRUD
    const addAsset = async (assetData) => {
        try {
            const response = await assetService.create(assetData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding asset:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add asset' };
        }
    };

    const addAssets = async (assetsArray) => {
        try {
            // Create assets one by one
            for (const assetData of assetsArray) {
                await assetService.create(assetData);
            }
            await fetchAllData();
            return { success: true };
        } catch (error) {
            console.error('Error adding assets:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add assets' };
        }
    };

    const updateAsset = async (id, assetData) => {
        try {
            const response = await assetService.update(id, assetData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating asset:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to update asset' };
        }
    };

    const removeAsset = async (id) => {
        try {
            const response = await assetService.delete(id);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing asset:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to remove asset' };
        }
    };

    // Subscription CRUD
    const addSubscription = async (subscriptionData) => {
        try {
            const response = await subscriptionService.create(subscriptionData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding subscription:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to add subscription' };
        }
    };

    const updateSubscription = async (subscriptionData) => {
        try {
            const response = await subscriptionService.update(subscriptionData.id || subscriptionData._id, subscriptionData);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to update subscription' };
        }
    };

    const removeSubscription = async (id) => {
        try {
            const response = await subscriptionService.delete(id);
            if (response.success) {
                await fetchAllData();
                return { success: true };
            }
        } catch (error) {
            console.error('Error removing subscription:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to remove subscription' };
        }
    };

    return (
        <GlobalContext.Provider value={{
            employees,
            projects,
            subscriptions,
            assets,
            loading,
            addEmployee,
            updateEmployee,
            removeEmployee,
            addProject,
            updateProject,
            removeProject,
            addSubscription,
            updateSubscription,
            removeSubscription,
            addAsset,
            addAssets,
            updateAsset,
            removeAsset,
            refreshData: fetchAllData
        }}>
            {children}
        </GlobalContext.Provider>
    );
};
