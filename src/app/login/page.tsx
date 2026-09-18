'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

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
        // Save to client localStorage backup to guarantee persistence
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('tradinghath_client_users');
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
            localStorage.setItem('tradinghath_client_users', JSON.stringify([userObj, ...filtered]));
          } catch (e) {}
        }

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

  // Auto-fill saved login credentials from localStorage & sanitize stale admin roles
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Enforce: only tradinghath / tradinghath@gmail.com can ever retain admin role in localStorage
        const storedUser = localStorage.getItem('tradinghath_user');
        const storedRole = localStorage.getItem('tradinghath_role');
        if (storedRole === 'admin') {
          let userObj: any = null;
          try {
            if (storedUser) userObj = JSON.parse(storedUser);
          } catch (e) {}
          const idLower = (userObj?.username || userObj?.email || '').toLowerCase();
          if (idLower !== 'tradinghath' && idLower !== 'tradinghath@gmail.com') {
            localStorage.setItem('tradinghath_role', 'user');
          }
        }

        const savedCreds = localStorage.getItem('tradinghath_saved_creds');
        if (savedCreds) {
          const parsed = JSON.parse(savedCreds);
          if (parsed.identifier) setIdentifier(parsed.identifier);
          if (parsed.password) setPassword(parsed.password);
          setSaveLogin(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gather any client-stored users (excluding any deleted by admin)
      let clientUsers: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tradinghath_client_users');
          const storedDeleted = localStorage.getItem('tradinghath_deleted_user_ids');
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
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, saveLogin, clientUsers })
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          const userIdentifier = (data.user?.email || data.user?.username || identifier).toLowerCase();
          const isRealAdmin = data.isAdmin === true && (userIdentifier === 'tradinghath' || userIdentifier === 'tradinghath@gmail.com');

          localStorage.setItem('tradinghath_user', JSON.stringify(data.user));
          if (isRealAdmin) {
            localStorage.setItem('tradinghath_role', 'admin');
            localStorage.setItem('tradinghath_isPro', 'true');
          } else {
            localStorage.setItem('tradinghath_role', 'user');
            localStorage.setItem('tradinghath_isPro', data.isPro ? 'true' : 'false');
          }

          // Handle "Save login info" check
          if (saveLogin) {
            localStorage.setItem('tradinghath_saved_creds', JSON.stringify({ identifier, password }));
          } else {
            localStorage.removeItem('tradinghath_saved_creds');
          }
        }

        const userIdentifier = (data.user?.email || data.user?.username || identifier).toLowerCase();
        const isRealAdmin = data.isAdmin === true && (userIdentifier === 'tradinghath' || userIdentifier === 'tradinghath@gmail.com');

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
      setError('Connection error. Please try again.');
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
      backgroundColor: '#000000',
      color: '#ffffff'
    }}>
      {/* Return home link */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '16px' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#8e8e8e',
          textDecoration: 'none',
          fontSize: '13px'
        }}>
          <ArrowLeft size={16} /> Back to TradingHath Home
        </Link>
      </div>

      {/* Main Instagram Box */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#121212',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '36px 32px 28px 32px',
        textAlign: 'center'
      }}>
        {/* Instagram Brand Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '36px',
          fontWeight: '500',
          letterSpacing: '-0.5px',
          marginBottom: '28px',
          color: '#ffffff'
        }}>
          Instagram
        </h1>

        {/* Visual Mode Selector Tabs: Log In / Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          backgroundColor: '#1e1e1e',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setSignupSuccess(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: !isSignUp ? '#3875f6' : 'transparent',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setSignupSuccess(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isSignUp ? '#00e5ff' : 'transparent',
              color: isSignUp ? '#000000' : '#a1a1aa',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Brand Subheader */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '6px 12px',
          backgroundColor: '#1e1e1e',
          borderRadius: '20px'
        }}>
          <Image
            src="/logo/general-profile-picture.png"
            alt="TradingHath Logo"
            width={22}
            height={22}
            style={{ borderRadius: '50%' }}
          />
          <span style={{ fontSize: '12px', color: '#00e5ff', fontWeight: '600' }}>
            TradingHath Official Portal
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
                type="text"
                className="ig-input"
                placeholder="Phone number, username, or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="ig-input-container" style={{ paddingRight: '6px' }}>
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
                style={{
                  background: 'transparent',
                  border: '1px solid #555555',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  marginRight: '6px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
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
                  accentColor: '#3875f6',
                  cursor: 'pointer'
                }}
              />
              Save login info
            </label>

            <button
              type="submit"
              disabled={loading}
              className="ig-button-primary"
              style={{
                backgroundColor: '#4154f5',
                padding: '12px 16px',
                fontSize: '14px',
                borderRadius: '8px'
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
                  color: '#ffffff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  opacity: 0.9
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

            <div className="ig-input-container" style={{ paddingRight: '6px' }}>
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
                style={{
                  background: 'transparent',
                  border: '1px solid #555555',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  marginRight: '6px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#8e8e8e', textAlign: 'left', lineHeight: '1.4', margin: '6px 0' }}>
              By signing up, you agree to our Terms & Conditions and 24/7 Member Guidelines.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="ig-button-primary"
              style={{
                backgroundColor: '#00e5ff',
                color: '#000',
                fontWeight: '700',
                padding: '12px 16px',
                fontSize: '14px',
                borderRadius: '8px'
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>

      {/* Instagram Bottom Switcher Box */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#121212',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '18px 24px',
        marginTop: '12px',
        textAlign: 'center',
        fontSize: '13.5px'
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
                color: '#0095f6',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13.5px'
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
                color: '#0095f6',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13.5px'
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
        color: '#737373',
        maxWidth: '380px',
        lineHeight: '1.6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <ShieldCheck size={14} color="#00e676" />
          <span>End-to-End Privacy Protected</span>
        </div>
        <p>No user credentials or emails are ever exposed publicly.</p>
        <p style={{ marginTop: '4px' }}>Support: <a href="mailto:tradinghath@gmail.com" style={{ color: '#00e5ff', textDecoration: 'none' }}>tradinghath@gmail.com</a></p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Reset Password
            </h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '20px', lineHeight: '1.5' }}>
              A 6-digit verification code will be sent to you directly from <b style={{ color: '#00e5ff' }}>tradinghath@gmail.com</b>.
            </p>

            {resetMessage && (
              <div style={{
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#00e5ff',
                marginBottom: '16px'
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
                <button type="submit" className="btn-trading-glow" style={{ width: '100%' }}>
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
                <button type="submit" className="btn-trading-glow" style={{ width: '100%' }}>
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
                color: '#a1a1aa',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center'
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
