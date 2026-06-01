import React from 'react';
import { FilePlus2, UserPlus, FileText, Landmark, Users } from 'lucide-react';

export default function QuickActions({ onAddProperty, onAddCustomer, onSellProperty, userRole = 'Agent' }) {
  const isManager = userRole === 'Manager' || userRole === 'Super Admin';
  const actions = [
    {
      id: 'add-property',
      label: 'Add New Property',
      icon: FilePlus2,
      colorClass: 'blue',
      handler: onAddProperty
    },
    {
      id: 'add-customer',
      label: 'Add Customer',
      icon: UserPlus,
      colorClass: 'green',
      handler: onAddCustomer
    },
    ...(isManager ? [{
      id: 'sell-property',
      label: 'Sell Property Deal',
      icon: Landmark,
      colorClass: 'teal',
      handler: onSellProperty
    }] : []),
    {
      id: 'create-agreement',
      label: 'Create Agreement',
      icon: FileText,
      colorClass: 'orange',
      handler: () => alert("📄 Agreement Builder tool opened! Select a property and customer to generate standard contract drafts.")
    },
    {
      id: 'record-payment',
      label: 'Record Payment',
      icon: Landmark,
      colorClass: 'teal',
      handler: () => alert("💳 Payment Ledger overlay active! Enter transaction receipt details to append to Revenue ledger.")
    },
    {
      id: 'lead-management',
      label: 'Lead Management',
      icon: Users,
      colorClass: 'purple',
      handler: () => alert("👥 Opening CRM Sales Pipeline boards to manage lead tags and agent allocations.")
    }
  ];

  return (
    <div className="quick-actions-section">
      <h3>Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className={`quick-action-card ${action.colorClass}`}
              onClick={action.handler}
            >
              <div className="quick-action-icon">
                <Icon size={20} />
              </div>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
