import './index.css';
import { renderPortal, bindPortalEvents } from './views/portal.js';
import { renderAuth, bindAuthEvents } from './views/auth.js';
import { renderPropertyDashboard, bindPropertyEvents } from './views/propertyDashboard.js';
import { renderPharmacyDashboard, bindPharmacyEvents } from './views/pharmacyDashboard.js';

// Default baseline fallback data
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

// Global Application State Object
export const AppState = {
  isAuthenticated: localStorage.getItem('propdeal_auth') === 'true',
  publicViewMode: 'portal', // 'portal' | 'login' | 'signup'
  userName: localStorage.getItem('propdeal_user_name') || '',
  userRole: localStorage.getItem('propdeal_user_role') || 'Agent',
  userId: localStorage.getItem('propdeal_user_id') || '',
  userAvatar: localStorage.getItem('propdeal_user_avatar') || 'kaira_logo.svg',
  currentModule: localStorage.getItem('propdeal_app_module') || 'PropertyDealer',
  activeTab: 'dashboard',
  searchQuery: '',
  sidebarOpen: false,
  
  properties: defaultProperties,
  leads: defaultLeads,
  agents: defaultAgents,
  requirements: defaultRequirements,
  visits: defaultVisits,
  deals: defaultDeals,
  isServerActive: false,

  generatedInvoiceData: null,
  selectedPropertyToSell: null,
  showAddPropertyModal: false,
  showAddCustomerModal: false,
  showAddVisitModal: false,
  showAddReqModal: false,
  showInvoiceModal: false,
};

// Global Render Controller
export function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  if (!AppState.isAuthenticated) {
    if (AppState.publicViewMode === 'portal') {
      root.innerHTML = renderPortal(AppState);
      bindPortalEvents();
    } else {
      root.innerHTML = renderAuth(AppState);
      bindAuthEvents();
    }
  } else {
    if (AppState.currentModule === 'Pharmacy') {
      root.innerHTML = renderPharmacyDashboard(AppState);
      bindPharmacyEvents();
    } else {
      root.innerHTML = renderPropertyDashboard(AppState);
      bindPropertyEvents();
    }
  }
}

// Global API Synchronizer
export async function syncAppData() {
  try {
    const resProps = await fetch('http://127.0.0.1:5000/api/properties');
    if (!resProps.ok) throw new Error('API fetch failed');
    AppState.properties = await resProps.json();

    const resLeads = await fetch('http://127.0.0.1:5000/api/leads');
    AppState.leads = await resLeads.json();

    const resAgents = await fetch('http://127.0.0.1:5000/api/users/agents');
    if (resAgents.ok) AppState.agents = await resAgents.json();

    const resReqs = await fetch('http://127.0.0.1:5000/api/requirements');
    if (resReqs.ok) AppState.requirements = await resReqs.json();

    const resVisits = await fetch('http://127.0.0.1:5000/api/visits');
    if (resVisits.ok) AppState.visits = await resVisits.json();

    const resDeals = await fetch('http://127.0.0.1:5000/api/deals');
    if (resDeals.ok) AppState.deals = await resDeals.json();

    AppState.isServerActive = true;
    console.log('⚡ [Vanilla Sync] Successfully loaded dynamic MySQL data.');
  } catch (error) {
    console.warn('⚠️ [Vanilla Backup] Backend offline, using initial baseline datasets.');
    AppState.isServerActive = false;
  }
  renderApp();
}

// Background Leads Poll - only for Property Dealer module, only re-render if data changed
let _lastLeadsJSON = '';
setInterval(async () => {
  if (!AppState.isAuthenticated) return;
  if (AppState.currentModule === 'Pharmacy') return; // No need to poll leads for pharmacy
  try {
    const resLeads = await fetch('http://127.0.0.1:5000/api/leads');
    if (resLeads.ok) {
      const newLeads = await resLeads.json();
      const newJSON = JSON.stringify(newLeads);
      if (newJSON !== _lastLeadsJSON) {
        _lastLeadsJSON = newJSON;
        AppState.leads = newLeads;
        renderApp();
      }
    }
  } catch (e) {}
}, 15000);

// Initialize application on page load
window.addEventListener('DOMContentLoaded', () => {
  // Sync URL hash routing
  const hash = window.location.hash;
  if (hash === '#login') {
    AppState.publicViewMode = 'login';
  } else if (hash === '#signup') {
    AppState.publicViewMode = 'signup';
  }
  syncAppData();
});

// Capture hash changes manually
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (!AppState.isAuthenticated) {
    if (hash === '#login') {
      AppState.publicViewMode = 'login';
    } else if (hash === '#signup') {
      AppState.publicViewMode = 'signup';
    } else if (hash === '#modules' || hash === '#home' || hash === '') {
      AppState.publicViewMode = 'portal';
    }
    renderApp();
  }
});
