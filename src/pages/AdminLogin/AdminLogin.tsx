import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { googleLogin } from '@/services/auth';

const AdminLogin: React.FC = () => {
  const { isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/profile', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    try {
      const u = await googleLogin(response.credential);
      setUser(u);
      navigate('/profile', { replace: true });
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 20, padding: '48px 40px', boxShadow: 'var(--ps-shadow-md)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        width: '100%', maxWidth: 360,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--ps-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--ps-shadow-sm)',
          }}>
            <span className="kn-serif" style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>ಯ</span>
          </div>
          <div className="ps-serif" style={{ fontWeight: 600, fontSize: 18, color: 'var(--ps-text)' }}>
            Pratisangraha
          </div>
        </div>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Login error')}
          size="large"
          shape="pill"
          theme="outline"
          text="signin_with"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
