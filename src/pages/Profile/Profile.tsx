import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:     { bg: '#FEE2E2', text: '#991B1B' },
  editor:    { bg: 'var(--ps-accent-soft)', text: 'var(--ps-accent-text)' },
  volunteer: { bg: '#D1FAE5', text: '#065F46' },
};

const Profile: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!isAuthenticated || !user) {
    navigate('/admin-login', { replace: true });
    return null;
  }

  const roleColor = ROLE_COLORS[role ?? ''] ?? { bg: 'var(--ps-surface-2)', text: 'var(--ps-muted)' };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--ps-shadow-md)',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--ps-grad)', padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          {user.picture ? (
            <img src={user.picture} alt={user.name}
              style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,.4)', boxShadow: 'var(--ps-shadow-md)' }} />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)', border: '3px solid rgba(255,255,255,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'system-ui', fontSize: 28, fontWeight: 700, color: '#fff',
            }}>
              {user.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div className="ps-serif" style={{ fontWeight: 600, fontSize: 18, color: '#fff' }}>{user.name}</div>
            <div style={{ fontFamily: 'system-ui', fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 3 }}>{user.email}</div>
          </div>
          {role && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: roleColor.bg, color: roleColor.text,
              borderRadius: 999, padding: '4px 12px',
              fontFamily: 'system-ui', fontSize: 12, fontWeight: 700,
            }}>
              <Shield style={{ width: 12, height: 12 }} />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ps-border)' }}>
          {[
            { label: 'Email', value: user.email },
            { label: 'Role', value: role ? role.charAt(0).toUpperCase() + role.slice(1) : 'None' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: '1px solid var(--ps-border)',
            }}>
              <span style={{ fontFamily: 'system-ui', fontSize: 12, fontWeight: 600, color: 'var(--ps-faint)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
              <span style={{ fontFamily: 'system-ui', fontSize: 13.5, color: 'var(--ps-text)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div style={{ padding: '16px 24px' }}>
          <button onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 12, border: '1px solid #FCA5A5',
              background: '#FEF2F2', color: '#DC2626',
              fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
            <LogOut style={{ width: 15, height: 15 }} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
