import React from 'react';
import { Home, Users, Target, CheckCircle2, DollarSign } from 'lucide-react';

export default function StatsGrid({ 
  totalProperties = 0,
  totalBuyers = 0,
  openRequirements = 0,
  closedDeals = 0,
  commissionEarned = 0
}) {
  // Format revenue as Indian Currency (e.g., ₹4,75,00,000)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const stats = [
    {
      id: 'total-properties',
      title: 'Total Properties',
      value: totalProperties,
      subtext: 'Asset Listings Database',
      icon: Home,
      colorClass: 'blue'
    },
    {
      id: 'total-buyers',
      title: 'Total Buyers',
      value: totalBuyers,
      subtext: 'Active CRM Leads',
      icon: Users,
      colorClass: 'teal'
    },
    {
      id: 'open-requirements',
      title: 'Open Requirements',
      value: openRequirements,
      subtext: 'Inquiry Demand',
      icon: Target,
      colorClass: 'purple'
    },
    {
      id: 'closed-deals',
      title: 'Closed Deals',
      value: closedDeals,
      subtext: 'Successfully Sold',
      icon: CheckCircle2,
      colorClass: 'green'
    },
    {
      id: 'commission-earned',
      title: 'Commission Earned',
      value: formatCurrency(commissionEarned),
      subtext: 'Company Brokerage',
      icon: DollarSign,
      colorClass: 'orange',
      isCurrency: true
    }
  ];

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className={`stat-card ${stat.colorClass}`} style={{ animation: 'fade-in 0.3s ease-out' }}>
            <div className="stat-card-row">
              <div className="stat-icon-wrapper">
                {stat.isCurrency ? (
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>₹</span>
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800' }}>{stat.value}</div>
            </div>
            <div className="stat-title" style={{ fontSize: '12.5px', marginTop: '8px' }}>{stat.title}</div>
            <div className="stat-subtext" style={{ fontSize: '11px' }}>{stat.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}

