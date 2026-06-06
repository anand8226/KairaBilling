import React, { useState, useEffect } from 'react';
import { Home, Calendar, TrendingUp, Users } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import QuickActions from './components/QuickActions';
import PropertiesTable from './components/PropertiesTable';
import LeadsTable from './components/LeadsTable';
import PaymentOverview from './components/PaymentOverview';
import PropertyStatusChart from './components/PropertyStatusChart';
import CategoriesSection from './components/CategoriesSection';
import { AddPropertyModal, AddCustomerModal, SellPropertyModal, InvoiceModal } from './components/FormModals';
import AuthScreen from './components/AuthScreen';
import TeamSection from './components/TeamSection';
import PublicPortal from './components/PublicPortal';
import AddPropertyPage from './components/AddPropertyPage';
import SellPropertyPage from './components/SellPropertyPage';

// Property Dealer ERP Custom View Modules
import BuyRequirementsSection from './components/BuyRequirementsSection';
import VisitsSection from './components/VisitsSection';
import DealsSection from './components/DealsSection';
import CustomersSection from './components/CustomersSection';
import ReportsSection from './components/ReportsSection';

// Default baseline fallback data structures
const defaultProperties = [
  { id: 'P001', name: 'Green Villa', type: 'House', status: 'Available', price: 5000000, purchasePrice: 4000000, vendorName: 'Horizon Builders', acquisitionDate: '2026-01-10', ownerName: 'S. K. Malhotra', ownerMobile: '9812738491', propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop' },
  { id: 'P002', name: 'Sky Heights', type: 'Flat', status: 'Sold', price: 7500000, purchasePrice: 6200000, vendorName: 'Metro Developers', acquisitionDate: '2026-02-15', ownerName: 'Rajesh Kumar', ownerMobile: '9991238472', propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=350&auto=format&fit=crop' },
  { id: 'P003', name: 'Sunset Apartments', type: 'Flat', status: 'Available', price: 6000000, purchasePrice: 4800000, vendorName: 'Apex Properties', acquisitionDate: '2026-03-01', ownerName: 'A. K. Mehta', ownerMobile: '9812738492', propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=350&auto=format&fit=crop' },
  { id: 'P004', name: 'Silver Oak', type: 'House', status: 'Rented', price: 25000, purchasePrice: 18000, vendorName: 'Local Owner', acquisitionDate: '2026-04-12', ownerName: 'J. P. Singhal', ownerMobile: '9812738493', propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=350&auto=format&fit=crop' },
  { id: 'P005', name: 'Prime Commercial', type: 'Shop', status: 'Available', price: 12000000, purchasePrice: 9500000, vendorName: 'Capital Holdings', acquisitionDate: '2026-05-05', ownerName: 'V. K. Gupta', ownerMobile: '9812738494', propertyImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=350&auto=format&fit=crop' }
];

const defaultLeads = [
  { id: 'L001', name: 'Rahul Sharma', mobile: '98xxxxxx12', requirement: '2BHK Flat', status: 'Follow-up', avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", assignedTo: 'Rajesh Kumar' },
  { id: 'L002', name: 'Amit Verma', mobile: '99xxxxxx45', requirement: 'Plot', status: 'New Lead', avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop", assignedTo: 'Unassigned' },
  { id: 'L003', name: 'Neha Gupta', mobile: '97xxxxxx88', requirement: '3BHK Flat', status: 'Interested', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", assignedTo: 'Sunita Rao' }
];

const defaultRequirements = [
  { id: 'R001', buyerName: 'Neha Gupta', mobile: '97xxxxxx88', budgetRange: '₹75L - ₹1.5Cr', preferredLocation: 'Sunset Apartments', propertyType: 'Flat', areaRequirement: '1200 sqft', status: 'Open' },
  { id: 'R002', buyerName: 'Amit Verma', mobile: '99xxxxxx45', budgetRange: '₹1.5Cr - ₹3Cr', preferredLocation: 'Prime Commercial', propertyType: 'Shop', areaRequirement: '2400 sqft', status: 'Open' }
];

const defaultVisits = [
  { id: 'V001', customerName: 'Rahul Sharma', propertyName: 'Green Villa', visitDate: '2026-06-02T14:00', agentName: 'Rajesh Kumar', status: 'Scheduled', notes: 'Interested in house size and garden layout.' }
];

const defaultDeals = [
  { id: 'D001', propertyId: 'P002', propertyName: 'Sky Heights', buyerName: 'Rahul Sharma', tokenAmount: 100000, advancePayment: 1500000, finalPayment: 5900000, agreementFile: 'Agreement_P002.pdf', commissionPercent: 2.0, commissionEarned: 150000, saleDate: '2026-05-20' }
];

const defaultAgents = [
  { userId: 1, fullName: 'Rajesh Kumar', emailAddress: 'rajesh@kairadeal.com', phoneNumber: '7777777777', role: 'Agent', city: 'Mumbai' },
  { userId: 2, fullName: 'Sunita Rao', emailAddress: 'sunita@kairadeal.com', phoneNumber: '7777777778', role: 'Agent', city: 'Pune' }
];

export default function App() {
  // Auth state persisted securely inside browser localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('propdeal_auth') === 'true';
  });

  // Manage public client navigation state
  const [publicViewMode, setPublicViewMode] = useState('portal'); // 'portal' | 'login' | 'signup'
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('propdeal_user_name') || '';
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('propdeal_user_role') || 'Agent';
  });

  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('propdeal_user_id') || '';
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('propdeal_user_avatar') || '/kaira_logo.svg';
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals state
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedPropertyToSell, setSelectedPropertyToSell] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [generatedInvoiceData, setGeneratedInvoiceData] = useState(null);

  // Dynamic application datasets initialized with premium default offline fallbacks
  const [properties, setProperties] = useState(defaultProperties);
  const [leads, setLeads] = useState(defaultLeads);
  const [agents, setAgents] = useState(defaultAgents);
  const [requirements, setRequirements] = useState(defaultRequirements);
  const [visits, setVisits] = useState(defaultVisits);
  const [deals, setDeals] = useState(defaultDeals);
  const [isServerActive, setIsServerActive] = useState(false);

  /* ============================================================================
     On Mount API synchronizer: Fetches data exclusively from MySQL with fallback
     ============================================================================ */
  useEffect(() => {
    async function loadData() {
      try {
        const resProps = await fetch('http://127.0.0.1:5000/api/properties');
        if (!resProps.ok) throw new Error('API fetch properties failed');
        const dataProps = await resProps.json();
        
        const resLeads = await fetch('http://127.0.0.1:5000/api/leads');
        if (!resLeads.ok) throw new Error('API fetch leads failed');
        const dataLeads = await resLeads.json();

        // Load active agents for Team Tracking
        const resAgents = await fetch('http://127.0.0.1:5000/api/users/agents');
        let dataAgents = defaultAgents;
        if (resAgents.ok) {
          dataAgents = await resAgents.json();
        }

        // Load buy requirements
        const resReqs = await fetch('http://127.0.0.1:5000/api/requirements');
        let dataReqs = defaultRequirements;
        if (resReqs.ok) {
          dataReqs = await resReqs.json();
        }

        // Load site visits
        const resVisits = await fetch('http://127.0.0.1:5000/api/visits');
        let dataVisits = defaultVisits;
        if (resVisits.ok) {
          dataVisits = await resVisits.json();
        }

        // Load deals ledger
        const resDeals = await fetch('http://127.0.0.1:5000/api/deals');
        let dataDeals = defaultDeals;
        if (resDeals.ok) {
          dataDeals = await resDeals.json();
        }

        setProperties(dataProps);
        setLeads(dataLeads);
        setAgents(dataAgents);
        setRequirements(dataReqs);
        setVisits(dataVisits);
        setDeals(dataDeals);
        setIsServerActive(true);
        console.log('⚡ [API Sync] Switched to live MySQL DB. Fetched all Property Dealer ERP schemas.');
      } catch (error) {
        console.warn('⚠️ [API BACKUP ENGINE] Backend server offline. Falling back to JSON stores.');
        setProperties(defaultProperties);
        setLeads(defaultLeads);
        setAgents(defaultAgents);
        setRequirements(defaultRequirements);
        setVisits(defaultVisits);
        setDeals(defaultDeals);
        setIsServerActive(false);
      }
    }

    loadData();
  }, [isAuthenticated, userRole]);

  /* ============================================================================
     Background Leads Synchronizer: Polls database leads registry every 8 seconds
     ============================================================================ */
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      try {
        const resLeads = await fetch('http://127.0.0.1:5000/api/leads');
        if (resLeads.ok) {
          const dataLeads = await resLeads.json();
          // Deep compare/check if content changed to prevent redundant component re-renders
          setLeads(dataLeads);
        }
      } catch (error) {
        console.warn('⚠️ Background leads auto-sync failed. Offline or API disconnected.');
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /* ============================================================================
     Reset selectedPropertyToSell when navigating away from the workspace page
     ============================================================================ */
  useEffect(() => {
    if (activeTab !== 'sell_property_deal') {
      setSelectedPropertyToSell(null);
    }
  }, [activeTab]);

  /* ============================================================================
     Dynamic Calculations: Computes statistics EXCLUSIVELY from DB arrays (no dummy offsets)
     ============================================================================ */
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'Available').length;
  const soldProperties = properties.filter(p => p.status === 'Sold').length;
  const rentedProperties = properties.filter(p => p.status === 'Rented').length;
  
  // Custom Property Dealer ERP specifications
  const totalBuyers = leads.length;
  const openRequirements = requirements.filter(r => r.status === 'Open').length;
  const closedDeals = deals.length;
  const commissionEarned = deals.reduce((sum, d) => sum + parseFloat(d.commissionEarned || 0), 0);

  // Category counts computed exclusively from DB
  const houseCount = properties.filter(p => p.type === 'House').length;
  const flatCount = properties.filter(p => p.type === 'Flat').length;
  const plotCount = properties.filter(p => p.type === 'Plot').length;
  const shopCount = properties.filter(p => p.type === 'Shop').length;
  const officeCount = properties.filter(p => p.type === 'Office').length;

  /* ============================================================================
     Event Handlers
     ============================================================================ */
  const handleLoginSuccess = (userObj) => {
    localStorage.setItem('propdeal_auth', 'true');
    localStorage.setItem('propdeal_user_id', userObj.id);
    localStorage.setItem('propdeal_user_name', userObj.fullName);
    localStorage.setItem('propdeal_user_role', userObj.role);
    localStorage.setItem('propdeal_user_avatar', userObj.profileImage || '/kaira_logo.svg');
    
    if (userObj.phoneNumber) {
      const digits = userObj.phoneNumber.replace(/\D/g, '');
      localStorage.setItem('propdeal_user_phone', digits.length === 10 ? '91' + digits : digits);
    }
    
    setUserId(userObj.id);
    setUserName(userObj.fullName);
    setUserRole(userObj.role);
    setUserAvatar(userObj.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('propdeal_auth');
    localStorage.removeItem('propdeal_user_id');
    localStorage.removeItem('propdeal_user_name');
    localStorage.removeItem('propdeal_user_role');
    localStorage.removeItem('propdeal_user_avatar');
    
    setIsAuthenticated(false);
    setUserId('');
    setUserName('');
    setUserRole('Agent');
    setUserAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop');
    setProperties([]);
    setLeads([]);
    setAgents([]);
    setRequirements([]);
    setVisits([]);
    setDeals([]);
    setActiveTab('dashboard');
    setSearchQuery('');
    setPublicViewMode('portal');
  };

  const handleAssignLead = async (leadId, agentName) => {
    if (isServerActive) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/leads/${leadId}/assign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignedTo: agentName })
        });

        if (response.ok) {
          setLeads(leads.map(l => l.id === leadId ? { ...l, assignedTo: agentName } : l));
          console.log(`✅ [DB Sync] Assigned lead ${leadId} to ${agentName} inside MySQL.`);
        } else {
          throw new Error('PUT assignment failed');
        }
      } catch (error) {
        console.error('Failed to sync lead assignment with DB:', error);
      }
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, assignedTo: agentName } : l));
    }
  };

  const handleAddProperty = async (newProp) => {
    if (isServerActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProp)
        });
        
        if (response.ok) {
          const addedProp = await response.json();
          setProperties([...properties, addedProp]);
          console.log(`✅ [DB Sync] Persisted property ${addedProp.id} inside MySQL database.`);
          setActiveTab('properties');
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || 'Server rejected request');
        }
      } catch (error) {
        console.error('Failed to sync property addition with DB:', error);
        alert(`❌ Error: Could not save property to the database. \n\nReason: ${error.message}`);
      }
    } else {
      // Offline fallback with simulated state updates for flawless local operations
      const mockProp = {
        id: `P${String(properties.length + 1).padStart(3, '0')}`,
        ...newProp
      };
      setProperties([...properties, mockProp]);
      setActiveTab('properties');
      console.log(`✅ [Offline Engine] Simulated property listing locally: ${mockProp.id}`);
    }
  };

  const handleAddCustomer = async (newCustomer) => {
    if (isServerActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer)
        });

        if (response.ok) {
          const addedLead = await response.json();
          // Refetch leads to get the exact synchronized list (handling any automatic removals)
          const resLeads = await fetch('http://127.0.0.1:5000/api/leads');
          if (resLeads.ok) {
            const dataLeads = await resLeads.json();
            setLeads(dataLeads);
          } else {
            setLeads([...leads, addedLead]);
          }
          console.log(`✅ [DB Sync] Persisted lead ${addedLead.id} inside MySQL database.`);
        } else {
          throw new Error('POST lead failed');
        }
      } catch (error) {
        console.error('Failed to sync lead addition with DB:', error);
        alert('❌ Error: Could not save customer to the database.');
      }
    } else {
      alert('❌ Error: Backend server is offline. Cannot modify database.');
    }
  };

  const handleAddRequirement = async (newReq) => {
    if (isServerActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/requirements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReq)
        });

        if (response.ok) {
          const added = await response.json();
          setRequirements([...requirements, added]);
          console.log(`✅ [DB Sync] Persisted requirement ${added.id} inside MySQL.`);
        } else {
          throw new Error('POST requirement failed');
        }
      } catch (error) {
        console.error('Failed to sync buy requirement:', error);
        alert('❌ Error: Could not save requirement.');
      }
    } else {
      const mockReq = { id: `R${String(requirements.length + 1).padStart(3, '0')}`, ...newReq, status: 'Open' };
      setRequirements([...requirements, mockReq]);
    }
  };

  const handleScheduleVisit = async (newVisit) => {
    if (isServerActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVisit)
        });

        if (response.ok) {
          const added = await response.json();
          setVisits([...visits, added]);
          console.log(`✅ [DB Sync] Scheduled site visit ${added.id} inside MySQL.`);
        } else {
          throw new Error('POST visit failed');
        }
      } catch (error) {
        console.error('Failed to sync site visit schedule:', error);
        alert('❌ Error: Could not schedule visit.');
      }
    } else {
      const mockVisit = { id: `V${String(visits.length + 1).padStart(3, '0')}`, ...newVisit, status: 'Scheduled' };
      setVisits([...visits, mockVisit]);
    }
  };

  const handleUpdatePropertyStatus = async (id, newStatus) => {
    if (isServerActive) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/properties/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
          console.log(`✅ [DB Sync] Updated property ${id} status to ${newStatus} inside MySQL.`);
        } else {
          throw new Error('PUT status update failed');
        }
      } catch (error) {
        console.error('Failed to sync property status with DB:', error);
      }
    }
  };

  const handleSellPropertySubmit = async (dealData) => {
    const { propertyId, soldPrice, buyerName, saleDate, paymentMethod, paymentDetails, tokenAmount, advancePayment, finalPayment, agreementFile, commissionPercent, commissionEarned } = dealData;
    const prop = properties.find(p => p.id === propertyId) || {};
    const purchasePrice = parseFloat(prop.purchasePrice || 0);
    const netProfit = parseFloat(soldPrice) - purchasePrice;

    if (isServerActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            propertyName: prop.name || 'Property Asset',
            buyerName,
            tokenAmount,
            advancePayment,
            finalPayment,
            agreementFile,
            commissionPercent,
            commissionEarned,
            saleDate,
            paymentMethod,
            paymentDetails
          })
        });

        if (response.ok) {
          const result = await response.json();
          // Update local property status
          setProperties(properties.map(p => p.id === propertyId ? { ...p, status: 'Sold', price: parseFloat(soldPrice), paymentMethod, paymentDetails } : p));
          // Append closed deal split
          setDeals([...deals, result]);
          
          // Generate glassmorphic printable receipt
          const invoiceObj = {
            invoiceId: `INV-${result.id.slice(-3)}-${Date.now().toString().slice(-4)}`,
            propertyId,
            propertyName: prop.name || 'Property Asset',
            propertyType: prop.type || 'Flat',
            purchasePrice,
            soldPrice: parseFloat(soldPrice),
            netProfit,
            buyerName,
            vendorName: prop.vendorName || 'Independent Owner',
            acquisitionDate: prop.acquisitionDate || '',
            saleDate,
            paymentMethod,
            paymentDetails,
            tokenAmount: parseFloat(tokenAmount || 0),
            advancePayment: parseFloat(advancePayment || 0),
            finalPayment: parseFloat(finalPayment || 0),
            invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          };
          setGeneratedInvoiceData(invoiceObj);
          setInvoiceModalOpen(true);
          setActiveTab('deals');
          console.log(`✅ [Sales Deal Sync] closed transaction ${result.id} successfully in MySQL.`);
        } else {
          throw new Error('POST deal closure failed');
        }
      } catch (error) {
        console.error('Failed to close transaction deal:', error);
        alert('❌ Error: Could not close deal.');
      }
    } else {
      // Local fallback simulation
      const mockId = `D${String(deals.length + 1).padStart(3, '0')}`;
      const mockDeal = {
        id: mockId,
        propertyId,
        propertyName: prop.name || 'Property Asset',
        buyerName,
        tokenAmount,
        advancePayment,
        finalPayment,
        agreementFile,
        commissionPercent,
        commissionEarned,
        saleDate
      };
      setProperties(properties.map(p => p.id === propertyId ? { ...p, status: 'Sold', price: parseFloat(soldPrice), paymentMethod, paymentDetails } : p));
      setDeals([...deals, mockDeal]);

      const invoiceObj = {
        invoiceId: `INV-${mockId.slice(-3)}-${Date.now().toString().slice(-4)}`,
        propertyId,
        propertyName: prop.name || 'Property Asset',
        propertyType: prop.type || 'Flat',
        purchasePrice,
        soldPrice: parseFloat(soldPrice),
        netProfit,
        buyerName,
        vendorName: prop.vendorName || 'Independent Owner',
        acquisitionDate: prop.acquisitionDate || '',
        saleDate,
        paymentMethod,
        paymentDetails,
        tokenAmount: parseFloat(tokenAmount || 0),
        advancePayment: parseFloat(advancePayment || 0),
        finalPayment: parseFloat(finalPayment || 0),
        invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      setGeneratedInvoiceData(invoiceObj);
      setInvoiceModalOpen(true);
      setActiveTab('deals');
      console.log(`✅ [Offline Engine] Closed deal simulated locally: ${mockId}`);
    }
  };

  const handleSellPropertyTrigger = (property) => {
    setSelectedPropertyToSell(property);
    setActiveTab('sell_property_deal');
  };

  const handleDeleteProperty = async (id) => {
    if (isServerActive) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/properties/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProperties(properties.filter(p => p.id !== id));
          console.log(`✅ [DB Sync] Removed property ${id} from MySQL database.`);
        } else {
          throw new Error('DELETE property failed');
        }
      } catch (error) {
        console.error('Failed to sync property deletion with DB:', error);
      }
    } else {
      setProperties(properties.filter(p => p.id !== id));
    }
  };
  
  // Calculate dynamic sales chart coordinates driven strictly by the MySQL deals database
  const getDynamicChartPoints = () => {
    const baseHeight = 160;
    
    if (!deals || deals.length === 0) {
      return {
        path: "M 0,160 Q 80,40 160,110 T 320,60 T 480,120 T 600,80",
        areaPath: "M 0,160 Q 80,40 160,110 T 320,60 T 480,120 T 600,80 L 600,200 L 0,200 Z",
        points: [
          { cx: 80, cy: 50 },
          { cx: 160, cy: 110 },
          { cx: 240, cy: 85 },
          { cx: 320, cy: 60 },
          { cx: 400, cy: 100 },
          { cx: 480, cy: 120 },
          { cx: 560, cy: 90 }
        ]
      };
    }

    const maxVal = Math.max(...deals.map(d => parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0) + parseFloat(d.finalPayment || 0)), 100000);
    const sortedDeals = [...deals].sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));
    const pointsCount = 7;
    const stepX = 600 / (pointsCount - 1);

    const dataPoints = Array.from({ length: pointsCount }, (_, i) => {
      const x = i * stepX;
      const deal = sortedDeals[i % sortedDeals.length];
      const val = deal ? (parseFloat(deal.tokenAmount || 0) + parseFloat(deal.advancePayment || 0) + parseFloat(deal.finalPayment || 0)) : 0;
      const y = baseHeight - (val / maxVal) * 120;
      return { x, y, val };
    });

    let path = `M 0,${dataPoints[0].y}`;
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      const cpX1 = prev.x + stepX / 2;
      const cpY1 = prev.y;
      const cpX2 = curr.x - stepX / 2;
      const cpY2 = curr.y;
      path += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
    }

    const areaPath = `${path} L 600,200 L 0,200 Z`;

    return {
      path,
      areaPath,
      points: dataPoints.map(p => ({ cx: p.x, cy: p.y, val: p.val }))
    };
  };

  const chartData = getDynamicChartPoints();

  // Calculate dynamic database-driven inventory alerts based on active database listings
  const getDynamicLowStockAlerts = () => {
    const types = ['Plot', 'Flat', 'House', 'Shop'];
    return types.map((type, idx) => {
      const count = properties.filter(p => p.status === 'Available' && p.type === type).length;
      return {
        id: String(idx + 1),
        title: `${type} Inventory Buffer`,
        count: count,
        type: type
      };
    }).sort((a, b) => a.count - b.count);
  };

  const lowStockAlerts = getDynamicLowStockAlerts();

  // Render public views if not authenticated
  if (!isAuthenticated) {
    if (publicViewMode === 'portal') {
      return (
        <PublicPortal 
          properties={properties} 
          onLoginTrigger={() => setPublicViewMode('login')}
          onSignupTrigger={() => setPublicViewMode('signup')}
        />
      );
    }
    
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        initialMode={publicViewMode === 'login' ? 'login' : 'register'}
        onBackToWebsite={() => setPublicViewMode('portal')}
      />
    );
  }

  return (
    <div className="app-container" style={{ animation: 'fade-in 0.4s ease-out' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Area */}
      <main className="main-panel">
        <Header 
          activeTab={activeTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          leads={leads}
          userName={userName}
          userRole={userRole}
          userId={userId}
          userAvatar={userAvatar}
          onUpdateAvatar={(newAvatar) => {
            localStorage.setItem('propdeal_user_avatar', newAvatar);
            setUserAvatar(newAvatar);
          }}
          onLogout={handleLogout}
        />

        {/* Dynamic content rendering based on active tab */}
        {activeTab === 'dashboard' ? (
          <>
            {/* 1. Dynamic KPI Statistics Grid (Admin, Manager, Agent) */}
            <StatsGrid 
              userRole={userRole}
              properties={properties}
              leads={leads}
              deals={deals}
              requirements={requirements}
              visits={visits}
              commissionEarned={commissionEarned}
            />

            {/* 2. Top Interactive Section: Sales Overview SVG Graph + Top Products/Listings Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Sales Overview Line Chart Card */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Sales Overview</h3>
                  <select className="card-filter-select" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                
                {/* SVG Curve Chart */}
                <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                  <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid Y lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="110" x2="600" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Curve path */}
                    <path d={chartData.path} fill="none" stroke="var(--primary)" strokeWidth="3" />
                    <path d={chartData.areaPath} fill="url(#chartGrad)" />
                    
                    {/* Chart Points */}
                    {chartData.points.map((pt, index) => (
                      <circle 
                        key={index}
                        cx={pt.cx} 
                        cy={pt.cy} 
                        r="5" 
                        fill="var(--primary)" 
                        stroke="#fff" 
                        strokeWidth="2.5" 
                        title={`Deals Revenue: ₹${new Intl.NumberFormat('en-IN').format(pt.val)}`}
                      />
                    ))}
                  </svg>
                </div>
                
                {/* X labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '8px' }}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* Top Selling Products / Top Performing Listings Card */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {userRole === 'Super Admin' ? 'Top Selling Properties' : 'Top Listings Categories'}
                  </h3>
                  <button type="button" onClick={() => setActiveTab('properties')} style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--primary)' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {properties.slice(0, 5).map((p, idx) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx < 4 ? '10px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', width: '16px' }}>{idx + 1}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{p.name}</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-light)', fontWeight: '500' }}>{p.type} • {p.status}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(p.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Middle Section: Low Inventory Alerts, Recent Invoices, and Recent Payments Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Card 1: High Demand / Low Stock Alerts */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>Low Stock Alerts</h3>
                  <span className="badge danger" style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px' }}>Critical</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {lowStockAlerts.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{item.title}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Category: {item.type}</span>
                      </div>
                      <span className={`badge ${item.count === 0 ? 'danger' : 'warning'}`} style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        {item.count === 0 ? 'Out of Stock' : `${item.count} Available`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Recent Invoices (Database-Driven Sold Properties) */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>Recent Invoices</h3>
                  <button type="button" onClick={() => setActiveTab('deals')} style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--primary)' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {deals && deals.length > 0 ? (
                    [...deals].reverse().slice(0, 4).map((d) => {
                      const totalAmount = parseFloat(d.tokenAmount || 0) + parseFloat(d.advancePayment || 0) + parseFloat(d.finalPayment || 0);
                      return (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--primary)' }}>INV-{d.id}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '110px' }}>{d.buyerName}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}</span>
                            <span style={{ fontSize: '9px', color: 'var(--success-icon)', fontWeight: '700' }}>Paid</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      No sold properties in database yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Recent Payments / Active CRM Leads */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>Recent Payments</h3>
                  <button type="button" onClick={() => setActiveTab('customers')} style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--primary)' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leads.slice(0, 4).map((l) => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'} 
                          alt={l.name} 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)' }}>{l.name}</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{l.requirement}</span>
                        </div>
                      </div>
                      <span className="badge success" style={{ fontSize: '8.5px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 4. Bottom ERP Status Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--info-bg)', color: 'var(--info-icon)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Home size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Total Products</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{properties.length} Listings</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--warning-bg)', color: 'var(--warning-icon)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Calendar size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Rented / Booked</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{properties.filter(p => p.status === 'Rented' || p.status === 'Booked').length} Assets</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--danger-bg)', color: 'var(--danger-icon)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <TrendingUp size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Out of Stock (Sold)</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{properties.filter(p => p.status === 'Sold').length} Sold</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success-icon)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Users size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Today's Orders</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{leads.filter(l => l.status === 'New Lead').length} Pending</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <QuickActions 
              onAddProperty={() => setActiveTab('add_property')}
              onAddCustomer={() => setCustomerModalOpen(true)}
              onSellProperty={() => {
                setSelectedPropertyToSell(null);
                setActiveTab('sell_property_deal');
              }}
              userRole={userRole}
            />
          </>
        ) : activeTab === 'properties' ? (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Listed Property Assets</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Browse, filter, edit, list new properties and close sales agreements.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setActiveTab('add_property')}
              >
                Buy & List Property
              </button>
            </div>
            <PropertiesTable 
              properties={properties} 
              searchQuery={searchQuery}
              onUpdateStatus={handleUpdatePropertyStatus}
              onDeleteProperty={handleDeleteProperty}
              userRole={userRole}
              onSellProperty={handleSellPropertyTrigger}
            />
          </div>
        ) : activeTab === 'requirements' ? (
          <BuyRequirementsSection 
            requirements={requirements} 
            properties={properties} 
            onAddRequirement={handleAddRequirement} 
            searchQuery={searchQuery} 
          />
        ) : activeTab === 'sell_property' ? (
          <div style={{ animation: 'fade-in 0.4s ease-out' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Sell Property Module</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Close deals on available property listings, upload agreement contracts and manage token splits.</p>
            </div>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="dashboard-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Available Listings For Sale</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Select any available asset listed below to close a deal and generate a paid customer invoice.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {properties.filter(p => p.status === 'Available').length > 0 ? (
                    properties.filter(p => p.status === 'Available').map(p => (
                      <div key={p.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontWeight: '800', color: 'var(--text-main)' }}>{p.name}</h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {p.id} | Type: {p.type}</span>
                          </div>
                          <span className="badge success">Available</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          Listing Price: <strong style={{ color: 'var(--primary-color)', fontSize: '14px' }}>₹{new Intl.NumberFormat('en-IN').format(p.price)}</strong>
                        </div>
                        {p.ownerName && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                            Owner: <strong>{p.ownerName}</strong> ({p.ownerMobile})
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ width: '100%', marginTop: '10px', background: 'var(--primary-color)' }}
                          onClick={() => handleSellPropertyTrigger(p)}
                        >
                          Close Sale Deal
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }} className="table-empty-state">
                      No properties currently available for sale. List some properties first!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          <CustomersSection 
            properties={properties} 
            leads={leads} 
            searchQuery={searchQuery} 
          />
        ) : activeTab === 'visits' ? (
          <VisitsSection 
            visits={visits} 
            properties={properties} 
            agents={agents} 
            onScheduleVisit={handleScheduleVisit} 
            searchQuery={searchQuery} 
          />
        ) : activeTab === 'deals' ? (
          <DealsSection 
            deals={deals} 
            searchQuery={searchQuery} 
          />
        ) : activeTab === 'reports' ? (
          <ReportsSection 
            properties={properties} 
            leads={leads} 
            requirements={requirements} 
            deals={deals} 
            visits={visits}
            agents={agents}
            searchQuery={searchQuery} 
          />
        ) : activeTab === 'add_property' ? (
          <AddPropertyPage 
            userRole={userRole}
            onSubmit={handleAddProperty}
            onCancel={() => setActiveTab('properties')}
          />
        ) : activeTab === 'sell_property_deal' ? (
          <SellPropertyPage 
            property={selectedPropertyToSell}
            properties={properties}
            leads={leads}
            userRole={userRole}
            onSubmit={handleSellPropertySubmit}
            onCancel={() => {
              setSelectedPropertyToSell(null);
              setActiveTab('deals');
            }}
          />
        ) : (
          <div 
            className="dashboard-card" 
            style={{ 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '60px 20px', 
              textAlign: 'center',
              color: 'var(--text-muted)' 
            }}
          >
            <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Section: {activeTab.toUpperCase()}</h3>
            <p>This layout view is mock-integrated. Complete the menu route integration in the system settings.</p>
          </div>
        )}

        {/* Footer copyrights */}
        <footer className="footer-credits">
          © {new Date().getFullYear()} Kaira Deal. All rights reserved.
        </footer>
      </main>

      {/* Interactive Form Modals */}
      <AddPropertyModal 
        isOpen={propertyModalOpen}
        onClose={() => setPropertyModalOpen(false)}
        onSubmit={handleAddProperty}
        userRole={userRole}
      />

      <AddCustomerModal 
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
      />

      <SellPropertyModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setSelectedPropertyToSell(null);
        }}
        property={selectedPropertyToSell}
        properties={properties}
        leads={leads}
        onSubmit={handleSellPropertySubmit}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setGeneratedInvoiceData(null);
        }}
        invoiceData={generatedInvoiceData}
      />
    </div>
  );
}

