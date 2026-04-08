import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend }) => {
  return (
    <GlassCard className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="stat-header">{label}</p>
          <h3 className="stat-value">{value}</h3>
          {trend && (
            <p style={{ fontSize: '0.8rem', marginTop: '8px', color: '#10b981' }}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '12px', 
            borderRadius: '12px',
            color: 'var(--primary)'
          }}>
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
