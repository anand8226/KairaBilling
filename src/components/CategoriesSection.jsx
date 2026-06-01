import React from 'react';
import { Home, Building2, MapPin, Store, Briefcase } from 'lucide-react';

export default function CategoriesSection({ 
  houseCount = 85, 
  flatCount = 95, 
  plotCount = 40, 
  shopCount = 15, 
  officeCount = 10 
}) {
  const categories = [
    {
      id: 'house',
      title: 'House',
      count: houseCount,
      icon: Home,
      colorClass: 'blue'
    },
    {
      id: 'flat',
      title: 'Flat / Apartment',
      count: flatCount,
      icon: Building2,
      colorClass: 'green'
    },
    {
      id: 'plot',
      title: 'Plot / Land',
      count: plotCount,
      icon: MapPin,
      colorClass: 'orange'
    },
    {
      id: 'shop',
      title: 'Commercial Shop',
      count: shopCount,
      icon: Store,
      colorClass: 'purple'
    },
    {
      id: 'office',
      title: 'Office Space',
      count: officeCount,
      icon: Briefcase,
      colorClass: 'red'
    }
  ];

  return (
    <div className="dashboard-card" style={{ width: '100%' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <h3>Property Categories</h3>
        <button 
          type="button" 
          className="card-view-all"
          onClick={() => alert("🔍 View Categories: Redirecting to properties classified database catalog.")}
        >
          View All
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id} 
              className={`category-sub-card ${cat.colorClass}`}
              onClick={() => alert(`Showing list of all ${cat.count} properties in category ${cat.title}.`)}
            >
              <div className="category-card-top">
                <div className="category-icon-box">
                  <Icon size={18} />
                </div>
                <span className="category-title">{cat.title}</span>
              </div>
              <div className="category-card-bottom">
                <span className="category-count">{cat.count}</span>
                <span className="category-label">Properties</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
