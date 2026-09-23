'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { UserPlus, Trash2, Shield, ShieldOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface StaffMember {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/staff', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail, password: invitePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff account');
      }

      setInviteEmail('');
      setInvitePassword('');
      setShowInvite(false);
      fetchStaff();
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemoveStaff(userId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove staff');
      }

      setDeleteConfirm(null);
      fetchStaff();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>Staff</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Staff</h1>
        <p className="admin-page-subtitle">
          {staff.length} staff member{staff.length !== 1 ? 's' : ''}
        </p>
        <Button variant="primary" onClick={() => setShowInvite(true)}>
          <UserPlus size={16} strokeWidth={2} />
          <span>Add Staff</span>
        </Button>
      </div>

      {showInvite && (
        <div className="admin-modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Staff Account</h3>
            <p style={{ fontSize: '13px', color: 'var(--ironclad-grey)', marginBottom: '16px' }}>
              Create a new staff account for dashboard access.
            </p>
            <form onSubmit={handleInvite}>
              {inviteError && (
                <div className="admin-login-error" style={{ marginBottom: '12px' }}>
                  {inviteError}
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <Input
                  label="Email"
                  type="email"
                  required
                  placeholder="staff@beilo.store"
                  value={inviteEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={invitePassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvitePassword(e.target.value)}
                />
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={inviteLoading || !inviteEmail || !invitePassword}
                >
                  {inviteLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={3} className="admin-table-empty">No staff members found</td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{member.email}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: member.role === 'admin' ? 'var(--charcoal-noir)' : 'var(--cloud-veil)',
                      color: member.role === 'admin' ? 'var(--canvas)' : 'var(--ironclad-grey)',
                    }}>
                      {member.role === 'admin' ? <Shield size={12} /> : <ShieldOff size={12} />}
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setDeleteConfirm(member.id)}
                      className="admin-action-btn danger"
                      aria-label="Remove staff member"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Staff Member?</h3>
            <p>This will revoke their dashboard access.</p>
            <div className="admin-modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleRemoveStaff(deleteConfirm)} className="btn btn-primary danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
