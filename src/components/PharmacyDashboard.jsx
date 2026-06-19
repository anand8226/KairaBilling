import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  ClipboardList, 
  PlusCircle, 
  ShoppingCart, 
  AlertTriangle, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  Search, 
  Trash2, 
  Edit, 
  Save, 
  Plus, 
  Printer, 
  Check, 
  CreditCard, 
  DollarSign,
  User,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function PharmacyDashboard({ userName, userRole = 'Pharmacist', userAvatar, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const formatExpiry = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  };

  const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    function convert(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      return '';
    }

    let result = '';
    if (rupees === 0) {
      result = 'Zero';
    } else {
      result = convert(rupees);
    }

    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }

    return result;
  };

  const getGSTBreakdownText = (invoice) => {
    if (!invoice || !invoice.items) return '';
    const groups = {};
    const discountRatio = invoice.subTotal > 0 ? invoice.discountAmount / invoice.subTotal : 0;

    invoice.items.forEach(item => {
      const lineSub = item.quantity * item.saleRate;
      const lineDisc = lineSub * ((item.discountPercent || 0) / 100);
      const lineNetAfterItem = lineSub - lineDisc;
      const lineNetAfterAll = lineNetAfterItem * (1 - discountRatio);
      
      const lineGst = lineNetAfterAll - (lineNetAfterAll / (1 + (parseFloat(item.gstPercent || 12) / 100)));
      const lineBase = lineNetAfterAll - lineGst;
      
      const rateKey = parseFloat(item.gstPercent || 12);
      if (!groups[rateKey]) {
        groups[rateKey] = { base: 0, gst: 0 };
      }
      groups[rateKey].base += lineBase;
      groups[rateKey].gst += lineGst;
    });

    return Object.entries(groups).map(([rateStr, data]) => {
      const rate = parseFloat(rateStr);
      const cgstSgstRate = (rate / 2).toFixed(2);
      const cgstSgstAmt = (data.gst / 2).toFixed(2);
      return `GST ${data.base.toFixed(2)}*${cgstSgstRate}+${cgstSgstRate}% = ${cgstSgstAmt}SGST + ${cgstSgstAmt}CGST`;
    }).join(', ');
  };
  
  // Master lists state
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    todaySales: 0,
    todayPurchase: 0,
    totalStockValue: 0,
    expiryMedicinesCount: 0,
    lowStockCount: 0,
    outstandingAmount: 0,
    monthlySales: [0, 0, 0, 0, 0, 0],
    topMedicines: []
  });

  // Sales and purchases ledger
  const [salesList, setSalesList] = useState([]);

  // Masters active inner sub-tab ('medicines' | 'suppliers' | 'customers' | 'doctors')
  const [activeMasterSubTab, setActiveMasterSubTab] = useState('medicines');

  // Master Modals / Forms State
  const [medicineForm, setMedicineForm] = useState({ name: '', genericName: '', brandName: '', hsnCode: '3004', gstPercent: '12', batchNumber: '', expiryDate: '', mrp: '', purchaseRate: '', saleRate: '', unit: 'Strip', category: 'Tablet', stock: '0' });
  const [supplierForm, setSupplierForm] = useState({ name: '', gstNo: '', address: '', contact: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', mobile: '', address: '', doctorRef: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', regNo: '', contact: '' });
  
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Purchase Form state
  const [purchaseInvoice, setPurchaseInvoice] = useState({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    items: []
  });
  const [purchaseCartItem, setPurchaseCartItem] = useState({
    medicineId: '',
    medicineName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '0',
    freeQuantity: '0',
    purchaseRate: '0',
    saleRate: '0',
    gstPercent: '12',
    discountPercent: '0'
  });

  // Billing POS Form State
  const [posCustomerName, setPosCustomerName] = useState('Walk-in Customer');
  const [posCustomerMobile, setPosCustomerMobile] = useState('');
  const [posDoctorName, setPosDoctorName] = useState('');
  const [posPaymentMode, setPosPaymentMode] = useState('Cash');
  const [posCart, setPosCart] = useState([]);
  const [posDiscount, setPosDiscount] = useState('0'); // Overall discount %
  
  // POS Search matches
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [posSearchMatches, setPosSearchMatches] = useState([]);

  // Print invoice modal state
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [printLayout, setPrintLayout] = useState('thermal'); // 'thermal' | 'a4'
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Load datasets on mount & tab change
  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    fetchCustomers();
    fetchDoctors();
    fetchDashboardStats();
    fetchSales();
  }, [activeTab]);

  // Search logic for POS Billing
  useEffect(() => {
    if (medicineSearchQuery.trim() === '') {
      setPosSearchMatches([]);
      return;
    }
    const query = medicineSearchQuery.toLowerCase();
    const matches = medicines.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.genericName.toLowerCase().includes(query) ||
      m.brandName.toLowerCase().includes(query)
    );
    setPosSearchMatches(matches);
  }, [medicineSearchQuery, medicines]);

  /* ============================================================================
     API Sync Engine (Fetch calls)
     ============================================================================ */
  const fetchMedicines = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/medicines');
      if (res.ok) setMedicines(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/suppliers');
      if (res.ok) setSuppliers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/customers');
      if (res.ok) setCustomers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/doctors');
      if (res.ok) setDoctors(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/reports/dashboard');
      if (res.ok) setDashboardStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/sales');
      if (res.ok) setSalesList(await res.json());
    } catch (e) { console.error(e); }
  };

  /* ============================================================================
     Add Master Record Actions
     ============================================================================ */
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineForm)
      });
      if (res.ok) {
        alert('Medicine master record added successfully!');
        setMedicineForm({ name: '', genericName: '', brandName: '', hsnCode: '3004', gstPercent: '12', batchNumber: '', expiryDate: '', mrp: '', purchaseRate: '', saleRate: '', unit: 'Strip', category: 'Tablet', stock: '0' });
        setShowAddMedModal(false);
        fetchMedicines();
      } else {
        alert('Failed to add medicine');
      }
    } catch (err) { alert('Connection error'); }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      if (res.ok) {
        alert('Supplier registered successfully!');
        setSupplierForm({ name: '', gstNo: '', address: '', contact: '' });
        setShowAddSupplierModal(false);
        fetchSuppliers();
      } else {
        alert('Failed to register supplier');
      }
    } catch (err) { alert('Connection error'); }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      if (res.ok) {
        alert('Customer patient registered successfully!');
        setCustomerForm({ name: '', mobile: '', address: '', doctorRef: '' });
        setShowAddCustomerModal(false);
        fetchCustomers();
      } else {
        alert('Failed to add customer');
      }
    } catch (err) { alert('Connection error'); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorForm)
      });
      if (res.ok) {
        alert('Doctor record saved successfully!');
        setDoctorForm({ name: '', regNo: '', contact: '' });
        setShowAddDoctorModal(false);
        fetchDoctors();
      } else {
        alert('Failed to save doctor details');
      }
    } catch (err) { alert('Connection error'); }
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine record?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/pharmacy/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMedicines();
      }
    } catch (e) { alert('Connection error'); }
  };

  /* ============================================================================
     Purchase Entry Form Logic
     ============================================================================ */
  const handleAddPurchaseCartItem = () => {
    if (!purchaseCartItem.medicineId || purchaseCartItem.quantity <= 0 || purchaseCartItem.purchaseRate <= 0) {
      alert('Please select a medicine, set valid quantity and purchase rate.');
      return;
    }
    const medicine = medicines.find(m => String(m.id) === String(purchaseCartItem.medicineId));
    const newItem = {
      ...purchaseCartItem,
      medicineName: medicine.name,
      quantity: parseInt(purchaseCartItem.quantity),
      freeQuantity: parseInt(purchaseCartItem.freeQuantity),
      purchaseRate: parseFloat(purchaseCartItem.purchaseRate),
      saleRate: parseFloat(purchaseCartItem.saleRate || purchaseCartItem.purchaseRate),
      gstPercent: parseFloat(purchaseCartItem.gstPercent),
      discountPercent: parseFloat(purchaseCartItem.discountPercent)
    };
    
    setPurchaseInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset item form
    setPurchaseCartItem({
      medicineId: '',
      medicineName: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '0',
      freeQuantity: '0',
      purchaseRate: '0',
      saleRate: '0',
      gstPercent: '12',
      discountPercent: '0'
    });
  };

  const handleRemovePurchaseCartItem = (idx) => {
    setPurchaseInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handlePostPurchaseInvoice = async () => {
    if (!purchaseInvoice.supplierId || !purchaseInvoice.invoiceNumber || !purchaseInvoice.items.length) {
      alert('Please fill supplier details, invoice number and add at least one item.');
      return;
    }
    const supplier = suppliers.find(s => String(s.id) === String(purchaseInvoice.supplierId));
    
    // Calculate totals
    let gstTotal = 0;
    let discountTotal = 0;
    let grandTotal = 0;
    
    const itemsPayload = purchaseInvoice.items.map(item => {
      const itemSubtotal = item.quantity * item.purchaseRate;
      const discAmt = itemSubtotal * (item.discountPercent / 100);
      const gstAmt = (itemSubtotal - discAmt) * (item.gstPercent / 100);
      
      discountTotal += discAmt;
      gstTotal += gstAmt;
      grandTotal += (itemSubtotal - discAmt + gstAmt);

      return item;
    });

    const payload = {
      supplierId: purchaseInvoice.supplierId,
      supplierName: supplier.name,
      invoiceNumber: purchaseInvoice.invoiceNumber,
      invoiceDate: purchaseInvoice.invoiceDate,
      gstTotal,
      discountTotal,
      grandTotal,
      items: itemsPayload
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Purchase Invoice posted & stock incremented successfully!');
        setPurchaseInvoice({
          supplierId: '',
          supplierName: '',
          invoiceNumber: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          items: []
        });
        setActiveTab('dashboard');
      } else {
        alert('Failed to post purchase invoice');
      }
    } catch (err) { alert('Connection error'); }
  };

  /* ============================================================================
     POS Billing UI / Logic
     ============================================================================ */
  const handleSelectPOSMedicine = (med) => {
    if (med.stock <= 0) {
      alert('Selected drug is OUT of stock!');
      return;
    }
    // Check if already in cart
    const exists = posCart.find(item => item.medicineId === med.id);
    if (exists) {
      alert('Medicine already in billing cart. Adjust quantity in table.');
      return;
    }

    const cartItem = {
      medicineId: med.id,
      medicineName: med.name,
      batchNumber: med.batchNumber,
      expiryDate: med.expiryDate,
      saleRate: med.saleRate,
      gstPercent: med.gstPercent,
      stockLimit: med.stock,
      quantity: 1,
      discountPercent: 0,
      unit: med.unit || '1*10 Tab',
      hsnCode: med.hsnCode || '3004',
      mrp: med.mrp || med.saleRate
    };

    setPosCart([...posCart, cartItem]);
    setMedicineSearchQuery('');
    setPosSearchMatches([]);
  };

  const handleUpdateCartItemQty = (idx, qtyVal) => {
    const qty = parseInt(qtyVal) || 0;
    const updated = posCart.map((item, i) => {
      if (i === idx) {
        if (qty > item.stockLimit) {
          alert(`Insufficient stock! Maximum available is ${item.stockLimit}.`);
          return { ...item, quantity: item.stockLimit };
        }
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    setPosCart(updated);
  };

  const handleUpdateCartItemDisc = (idx, discVal) => {
    const disc = parseFloat(discVal) || 0;
    const updated = posCart.map((item, i) => {
      if (i === idx) {
        return { ...item, discountPercent: Math.max(0, Math.min(100, disc)) };
      }
      return item;
    });
    setPosCart(updated);
  };

  const handleRemoveFromCart = (idx) => {
    setPosCart(posCart.filter((_, i) => i !== idx));
  };

  // Calculate POS summary (Tax Inclusive - GST is already included in the Sale Rate)
  const getPOSSummary = () => {
    let subTotal = 0; // Gross inclusive subtotal
    let discountAmount = 0; // Total discount amount
    let gstAmount = 0; // Total inclusive GST extracted

    const overallDiscountRatio = (parseFloat(posDiscount) || 0) / 100;

    posCart.forEach(item => {
      const lineSub = item.quantity * item.saleRate;
      const lineDisc = lineSub * (item.discountPercent / 100);
      const lineNetAfterItem = lineSub - lineDisc;
      const lineNetAfterAll = lineNetAfterItem * (1 - overallDiscountRatio);
      
      // Extract GST from the net inclusive rate: Net - (Net / (1 + GST%/100))
      const lineGst = lineNetAfterAll - (lineNetAfterAll / (1 + (parseFloat(item.gstPercent) / 100)));
      
      subTotal += lineSub;
      discountAmount += lineDisc;
      gstAmount += lineGst;
    });

    const overallDiscVal = (subTotal - discountAmount) * overallDiscountRatio;
    discountAmount += overallDiscVal;

    const calculatedTotal = subTotal - discountAmount; // Tax inclusive net total
    const grandTotal = Math.round(calculatedTotal);
    const roundOff = grandTotal - calculatedTotal;

    return {
      subTotal,
      discountAmount,
      gstAmount,
      roundOff,
      grandTotal
    };
  };

  const posSummary = getPOSSummary();

  const handleCheckoutPOS = async () => {
    if (!posCart.length) {
      alert('Billing cart is empty!');
      return;
    }

    const payload = {
      customerName: posCustomerName,
      customerMobile: posCustomerMobile,
      doctorName: posDoctorName,
      subTotal: posSummary.subTotal,
      discountAmount: posSummary.discountAmount,
      gstAmount: posSummary.gstAmount,
      roundOff: posSummary.roundOff,
      grandTotal: posSummary.grandTotal,
      paymentMode: posPaymentMode,
      items: posCart
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/pharmacy/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        alert('Sales transaction completed successfully!');
        
        // Prepare print invoice object
        setActiveInvoice({
          invoiceId: `INV-PH-${data.saleId || '00'}-${Date.now().toString().slice(-4)}`,
          customerName: posCustomerName,
          customerMobile: posCustomerMobile,
          doctorName: posDoctorName,
          subTotal: posSummary.subTotal,
          discountAmount: posSummary.discountAmount,
          gstAmount: posSummary.gstAmount,
          roundOff: posSummary.roundOff,
          grandTotal: posSummary.grandTotal,
          paymentMode: posPaymentMode,
          items: posCart,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
        
        // Clear POS state
        setPosCart([]);
        setPosCustomerName('Walk-in Customer');
        setPosCustomerMobile('');
        setPosDoctorName('');
        setPosDiscount('0');
        setShowInvoiceModal(true);
      } else {
        alert('Checkout failed. Please verify medicine inventory stock levels.');
      }
    } catch (err) { alert('Checkout connection error.'); }
  };

  /* ============================================================================
     Filter and formatting helpers
     ============================================================================ */
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const getFilteredMedicines = () => {
    if (searchQuery.trim() === '') return medicines;
    const query = searchQuery.toLowerCase();
    return medicines.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.genericName.toLowerCase().includes(query) ||
      m.batchNumber.toLowerCase().includes(query)
    );
  };

  // Roles access checker helpers
  const canAccessPurchases = ['Super Admin', 'Admin'].includes(userRole);
  const canAccessLedgers = ['Super Admin'].includes(userRole);
  const canAccessReports = ['Super Admin', 'Admin'].includes(userRole);
  const canAccessMasters = ['Super Admin', 'Admin', 'Pharmacist'].includes(userRole);

  return (
    <div className="app-container" style={{ animation: 'fade-in 0.4s ease-out' }}>
      
      {/* 1. GLASSMORPHIC PHARMACY SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <img 
            src="/kaira_logo.svg" 
            alt="Kaira Pharmacy Logo" 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 10px rgba(16,185,129,0.4)',
              display: 'block'
            }} 
          />
          <div className="sidebar-brand-text">
            <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Kaira Pharmacy</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--success-icon)', letterSpacing: '0.5px' }}>PHARMA ERP</span>
              <span className="badge success" style={{ fontSize: '7.5px', padding: '1px 5px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '4px' }}>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          
          {/* Tab 1: Dashboard */}
          <a
            href="#dashboard"
            className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </a>

          {/* Tab 2: Billing (POS) */}
          <a
            href="#pos"
            className={`sidebar-menu-item ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('pos'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
          >
            <ShoppingCart size={16} />
            <span>POS Billing</span>
          </a>

          {/* Tab 3: Master Data */}
          {canAccessMasters && (
            <a
              href="#masters"
              className={`sidebar-menu-item ${activeTab === 'masters' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('masters'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <ClipboardList size={16} />
              <span>Master Records</span>
            </a>
          )}

          {/* Tab 4: Purchase Entry */}
          {canAccessPurchases && (
            <a
              href="#purchases"
              className={`sidebar-menu-item ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('purchases'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <PlusCircle size={16} />
              <span>Purchase Inward</span>
            </a>
          )}

          {/* Tab 5: Expiry Alerts */}
          <a
            href="#expiry"
            className={`sidebar-menu-item ${activeTab === 'expiry' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('expiry'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
          >
            <AlertTriangle size={16} />
            <span>Expiry Management</span>
          </a>

          {/* Tab 6: Ledgers */}
          {canAccessLedgers && (
            <a
              href="#ledgers"
              className={`sidebar-menu-item ${activeTab === 'ledgers' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('ledgers'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <BookOpen size={16} />
              <span>Accounts Ledger</span>
            </a>
          )}

          {/* Tab 7: Reports */}
          {canAccessReports && (
            <a
              href="#reports"
              className={`sidebar-menu-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
            >
              <BarChart3 size={16} />
              <span>Reports</span>
            </a>
          )}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />

          <a
            href="#logout"
            className="sidebar-menu-item"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'hsl(0, 85%, 65%)' }}
            onClick={(e) => { e.preventDefault(); onLogout(); }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </a>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Kaira Pharmacy v1.0
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="main-panel">
        
        {/* Header navigation bar */}
        <header className="header" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pharmacy Console</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
              {activeTab === 'dashboard' && "Welcome Back, " + userName}
              {activeTab === 'pos' && "Point of Sale (POS) Billing"}
              {activeTab === 'masters' && "ERP Master Registry"}
              {activeTab === 'purchases' && "Purchase Inward Registry"}
              {activeTab === 'expiry' && "Medicine Expiry Monitoring"}
              {activeTab === 'ledgers' && "Supplier & Customer Accounts"}
              {activeTab === 'reports' && "Enterprise Operations Analytics"}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeTab === 'masters' && activeMasterSubTab === 'medicines' && (
              <div className="search-bar">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search drug master catalog..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'} 
                alt={userName} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--success-icon)' }}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Renderer */}
        <div className="main-content-panel">
          
          {/* =========================================================================
              A. TAB: DASHBOARD
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div style={{ animation: 'fade-in 0.4s ease-out' }}>
              
              {/* Stats KPI Cards Grid */}
              <div className="grid-3-cols" style={{ marginBottom: '24px' }}>
                
                {/* 1. Today's Sales */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--success-icon)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Today's Sales</span>
                      <h3 className="stats-card-value">{formatINR(dashboardStats.todaySales)}</h3>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-icon)', padding: '8px', borderRadius: '8px' }}>
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                </div>

                {/* 2. Today's Purchase */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Today's Purchases</span>
                      <h3 className="stats-card-value">{formatINR(dashboardStats.todayPurchase)}</h3>
                    </div>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                      <PlusCircle size={20} />
                    </div>
                  </div>
                </div>

                {/* 3. Total Stock Value */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--warning-icon)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Total Stock Value</span>
                      <h3 className="stats-card-value">{formatINR(dashboardStats.totalStockValue)}</h3>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-icon)', padding: '8px', borderRadius: '8px' }}>
                      <ClipboardList size={20} />
                    </div>
                  </div>
                </div>

                {/* 4. Near Expiry Drugs */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--danger-icon)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Near Expiry / Expired</span>
                      <h3 className="stats-card-value">{dashboardStats.expiryMedicinesCount} Items</h3>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-icon)', padding: '8px', borderRadius: '8px' }}>
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                </div>

                {/* 5. Low Stock Alert */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--danger-icon)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Low Stock Medicines</span>
                      <h3 className="stats-card-value">{dashboardStats.lowStockCount} Drugs</h3>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-icon)', padding: '8px', borderRadius: '8px' }}>
                      <Activity size={20} />
                    </div>
                  </div>
                </div>

                {/* 6. Supplier Outstanding */}
                <div className="dashboard-card stats-card" style={{ background: '#fff', borderLeft: '4.5px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="stats-card-title">Outstanding Amount</span>
                      <h3 className="stats-card-value">{formatINR(dashboardStats.outstandingAmount)}</h3>
                    </div>
                    <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                      <BookOpen size={20} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart & Top Products row */}
              <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
                
                {/* SVG Curve Chart */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Monthly Sales Summary</h3>
                    <span style={{ fontSize: '11px', color: 'var(--success-icon)', fontWeight: '700' }}>Live MySQL Connection</span>
                  </div>
                  
                  {/* SVG Chart */}
                  <div style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '10px 0' }}>
                    {/* Simulated SVG Bar chart matching green pharmacy identity */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                      const heights = [60, 45, 80, 55, 90, 75]; // Simulated ratios
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '100%', height: `${heights[idx]}%`, background: 'linear-gradient(180deg, var(--success-icon) 0%, rgba(16,185,129,0.3) 100%)', borderRadius: '6px', transition: 'height 0.5s ease' }} />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Selling Medicines */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>Top Selling Medicines</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {dashboardStats.topMedicines && dashboardStats.topMedicines.length > 0 ? (
                      dashboardStats.topMedicines.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx < 4 ? '10px' : '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', width: '16px' }}>{idx + 1}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{m.name}</span>
                          </div>
                          <span className="badge success" style={{ fontSize: '10px', padding: '2px 8px' }}>{m.soldQty} Sold</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                        No transactions logged yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Quick actions bar */}
              <div className="dashboard-card" style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>Quick Actions Console</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none' }} onClick={() => setActiveTab('pos')}>
                    New POS Billing
                  </button>
                  {canAccessPurchases && (
                    <button type="button" className="btn btn-primary" style={{ background: 'var(--primary)', border: 'none' }} onClick={() => setActiveTab('purchases')}>
                      New Purchase Inward
                    </button>
                  )}
                  {canAccessMasters && (
                    <button type="button" className="btn btn-secondary" onClick={() => { setActiveTab('masters'); setActiveMasterSubTab('medicines'); }}>
                      Manage Medicines
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('expiry')}>
                    Check Expiry Stock
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              B. TAB: POS BILLING (INTERACTIVE CHECKOUT PANEL)
              ========================================================================= */}
          {activeTab === 'pos' && (
            <div style={{ animation: 'fade-in 0.4s ease-out' }}>
              <div className="grid-2-cols" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                
                {/* Left Side: Cart & Search */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  
                  {/* Medicine Live Search input */}
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <label className="auth-label">Search Medicine (Type Name, Generic Name or Batch) *</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', gap: '8px' }}>
                      <Search size={18} className="text-muted" />
                      <input 
                        type="text" 
                        placeholder="Search medicines in stock..." 
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        value={medicineSearchQuery}
                        onChange={(e) => setMedicineSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Dropdown list for matching medicines */}
                    {posSearchMatches.length > 0 && (
                      <div className="modal-container" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 100, maxHeight: '200px', overflowY: 'auto', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', padding: '8px' }}>
                        {posSearchMatches.map(med => (
                          <div 
                            key={med.id} 
                            style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: '4px', hover: { background: '#f8fafc' } }}
                            onClick={() => handleSelectPOSMedicine(med)}
                          >
                            <div>
                              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{med.name}</strong> <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({med.brandName})</span>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Generic: {med.genericName} | Batch: {med.batchNumber}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: '800' }}>{formatINR(med.saleRate)}</span>
                              <div style={{ fontSize: '10.5px', color: med.stock <= 10 ? 'red' : 'green', fontWeight: '700' }}>Stock: {med.stock} {med.unit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Billing Cart Table */}
                  <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>Billing Cart</h3>
                  <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Medicine Name</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>Batch</th>
                          <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>Price</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', width: '90px' }}>Qty</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', width: '80px' }}>Disc %</th>
                          <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>Total</th>
                          <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posCart.length > 0 ? (
                          posCart.map((item, idx) => {
                            const total = item.quantity * item.saleRate;
                            const discVal = total * (item.discountPercent / 100);
                            const lineTotal = total - discVal;
                            
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px', fontSize: '13px', fontWeight: '700' }}>
                                  {item.medicineName}
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Expiry: {new Date(item.expiryDate).toLocaleDateString('en-IN')}</div>
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>{item.batchNumber}</td>
                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12.5px', fontWeight: '600' }}>{formatINR(item.saleRate)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                  <input 
                                    type="number" 
                                    min="1" 
                                    max={item.stockLimit}
                                    value={item.quantity} 
                                    onChange={(e) => handleUpdateCartItemQty(idx, e.target.value)}
                                    style={{ width: '60px', padding: '4px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                  />
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="100"
                                    value={item.discountPercent} 
                                    onChange={(e) => handleUpdateCartItemDisc(idx, e.target.value)}
                                    style={{ width: '50px', padding: '4px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                  />
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12.5px', fontWeight: '700' }}>{formatINR(lineTotal)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                  <button type="button" onClick={() => handleRemoveFromCart(idx)} style={{ color: 'red', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                              Billing cart is empty. Search and add medicines above!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Right Side: Customer Details & Checkout summary */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>Transaction Checkout</h3>

                  {/* Customer name */}
                  <div className="form-group">
                    <label className="auth-label">Customer / Patient Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                    />
                  </div>

                  {/* Customer phone */}
                  <div className="form-group">
                    <label className="auth-label">Mobile Number</label>
                    <input 
                      type="tel" 
                      className="form-input"
                      placeholder="e.g. 9812xxxxxx"
                      value={posCustomerMobile}
                      onChange={(e) => setPosCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>

                  {/* Referring Doctor */}
                  <div className="form-group">
                    <label className="auth-label">Referring Doctor Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Dr. Verma"
                      value={posDoctorName}
                      onChange={(e) => setPosDoctorName(e.target.value)}
                    />
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="form-group">
                    <label className="auth-label">Payment Mode</label>
                    <select 
                      className="form-input" 
                      value={posPaymentMode}
                      onChange={(e) => setPosPaymentMode(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / Digital</option>
                      <option value="Card">Card</option>
                      <option value="Credit">Credit / Outstanding</option>
                    </select>
                  </div>

                  {/* Overall Discount Input */}
                  <div className="form-group">
                    <label className="auth-label">Overall Invoice Discount (%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" 
                      max="100"
                      value={posDiscount}
                      onChange={(e) => setPosDiscount(e.target.value)}
                    />
                  </div>

                  {/* Calculation Ledger summary */}
                  <div style={{ marginTop: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>Sub Total (Gross):</span>
                      <span>{formatINR(posSummary.subTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>Discount:</span>
                      <span style={{ color: 'red' }}>-{formatINR(posSummary.discountAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>GST Included:</span>
                      <span>₹{posSummary.gstAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                      <span>Grand Total:</span>
                      <span style={{ color: 'var(--success-icon)' }}>{formatINR(posSummary.grandTotal)}</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ background: 'var(--success-icon)', border: 'none', padding: '12px', fontWeight: '700', fontSize: '14px', width: '100%', marginTop: '10px' }}
                    onClick={handleCheckoutPOS}
                  >
                    Print & Close Invoice
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              C. TAB: MASTER DATA REGISTRY (INNER SUB-TABS)
              ========================================================================= */}
          {activeTab === 'masters' && (
            <div style={{ animation: 'fade-in 0.4s ease-out' }}>
              
              {/* Inner Sub-tab navigation */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                <button type="button" className={`btn ${activeMasterSubTab === 'medicines' ? 'btn-primary' : 'btn-secondary'}`} style={activeMasterSubTab === 'medicines' ? { background: 'var(--success-icon)', border: 'none' } : {}} onClick={() => setActiveMasterSubTab('medicines')}>Medicines</button>
                <button type="button" className={`btn ${activeMasterSubTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`} style={activeMasterSubTab === 'suppliers' ? { background: 'var(--success-icon)', border: 'none' } : {}} onClick={() => setActiveMasterSubTab('suppliers')}>Suppliers</button>
                <button type="button" className={`btn ${activeMasterSubTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`} style={activeMasterSubTab === 'customers' ? { background: 'var(--success-icon)', border: 'none' } : {}} onClick={() => setActiveMasterSubTab('customers')}>Customers / Patients</button>
                <button type="button" className={`btn ${activeMasterSubTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`} style={activeMasterSubTab === 'doctors' ? { background: 'var(--success-icon)', border: 'none' } : {}} onClick={() => setActiveMasterSubTab('doctors')}>Doctors</button>
              </div>

              {/* Sub-tab 1: Medicines Master */}
              {activeMasterSubTab === 'medicines' && (
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Medicines Master Catalog</h3>
                    <button type="button" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none' }} onClick={() => setShowAddMedModal(true)}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> Add Medicine Card
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Drug Name</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Generic Name</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Batch</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Expiry Date</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>MRP</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Sale Rate</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Stock</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredMedicines().length > 0 ? (
                          getFilteredMedicines().map(med => (
                            <tr key={med.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>
                                {med.name}
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Brand: {med.brandName} | HSN: {med.hsnCode}</div>
                              </td>
                              <td style={{ padding: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{med.genericName}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>{med.batchNumber}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>{new Date(med.expiryDate).toLocaleDateString('en-IN')}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '12.5px', fontWeight: '600' }}>{formatINR(med.mrp)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '12.5px', fontWeight: '700' }}>{formatINR(med.saleRate)}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span className={`badge ${med.stock <= 10 ? 'danger' : 'success'}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                                  {med.stock} {med.unit}
                                </span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button type="button" onClick={() => handleDeleteMedicine(med.id)} style={{ color: 'red', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              No medicines registered in catalog. Add some items above!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Suppliers Master */}
              {activeMasterSubTab === 'suppliers' && (
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Wholesale Suppliers List</h3>
                    <button type="button" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none' }} onClick={() => setShowAddSupplierModal(true)}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> Register Supplier
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Supplier Name</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>GST Number</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Address</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.length > 0 ? (
                          suppliers.map(sup => (
                            <tr key={sup.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>{sup.name}</td>
                              <td style={{ padding: '12px', fontSize: '12.5px', fontWeight: '600' }}>{sup.gstNo}</td>
                              <td style={{ padding: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{sup.address}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{sup.contact}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              No suppliers registered. Add wholesale distributors above!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Customers Master */}
              {activeMasterSubTab === 'customers' && (
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Patient Customers Registry</h3>
                    <button type="button" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none' }} onClick={() => setShowAddCustomerModal(true)}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> Add Patient Card
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Patient Name</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Mobile Number</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Residential Address</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Doctor Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.length > 0 ? (
                          customers.map(cust => (
                            <tr key={cust.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>{cust.name}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{cust.mobile}</td>
                              <td style={{ padding: '12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{cust.address}</td>
                              <td style={{ padding: '12px', fontSize: '12.5px', fontWeight: '600' }}>{cust.doctorRef || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              No patients registered. Complete registrations above!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Doctors Master */}
              {activeMasterSubTab === 'doctors' && (
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Doctors Registry Master</h3>
                    <button type="button" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none' }} onClick={() => setShowAddDoctorModal(true)}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> Save Doctor Record
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Doctor Name</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Registration Number</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Contact Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.length > 0 ? (
                          doctors.map(doc => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>{doc.name}</td>
                              <td style={{ padding: '12px', fontSize: '12.5px', fontWeight: '600' }}>{doc.regNo}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{doc.contact}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              No doctors registered. Complete registrations above!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================================
              D. TAB: PURCHASE ENTRY (INWARD MEDICINES LOG)
              ========================================================================= */}
          {activeTab === 'purchases' && (
            <div style={{ animation: 'fade-in 0.4s ease-out' }}>
              <div className="grid-2-cols" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                
                {/* Left Side: Invoice Items Entry */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-main)' }}>Add Medicine Item to Inward Invoice</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="auth-label">Select Medicine *</label>
                      <select 
                        className="form-input" 
                        value={purchaseCartItem.medicineId}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, medicineId: e.target.value })}
                      >
                        <option value="">-- Choose Medicine --</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.brandName})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="auth-label">Batch Number *</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="e.g. B-0129"
                        value={purchaseCartItem.batchNumber}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, batchNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="auth-label">Expiry Date *</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={purchaseCartItem.expiryDate}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, expiryDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="auth-label">GST Percent (%)</label>
                      <select 
                        className="form-input"
                        value={purchaseCartItem.gstPercent}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, gstPercent: e.target.value })}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="auth-label">Quantity *</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={purchaseCartItem.quantity}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, quantity: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="auth-label">Free Quantity</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={purchaseCartItem.freeQuantity}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, freeQuantity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                    <div className="form-group">
                      <label className="auth-label">Purchase Rate *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input"
                        value={purchaseCartItem.purchaseRate}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, purchaseRate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="auth-label">Expected Sale Rate</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input"
                        value={purchaseCartItem.saleRate}
                        onChange={(e) => setPurchaseCartItem({ ...purchaseCartItem, saleRate: e.target.value })}
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: '100%', borderColor: 'var(--success-icon)', color: 'var(--success-icon)', fontWeight: '700' }}
                    onClick={handleAddPurchaseCartItem}
                  >
                    Add Item to Inward Cart
                  </button>

                  {/* Cart List */}
                  <h3 style={{ fontSize: '13px', fontWeight: '800', marginTop: '24px', marginBottom: '10px', color: 'var(--text-muted)' }}>Items Added</h3>
                  <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Batch</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Rate</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseInvoice.items.length > 0 ? (
                          purchaseInvoice.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px', fontWeight: '600' }}>{item.medicineName}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{item.batchNumber}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity} + {item.freeQuantity} F</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>{formatINR(item.purchaseRate)}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button type="button" style={{ color: 'red' }} onClick={() => handleRemovePurchaseCartItem(idx)}>
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No items in cart.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Supplier details and post action */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>Invoice Inward Header</h3>

                  <div className="form-group">
                    <label className="auth-label">Wholesale Supplier *</label>
                    <select 
                      className="form-input"
                      value={purchaseInvoice.supplierId}
                      onChange={(e) => setPurchaseInvoice({ ...purchaseInvoice, supplierId: e.target.value })}
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="auth-label">Supplier Invoice Number *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. GST-1102"
                      value={purchaseInvoice.invoiceNumber}
                      onChange={(e) => setPurchaseInvoice({ ...purchaseInvoice, invoiceNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="auth-label">Invoice Date *</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={purchaseInvoice.invoiceDate}
                      onChange={(e) => setPurchaseInvoice({ ...purchaseInvoice, invoiceDate: e.target.value })}
                    />
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ background: 'var(--primary)', border: 'none', padding: '12px', fontWeight: '700', fontSize: '14px', width: '100%', marginTop: '20px' }}
                    onClick={handlePostPurchaseInvoice}
                  >
                    Post Purchase Invoice
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              E. TAB: EXPIRY MANAGEMENT (MONITOR DRUG LIFE SPANS)
              ========================================================================= */}
          {activeTab === 'expiry' && (
            <div className="dashboard-card" style={{ background: '#fff', padding: '24px', animation: 'fade-in 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Expiry & Near Expiry Monitoring</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>List of drugs already expired or expiring in the next 90 days.</p>
                </div>
                <span className="badge danger" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}>Critical View</span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Drug Name</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Batch</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Expiry Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Days Left</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Stock Qty</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.filter(m => {
                      const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 90;
                    }).length > 0 ? (
                      medicines.filter(m => {
                        const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return daysLeft <= 90;
                      }).map(m => {
                        const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpired = daysLeft <= 0;
                        return (
                          <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>{m.name}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>{m.batchNumber}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>{new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '12.5px', fontWeight: '700', color: isExpired ? 'red' : 'orange' }}>
                              {isExpired ? 'Expired' : `${daysLeft} Days`}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '12.5px', fontWeight: '600' }}>{m.stock} {m.unit}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span className={`badge ${isExpired ? 'danger' : 'warning'}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                                {isExpired ? 'DANGER: EXPIRED' : 'WARNING: NEAR EXPIRY'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          No expired or near-expiry medicines in inventory. Excellent!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              F. TAB: LEDGERS (ACCOUNTS RECEIVABLES & PAYABLES)
              ========================================================================= */}
          {activeTab === 'ledgers' && (
            <div style={{ animation: 'fade-in 0.4s ease-out' }}>
              <div className="grid-2-cols" style={{ gap: '20px' }}>
                
                {/* 1. Supplier Accounts Payable Ledger */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>Supplier Outstanding Balances</h3>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Supplier</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>GST No</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Outstanding Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.length > 0 ? (
                          suppliers.map((sup, idx) => (
                            <tr key={sup.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px', fontWeight: '700' }}>{sup.name}</td>
                              <td style={{ padding: '10px' }}>{sup.gstNo}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: 'red' }}>
                                {formatINR((idx + 1) * 8500)} {/* Simulated ledgers based on MySQL lists */}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No supplier outstanding records.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Customer Accounts Receivable Credit Ledger */}
                <div className="dashboard-card" style={{ background: '#fff', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>Customer Credit & Receivables</h3>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Patient Customer</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Mobile</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Due Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.length > 0 ? (
                          customers.map((cust, idx) => (
                            <tr key={cust.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px', fontWeight: '700' }}>{cust.name}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>{cust.mobile}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: 'orange' }}>
                                {formatINR((idx + 1) * 350)} {/* Simulated ledgers */}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No customer credit balances.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              G. TAB: REPORTS
              ========================================================================= */}
          {activeTab === 'reports' && (
            <div className="dashboard-card" style={{ background: '#fff', padding: '24px', animation: 'fade-in 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Sales Audit History Log</h3>
                <button type="button" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert('📊 Exporting Pharmacy Sales Report to Excel Spreadsheet...')}>
                  <FileSpreadsheet size={16} /> Export Sheets
                </button>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Invoice ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Patient Customer</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Doctor Ref</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Total (inc GST)</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Payment Mode</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesList.length > 0 ? (
                      salesList.map(sale => (
                        <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '700', color: 'var(--success-icon)' }}>INV-PH-{sale.id}</td>
                          <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700' }}>
                            {sale.customerName}
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Mob: {sale.customerMobile || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: '12.5px' }}>{sale.doctorName || 'Walk-in'}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '800' }}>{formatINR(sale.grandTotal)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span className="badge success" style={{ fontSize: '10.5px', padding: '2px 8px' }}>{sale.paymentMode}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {new Date(sale.saleDate).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          No sales transactions logged in database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer credits */}
        <footer className="footer-credits">
          © {new Date().getFullYear()} Kaira Pharmacy Management. All rights reserved.
        </footer>
      </main>

      {/* =========================================================================
          I. GLASSMORPHIC ADD MEDICINE MODAL
          ========================================================================= */}
      {showAddMedModal && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddMedModal(false)}>
          <div className="modal-container" style={{ maxWidth: '600px', width: '90%', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-main)' }}>Add Medicine Master Card</h3>
              <button type="button" onClick={() => setShowAddMedModal(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="auth-label">Medicine Name *</label>
                  <input type="text" className="form-input" required value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">Brand Name *</label>
                  <input type="text" className="form-input" required value={medicineForm.brandName} onChange={(e) => setMedicineForm({ ...medicineForm, brandName: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="auth-label">Generic / Chemical Name *</label>
                  <input type="text" className="form-input" required value={medicineForm.genericName} onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">Category (Form) *</label>
                  <select className="form-input" value={medicineForm.category} onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="auth-label">HSN Code *</label>
                  <input type="text" className="form-input" required value={medicineForm.hsnCode} onChange={(e) => setMedicineForm({ ...medicineForm, hsnCode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">GST Percent (%) *</label>
                  <select className="form-input" value={medicineForm.gstPercent} onChange={(e) => setMedicineForm({ ...medicineForm, gstPercent: e.target.value })}>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="auth-label">Batch Number *</label>
                  <input type="text" className="form-input" required value={medicineForm.batchNumber} onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">Expiry Date *</label>
                  <input type="date" className="form-input" required value={medicineForm.expiryDate} onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="auth-label">MRP (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={medicineForm.mrp} onChange={(e) => setMedicineForm({ ...medicineForm, mrp: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">Purchase Rate (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={medicineForm.purchaseRate} onChange={(e) => setMedicineForm({ ...medicineForm, purchaseRate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div className="form-group">
                  <label className="auth-label">Sale Rate (₹) *</label>
                  <input type="number" step="0.01" className="form-input" required value={medicineForm.saleRate} onChange={(e) => setMedicineForm({ ...medicineForm, saleRate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="auth-label">Unit Pack (e.g. Strip, Bottle) *</label>
                  <input type="text" className="form-input" required value={medicineForm.unit} onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="auth-label">Initial Opening Stock *</label>
                <input type="number" className="form-input" required value={medicineForm.stock} onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none', width: '100%', padding: '12px' }}>
                Save Medicine Master Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* J. SUPPLIER REGISTRATION MODAL */}
      {showAddSupplierModal && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddSupplierModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px', width: '90%', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Register Wholesale Supplier</h3>
              <button type="button" onClick={() => setShowAddSupplierModal(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="auth-label">Supplier / Distributor Name *</label>
                <input type="text" className="form-input" required value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Supplier GST Number *</label>
                <input type="text" className="form-input" required placeholder="e.g. 27AAAAA1111A1Z1" value={supplierForm.gstNo} onChange={(e) => setSupplierForm({ ...supplierForm, gstNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Supplier Contact Number *</label>
                <input type="tel" className="form-input" required value={supplierForm.contact} onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Supplier Office Address *</label>
                <input type="text" className="form-input" required value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none', width: '100%', padding: '12px', marginTop: '10px' }}>
                Register Supplier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* K. PATIENT REGISTRATION MODAL */}
      {showAddCustomerModal && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddCustomerModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px', width: '90%', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Register Patient Customer</h3>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="auth-label">Patient Name *</label>
                <input type="text" className="form-input" required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Mobile Number *</label>
                <input type="tel" className="form-input" required value={customerForm.mobile} onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Address *</label>
                <input type="text" className="form-input" required value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Doctor Reference</label>
                <input type="text" className="form-input" placeholder="e.g. Dr. Verma" value={customerForm.doctorRef} onChange={(e) => setCustomerForm({ ...customerForm, doctorRef: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none', width: '100%', padding: '12px', marginTop: '10px' }}>
                Register Patient Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* L. DOCTOR REGISTRATION MODAL */}
      {showAddDoctorModal && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddDoctorModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px', width: '90%', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Save Doctor Master Details</h3>
              <button type="button" onClick={() => setShowAddDoctorModal(false)} style={{ color: 'var(--text-light)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="auth-label">Doctor Name *</label>
                <input type="text" className="form-input" required value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Medical Registration No *</label>
                <input type="text" className="form-input" required placeholder="e.g. MCI-12903" value={doctorForm.regNo} onChange={(e) => setDoctorForm({ ...doctorForm, regNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="auth-label">Contact Detail *</label>
                <input type="tel" className="form-input" required value={doctorForm.contact} onChange={(e) => setDoctorForm({ ...doctorForm, contact: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--success-icon)', border: 'none', width: '100%', padding: '12px', marginTop: '10px' }}>
                Save Doctor Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* M. INVOICE RECEIPT MODAL (THERMAL & A4 PREVIEW) */}
      {showInvoiceModal && activeInvoice && (
        <div className="modal-overlay" style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-container" style={{ maxWidth: printLayout === 'a4' ? '850px' : '420px', width: '90%', padding: '28px', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', maxHeight: '95vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Sales Invoice Receipt</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className={`btn ${printLayout === 'thermal' ? 'btn-primary' : 'btn-secondary'}`} style={printLayout === 'thermal' ? { background: 'var(--success-icon)', border: 'none', padding: '3px 8px', fontSize: '11px' } : { padding: '3px 8px', fontSize: '11px' }} onClick={() => setPrintLayout('thermal')}>Thermal</button>
                <button type="button" className={`btn ${printLayout === 'a4' ? 'btn-primary' : 'btn-secondary'}`} style={printLayout === 'a4' ? { background: 'var(--success-icon)', border: 'none', padding: '3px 8px', fontSize: '11px' } : { padding: '3px 8px', fontSize: '11px' }} onClick={() => setPrintLayout('a4')}>A4 Sheet</button>
              </div>
            </div>

            {/* Print Preview panel */}
            <div id="print-area" style={{ 
              padding: printLayout === 'thermal' ? '12px' : '24px', 
              background: '#fff', 
              border: printLayout === 'thermal' ? '1px dashed #cbd5e1' : 'none', 
              borderRadius: '8px', 
              fontSize: printLayout === 'thermal' ? '11px' : '12px',
              fontFamily: printLayout === 'thermal' ? 'Courier, monospace' : 'inherit',
              color: '#000',
              boxSizing: 'border-box'
            }}>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #print-area, #print-area * {
                    visibility: visible;
                  }
                  #print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: ${printLayout === 'thermal' ? '80mm' : '100%'} !important;
                    margin: 0 !important;
                    padding: ${printLayout === 'thermal' ? '0' : '20px'} !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: #fff !important;
                  }
                  @page {
                    margin: ${printLayout === 'thermal' ? '0' : '1cm'};
                  }
                }
              `}</style>

              {printLayout === 'thermal' ? (
                /* THERMAL LAYOUT */
                <>
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>KAIRA MEDICOS</h2>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>Sector 5, Kharghar, Navi Mumbai</div>
                    <div style={{ fontSize: '11px' }}>GSTIN: 27AASDK4412M1Z5</div>
                    <div style={{ fontSize: '11px' }}>Contact: +91 8226811810</div>
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  {/* Patient details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
                    <div><strong>Invoice No:</strong> {activeInvoice.invoiceId}</div>
                    <div><strong>Date:</strong> {activeInvoice.date}</div>
                    <div><strong>Patient:</strong> {activeInvoice.customerName}</div>
                    {activeInvoice.customerMobile && <div><strong>Mobile:</strong> {activeInvoice.customerMobile}</div>}
                    {activeInvoice.doctorName && <div><strong>Doctor:</strong> {activeInvoice.doctorName}</div>}
                    <div><strong>Payment:</strong> {activeInvoice.paymentMode}</div>
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  {/* Items List */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px dashed #000' }}>
                        <th style={{ padding: '4px 0' }}>Item Description</th>
                        <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInvoice.items.map((item, index) => {
                        const total = item.quantity * item.saleRate;
                        return (
                          <tr key={index}>
                            <td style={{ padding: '4px 0' }}>
                              {item.medicineName}
                              <div style={{ fontSize: '9px', color: '#555' }}>Batch: {item.batchNumber} | Expiry: {formatExpiry(item.expiryDate)}</div>
                            </td>
                            <td style={{ padding: '4px 0', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatINR(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  {/* Summaries */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                    <div>Taxable Value: ₹{Number(activeInvoice.subTotal - activeInvoice.discountAmount - activeInvoice.gstAmount).toFixed(2)}</div>
                    {activeInvoice.discountAmount > 0 && <div style={{ color: 'red' }}>Total Discount: -₹{Number(activeInvoice.discountAmount).toFixed(2)}</div>}
                    <div>GST Included: ₹{Number(activeInvoice.gstAmount).toFixed(2)}</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>Net Payable: {formatINR(activeInvoice.grandTotal)}</div>
                  </div>

                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />

                  <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
                    *** Thank You! Get Well Soon! ***
                    <div style={{ fontSize: '8px', color: '#555', marginTop: '2px' }}>Powered by Kaira Pharmacy ERP</div>
                  </div>
                </>
              ) : (
                /* A4 SHEET LAYOUT */
                <div style={{ padding: '10px', color: '#000', lineSpacing: '1.4' }}>
                  
                  {/* Header Box Grid */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', border: '1.5px solid #000', padding: '14px' }}>
                    
                    {/* Left Store Info */}
                    <div style={{ width: '55%', fontSize: '11.5px', lineHeight: '1.4' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#000', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>KAIRA MEDICOS</h2>
                      <div>SHOP NO. 36, 37, CITY PLAZA,</div>
                      <div>GAUR CITY-1, G.B. NAGAR, U.P. (NOIDA WEST)</div>
                      <div>Phone: 8587907179, 8226811810</div>
                      <div>Email: kairamedicos@gmail.com</div>
                      <div style={{ marginTop: '4px' }}><strong>GSTIN:</strong> 09ABDFM1157A1ZP</div>
                      <div><strong>D.L. NO:</strong> UP-16-20/21/0000039</div>
                    </div>

                    {/* Right Invoice & Patient details */}
                    <div style={{ width: '42%', fontSize: '11.5px', lineHeight: '1.4', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ border: '1.5px solid #000', textAlign: 'center', fontWeight: '900', fontSize: '13px', padding: '4px', background: '#f8fafc', letterSpacing: '1px', marginBottom: '8px' }}>
                        GST INVOICE
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>Invoice No:</strong> {activeInvoice.invoiceId.replace('INV-PH-', 'A01')}</span>
                        <span><strong>Date:</strong> {activeInvoice.date.split(',')[0]}</span>
                      </div>
                      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }} />
                      <div><strong>Patient Name:</strong> {activeInvoice.customerName}</div>
                      <div><strong>Dr. Name:</strong> {activeInvoice.doctorName || 'Self / Walk-in'}</div>
                      {activeInvoice.customerMobile && <div><strong>MOB NO:</strong> {activeInvoice.customerMobile}</div>}
                    </div>

                  </div>

                  {/* Medicines Grid Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '10.5px', border: '1.5px solid #000' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #000', fontWeight: 'bold', height: '28px' }}>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '4%' }}>SN</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'left', width: '32%' }}>PRODUCT NAME</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '10%' }}>PACK</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '8%' }}>HSN</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '10%' }}>BATCH</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '8%' }}>EXP</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '5%' }}>QTY</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'right', width: '8%' }}>MRP</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'right', width: '8%' }}>RATE</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '6%' }}>DIS</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '6%' }}>SGST</th>
                        <th style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center', width: '6%' }}>CGST</th>
                        <th style={{ padding: '4px', textAlign: 'right', width: '9%' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInvoice.items.map((item, index) => {
                        const total = item.quantity * item.saleRate;
                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #000', height: '24px' }}>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>{item.medicineName}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{item.unit || '1*10 Tab'}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{item.hsnCode || '3004'}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{item.batchNumber}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{formatExpiry(item.expiryDate)}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'right' }}>{Number(item.mrp || item.saleRate).toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'right' }}>{Number(item.saleRate).toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{Number(item.discountPercent || 0).toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{(parseFloat(item.gstPercent || 12) / 2).toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid #000', padding: '4px', textAlign: 'center' }}>{(parseFloat(item.gstPercent || 12) / 2).toFixed(2)}</td>
                            <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{Number(total).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* GST breakdown note */}
                  <div style={{ fontSize: '9.5px', marginTop: '6px', padding: '5px', border: '1px solid #000', background: '#fafafa', fontStyle: 'italic' }}>
                    {getGSTBreakdownText(activeInvoice)}
                  </div>

                  {/* Footer Terms & Totals Grid */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1.5px solid #000', paddingTop: '10px' }}>
                    
                    {/* Left: Terms and Amount in Words */}
                    <div style={{ width: '58%', fontSize: '9px', lineHeight: '1.3', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong>Terms & Conditions:</strong>
                      <div>1. ALL DISPUTES ARE SUBJECT TO G.B. NAGAR JURISDICTION.</div>
                      <div>2. PRICE OF MEDICINES ARE INCLUSIVE OF ALL TAXES.</div>
                      <div>3. GOODS ONCE SOLD WILL BE TAKEN BACK WITHIN 2-3 DAYS AFTER PRESENTATION OF BILL.</div>
                      <div>4. FREE HOME DELIVERY (COMPUTER GENERATED INVOICE).</div>
                      
                      <div style={{ marginTop: '12px', fontSize: '11.5px', fontWeight: 'bold', color: '#000', textTransform: 'capitalize' }}>
                        Rs. {numberToWords(activeInvoice.grandTotal)} only
                      </div>
                    </div>

                    {/* Right: Subtotal/Discount and Signatory */}
                    <div style={{ width: '38%', display: 'flex', flexDirection: 'column', alignTarget: 'flex-end', gap: '8px' }}>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '3px 0', textAlign: 'left' }}>SUB TOTAL</td>
                            <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 'bold' }}>{Number(activeInvoice.subTotal).toFixed(2)}</td>
                          </tr>
                          {activeInvoice.discountAmount > 0 && (
                            <tr>
                              <td style={{ padding: '3px 0', textAlign: 'left', color: 'red' }}>DISCOUNT</td>
                              <td style={{ padding: '3px 0', textAlign: 'right', color: 'red', fontWeight: 'bold' }}>-{Number(activeInvoice.discountAmount).toFixed(2)}</td>
                            </tr>
                          )}
                          <tr style={{ borderTop: '1px solid #000', borderBottom: '1.5px solid #000', height: '28px' }}>
                            <td style={{ padding: '4px 0', textAlign: 'left', fontWeight: '900', fontSize: '11.5px' }}>GRAND TOTAL</td>
                            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '900', fontSize: '13px', color: 'var(--success-icon)' }}>{formatINR(activeInvoice.grandTotal)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px' }}>
                        <div>For KAIRA MEDICOS</div>
                        <div style={{ height: '36px' }}></div>
                        <div style={{ borderTop: '1px dashed #000', width: '85%', margin: '0 auto', paddingTop: '2px' }}>Authorised Signatory</div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setShowInvoiceModal(false)}
              >
                Close Preview
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ flex: 1, background: 'var(--success-icon)', border: 'none', display: 'flex', alignItems: 'center', justify: 'center', gap: '6px' }}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print Bill
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
