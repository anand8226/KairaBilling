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
      handler: () => alert("⚠️ Warning: The Agreement Builder UI module has not been built yet!")
    },
    {
      id: 'record-payment',
      label: 'Record Payment',
      icon: Landmark,
      colorClass: 'teal',
      handler: () => alert("⚠️ Warning: The Payment Ledger UI module has not been built yet!")
    },
    {
      id: 'lead-management',
      label: 'Lead Management',
      icon: Users,
      colorClass: 'purple',
      handler: () => alert("⚠️ Warning: The Lead Management CRM boards UI module has not been built yet!")
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
