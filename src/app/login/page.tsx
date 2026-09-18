'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { safeStorage } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const [isSignUp, setIsSignUp] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess('');
    setLoading(true);

    try {
      const cleanEmail = signupEmail.trim().toLowerCase();
      const derivedUsername = cleanEmail.split('@')[0] || 'user';

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: signupPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        // Save to client storage backup to guarantee persistence
        try {
          const stored = safeStorage.getItem('tradinghath_client_users');
          const list = stored ? JSON.parse(stored) : [];
          const userObj = {
            id: data.user?.id || `user_${Date.now()}`,
            username: data.user?.username || derivedUsername,
            email: cleanEmail,
            password: signupPassword.trim(),
            phone: '',
            isPro: false,
            amount: 0,
            createdAt: new Date().toISOString()
          };
          const filtered = list.filter((u: any) => u.username !== userObj.username && u.email !== userObj.email);
          safeStorage.setItem('tradinghath_client_users', JSON.stringify([userObj, ...filtered]));
        } catch (e) {}

        setSignupSuccess('Account created successfully! Switching to login...');
        setIdentifier(cleanEmail);
        setPassword(signupPassword);
        setTimeout(() => {
          setIsSignUp(false);
          setSignupSuccess('');
        }, 1500);
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Auto-fill saved login credentials from storage & sanitize stale admin roles
  React.useEffect(() => {
    try {
      // Enforce: only tradinghath / tradinghath@gmail.com can ever retain admin role in storage
      const storedUser = safeStorage.getItem('tradinghath_user');
      const storedRole = safeStorage.getItem('tradinghath_role');
      if (storedRole === 'admin') {
        let userObj: any = null;
        try {
          if (storedUser) userObj = JSON.parse(storedUser);
        } catch (e) {}
        const idLower = (userObj?.username || userObj?.email || '').toLowerCase();
        if (idLower !== 'tradinghath' && idLower !== 'tradinghath@gmail.com') {
          safeStorage.setItem('tradinghath_role', 'user');
        }
      }

      const savedCreds = safeStorage.getItem('tradinghath_saved_creds');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.identifier) setIdentifier(parsed.identifier);
        if (parsed.password) setPassword(parsed.password);
        setSaveLogin(true);
      }
    } catch (e) {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gather any client-stored users (excluding any deleted by admin)
      let clientUsers: any[] = [];
      try {
        const stored = safeStorage.getItem('tradinghath_client_users');
        const storedDeleted = safeStorage.getItem('tradinghath_deleted_user_ids');
        const deletedList: string[] = storedDeleted ? JSON.parse(storedDeleted).map((x: string) => x.toLowerCase()) : [];

        if (stored) {
          const rawList = JSON.parse(stored);
          clientUsers = rawList.filter((u: any) => 
            !deletedList.includes(u.id?.toLowerCase()) &&
            !deletedList.includes(u.email?.toLowerCase()) &&
            !deletedList.includes(u.username?.toLowerCase())
          );
        }
      } catch (e) {}

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, saveLogin, clientUsers })
      });
      const data = await res.json();

      if (data.success) {
        const userIdentifier = (data.user?.email || data.user?.username || identifier).toLowerCase();
        const isRealAdmin = data.isAdmin === true && (userIdentifier === 'tradinghath' || userIdentifier === 'tradinghath@gmail.com');

        try {
          safeStorage.setItem('tradinghath_user', JSON.stringify(data.user));
          if (isRealAdmin) {
            safeStorage.setItem('tradinghath_role', 'admin');
            safeStorage.setItem('tradinghath_isPro', 'true');
          } else {
            safeStorage.setItem('tradinghath_role', 'user');
            safeStorage.setItem('tradinghath_isPro', data.isPro ? 'true' : 'false');
          }

          // Handle "Save login info" check
          if (saveLogin) {
            safeStorage.setItem('tradinghath_saved_creds', JSON.stringify({ identifier, password }));
          } else {
            safeStorage.removeItem('tradinghath_saved_creds');
          }
        } catch (storageErr) {}

        if (isRealAdmin) {
          router.push('/admin');
        } else {
          // If pro user, go directly to vault dashboard; otherwise go explore homepage
          if (data.isPro) {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }

      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (err: any) {
      setError(err?.message ? `Network/Server issue: ${err.message}` : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.debugCode);
        setResetStep('verify');
        setResetMessage(`Code sent from tradinghath@gmail.com! (Verification code: ${data.debugCode})`);
      } else {
        setResetMessage(data.error || 'Failed to send code.');
      }
    } catch (err) {
      setResetMessage('Error sending request.');
    }
  };

  const handleResetConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCodeInput.trim() === generatedCode.trim()) {
      alert('Password has been successfully reset! You can now log in.');
      setShowForgotModal(false);
      setPassword(newPassword || '22NE1A04E1@093');
    } else {
      alert('Invalid reset code. Please check your email.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: '#f7f9fa',
      color: '#1c1d1f'
    }}>
      {/* Return home link */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#5624d0',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          <ArrowLeft size={16} /> Back to TradingHath Home
        </Link>
      </div>

      {/* Main Form Card - Udemy Educational Light Style */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d7dc',
        borderRadius: '8px',
        padding: '36px 32px 32px 32px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Brand Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '-0.4px',
          marginBottom: '20px',
          color: '#1c1d1f'
        }}>
          Log in to your <span style={{ color: '#5624d0' }}>TradingHath</span> account
        </h1>

        {/* Visual Mode Selector Tabs: Log In / Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          backgroundColor: '#f7f9fa',
          padding: '4px',
          borderRadius: '6px',
          marginBottom: '24px',
          border: '1px solid #d1d7dc'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSignupSuccess(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: !isSignUp ? '#1c1d1f' : 'transparent',
              color: !isSignUp ? '#ffffff' : '#6a6f73',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSignupSuccess(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isSignUp ? '#5624d0' : 'transparent',
              color: isSignUp ? '#ffffff' : '#6a6f73',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Brand Subheader */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '6px 14px',
          backgroundColor: '#f3ecfc',
          borderRadius: '20px'
        }}>
          <Image
            src="/logo/general-profile-picture.png"
            alt="TradingHath Logo"
            width={20}
            height={20}
            style={{ borderRadius: '50%' }}
          />
          <span style={{ fontSize: '12px', color: '#5624d0', fontWeight: '700' }}>
            TradingHath Student Portal
          </span>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12.5px',
            color: '#f87171',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {signupSuccess && (
          <div style={{
            backgroundColor: 'rgba(0, 230, 118, 0.15)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12.5px',
            color: '#00e676',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            {signupSuccess}
          </div>
        )}

        {/* Dynamic Form: Login OR Create Account */}
        {!isSignUp ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="ig-input-container">
              <input
                type="email"
                className="ig-input"
                placeholder="Email address (e.g. yourname@gmail.com)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="ig-input-container" style={{ paddingRight: '10px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="ig-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6a6f73',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1c1d1f')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6f73')}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#e0e0e0',
              cursor: 'pointer',
              marginTop: '8px',
              marginBottom: '12px',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={saveLogin}
                onChange={(e) => setSaveLogin(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#5624d0',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: '#2d2f31' }}>Save login info</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-trading-glow"
              style={{
                backgroundColor: '#5624d0',
                color: '#ffffff',
                padding: '13px 16px',
                fontSize: '14px',
                borderRadius: '6px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(86, 36, 208, 0.25)'
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5624d0',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          /* CREATE ACCOUNT FORM */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="ig-input-container">
              <input
                type="email"
                className="ig-input"
                placeholder="Gmail / Email address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>

            <div className="ig-input-container" style={{ paddingRight: '10px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="ig-input"
                placeholder="Create Password (min 6 characters)"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6a6f73',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1c1d1f')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6f73')}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#6a6f73', textAlign: 'left', lineHeight: '1.4', margin: '6px 0' }}>
              By signing up, you agree to our Terms & Conditions and 24/7 Member Guidelines.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-trading-glow"
              style={{
                backgroundColor: '#5624d0',
                color: '#ffffff',
                fontWeight: '700',
                padding: '13px 16px',
                fontSize: '14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(86, 36, 208, 0.25)'
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>

      {/* Udemy Bottom Switcher Box */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d7dc',
        borderRadius: '8px',
        padding: '18px 24px',
        marginTop: '12px',
        textAlign: 'center',
        fontSize: '13.5px',
        color: '#2d2f31',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {!isSignUp ? (
          <span>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#5624d0',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13.5px',
                textDecoration: 'underline'
              }}
            >
              Sign up
            </button>
          </span>
        ) : (
          <span>
            Have an account?{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#5624d0',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13.5px',
                textDecoration: 'underline'
              }}
            >
              Log in
            </button>
          </span>
        )}
      </div>


      {/* Footer Info / Security info */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6a6f73',
        maxWidth: '400px',
        lineHeight: '1.6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <ShieldCheck size={14} color="#137333" />
          <span style={{ color: '#137333', fontWeight: '600' }}>End-to-End Privacy Protected</span>
        </div>
        <p>No user credentials or emails are ever exposed publicly.</p>
        <p style={{ marginTop: '4px' }}>Support: <a href="mailto:tradinghath@gmail.com" style={{ color: '#5624d0', textDecoration: 'none', fontWeight: '600' }}>tradinghath@gmail.com</a></p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(28, 29, 31, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d1d7dc',
            borderRadius: '12px',
            padding: '28px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '8px', color: '#1c1d1f' }}>
              Reset Password
            </h3>
            <p style={{ fontSize: '13px', color: '#6a6f73', marginBottom: '20px', lineHeight: '1.5' }}>
              A 6-digit verification code will be sent to you directly from <b style={{ color: '#5624d0' }}>tradinghath@gmail.com</b>.
            </p>

            {resetMessage && (
              <div style={{
                backgroundColor: '#f3ecfc',
                border: '1px solid #d8b4fe',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#5624d0',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {resetMessage}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="ig-input-container">
                  <input
                    type="email"
                    className="ig-input"
                    placeholder="Enter your registered email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '12px', borderRadius: '6px' }}>
                  Send Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="ig-input-container">
                  <input
                    type="text"
                    className="ig-input"
                    placeholder="Enter 6-digit code"
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value)}
                    required
                  />
                </div>
                <div className="ig-input-container">
                  <input
                    type="password"
                    className="ig-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-trading-glow" style={{ width: '100%', padding: '12px', borderRadius: '6px' }}>
                  Verify & Change Password
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetStep('request');
                setResetMessage('');
              }}
              style={{
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: '#6a6f73',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
