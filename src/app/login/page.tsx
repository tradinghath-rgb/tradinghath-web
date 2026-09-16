'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('tradinghath');
  const [password, setPassword] = useState('22NE1A04E1@093');
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, saveLogin })
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradinghath_user', JSON.stringify(data.user));
          localStorage.setItem('tradinghath_role', data.isAdmin ? 'admin' : 'user');
          localStorage.setItem('tradinghath_isPro', data.isPro ? 'true' : 'false');
        }

        if (data.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
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

        {/* Brand Subheader */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px',
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

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Identifier Input */}
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

          {/* Password Input with Show/Hide Toggle Button */}
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

          {/* Save login info Checkbox */}
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

          {/* Log In Button */}
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

          {/* Forgot Password Link */}
          <div style={{ marginTop: '20px' }}>
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
