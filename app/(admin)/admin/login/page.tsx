'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { ShoppingBag, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <main className="admin-login">
      <div className="admin-login-container">
        {/* Left side — Brand */}
        <div className="admin-login-brand">
          <div className="admin-login-brand-content">
            <Link href="/" className="admin-login-logo" aria-label="BEILO home">
              <ShoppingBag size={32} strokeWidth={2.5} />
              <span>BEILO</span>
            </Link>
            <h1 className="admin-login-brand-title">
              Staff Portal
            </h1>
            <p className="admin-login-brand-text">
              Manage inventory, orders, and operations from one place.
            </p>
          </div>
        </div>

        {/* Right side — Form */}
        <div className="admin-login-form-wrap">
          <div className="admin-login-form-inner">
            <h2 className="admin-login-heading">Sign in</h2>
            <p className="admin-login-subtext">
              Enter your credentials to access the dashboard.
            </p>

            <form
              className="admin-login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {error && (
                <div className="admin-login-error" role="alert">
                  <AlertCircle size={16} strokeWidth={2} />
                  {error}
                </div>
              )}

              <div className="admin-login-field">
                <label
                  htmlFor="admin-email"
                  className="admin-login-label"
                >
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@beilo.store"
                  className="admin-login-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="admin-login-field">
                <label
                  htmlFor="admin-password"
                  className="admin-login-label"
                >
                  Password
                </label>
                <div className="admin-login-password-wrap">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="admin-login-input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={2} />
                    ) : (
                      <Eye size={16} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary admin-login-button"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <span className="admin-login-loading" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="admin-login-footer">
              <Link href="/" className="admin-login-footer-link">
                ← Back to store
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}