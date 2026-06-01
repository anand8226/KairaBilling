import React from 'react';
import { TrendingUp, Users, DollarSign, Home, Calendar, Briefcase, Tag, Target } from 'lucide-react';

export default function StatsGrid({ 
  userRole = 'Agent',
  properties = [],
  leads = [],
  deals = [],
  requirements = [],
  visits = [],
  commissionEarned = 0
}) {
  
  // Format as Indian Currency (e.g. ₹45,231)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Compute stats based on database records
  const soldProperties = properties.filter(p => p.status === 'Sold');
  const soldSum = soldProperties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
  const purchasedSum = properties.reduce((sum, p) => sum + parseFloat(p.purchasePrice || 0), 0);
  const profitSum = soldProperties.reduce((sum, p) => {
    const cost = parseFloat(p.purchasePrice || 0);
    const sale = parseFloat(p.price || 0);
    return sum + (sale - cost);
  }, 0);

  const availableCount = properties.filter(p => p.status === 'Available').length;
  const plotCount = properties.filter(p => p.status === 'Available' && p.type === 'Plot').length;
  const leadsCount = leads.length;
  const visitsCount = visits.length;
  const openReqsCount = requirements.filter(r => r.status === 'Open').length;

  // Define dynamic role-specific cards matching the "Universal ERP Suite" reference mockup layout
  let cards = [];

  if (userRole === 'Super Admin') {
    cards = [
      {
        id: 'admin-sales',
        title: "Today's Sales",
        value: formatCurrency(soldSum),
        trend: "+12.5% from yesterday",
        isPositive: true,
        icon: DollarSign,
        accent: 'hsl(220, 95%, 55%)',
        bgAccent: 'rgba(30, 111, 253, 0.08)'
      },
      {
        id: 'admin-purchases',
        title: "Today's Purchase",
        value: formatCurrency(purchasedSum),
        trend: "+8.2% from yesterday",
        isPositive: true,
        icon: Briefcase,
        accent: 'hsl(35, 95%, 45%)',
        bgAccent: 'rgba(245, 158, 11, 0.08)'
      },
      {
        id: 'admin-customers',
        title: "Total Customers",
        value: new Intl.NumberFormat('en-IN').format(leadsCount),
        trend: "+6.3% from yesterday",
        isPositive: true,
        icon: Users,
        accent: 'hsl(150, 84%, 40%)',
        bgAccent: 'rgba(16, 185, 129, 0.08)'
      },
      {
        id: 'admin-profit',
        title: "Total Net Profit",
        value: formatCurrency(profitSum),
        trend: "+15.8% from yesterday",
        isPositive: true,
        icon: TrendingUp,
        accent: 'hsl(271, 81%, 50%)',
        bgAccent: 'rgba(168, 85, 247, 0.08)'
      }
    ];
  } else if (userRole === 'Manager') {
    cards = [
      {
        id: 'mgr-active-assets',
        title: "Active Listed Assets",
        value: `${availableCount} Listings`,
        trend: "+4.3% this week",
        isPositive: true,
        icon: Home,
        accent: 'hsl(220, 95%, 55%)',
        bgAccent: 'rgba(30, 111, 253, 0.08)'
      },
      {
        id: 'mgr-visits',
        title: "Scheduled Client Visits",
        value: `${visitsCount} Visits`,
        trend: "+10.2% from yesterday",
        isPositive: true,
        icon: Calendar,
        accent: 'hsl(271, 81%, 50%)',
        bgAccent: 'rgba(168, 85, 247, 0.08)'
      },
      {
        id: 'mgr-reqs',
        title: "Open Buy Requirements",
        value: `${openReqsCount} Reqs`,
        trend: "+5.1% this week",
        isPositive: true,
        icon: Target,
        accent: 'hsl(35, 95%, 45%)',
        bgAccent: 'rgba(245, 158, 11, 0.08)'
      },
      {
        id: 'mgr-commission',
        title: "ERP Brokerage Earned",
        value: formatCurrency(commissionEarned),
        trend: "+12.6% this month",
        isPositive: true,
        icon: DollarSign,
        accent: 'hsl(150, 84%, 40%)',
        bgAccent: 'rgba(16, 185, 129, 0.08)'
      }
    ];
  } else {
    // Default Agent stats
    const myDeals = deals.length;
    const myCommission = commissionEarned;
    const myLeads = leads.filter(l => l.assignedTo !== 'Unassigned').length;

    cards = [
      {
        id: 'agent-deals',
        title: "My Closed Deals",
        value: `${myDeals} Closed`,
        trend: "+8.5% this quarter",
        isPositive: true,
        icon: Briefcase,
        accent: 'hsl(150, 84%, 40%)',
        bgAccent: 'rgba(16, 185, 129, 0.08)'
      },
      {
        id: 'agent-commission',
        title: "My Brokerage Earned",
        value: formatCurrency(myCommission),
        trend: "+14.2% this month",
        isPositive: true,
        icon: DollarSign,
        accent: 'hsl(220, 95%, 55%)',
        bgAccent: 'rgba(30, 111, 253, 0.08)'
      },
      {
        id: 'agent-leads',
        title: "My Assigned Leads",
        value: `${myLeads} CRM Leads`,
        trend: "+7.4% this week",
        isPositive: true,
        icon: Users,
        accent: 'hsl(271, 81%, 50%)',
        bgAccent: 'rgba(168, 85, 247, 0.08)'
      },
      {
        id: 'agent-plots',
        title: "Available Sector Plots",
        value: `${plotCount} Plots`,
        trend: "+2.8% from yesterday",
        isPositive: true,
        icon: Home,
        accent: 'hsl(35, 95%, 45%)',
        bgAccent: 'rgba(245, 158, 11, 0.08)'
      }
    ];
  }

  return (
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.id} 
            className="stat-card" 
            style={{ 
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fade-in 0.3s ease-out'
            }}
          >
            {/* Soft decorative glow ring */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: card.bgAccent,
              filter: 'blur(10px)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)' }}>{card.title}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-1px' }}>{card.value}</span>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: card.bgAccent,
                color: card.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', marginTop: '4px' }}>
              <TrendingUp size={14} style={{ color: 'var(--success-icon)' }} />
              <span style={{ color: 'var(--success-text)', fontWeight: '700' }}>{card.trend.split(' ')[0]}</span>
              <span style={{ color: 'var(--text-light)' }}>{card.trend.slice(card.trend.indexOf(' '))}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
