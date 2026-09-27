'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import { UserPlus, Trash2, Shield, ShieldCheck, AlertCircle, Users } from 'lucide-react';

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
        <div className="m3-page-head">
          <div>
            <h1 className="m3-headline-medium">Staff</h1>
          </div>
        </div>
        <div className="m3-loading" role="status" aria-label="Loading staff">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading staff…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="m3-page-head">
        <div>
          <h1 className="m3-headline-medium">Staff</h1>
          <p className="m3-body-medium m3-on-surface-variant">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''} with dashboard access
          </p>
        </div>
        <div className="m3-page-actions">
          <button type="button" className="m3-btn m3-btn-filled" onClick={() => setShowInvite(true)}>
            <UserPlus size={16} strokeWidth={2} />
            <span>Add staff</span>
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="admin-modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="invite-title">Add staff account</h3>
            <p>Create a new staff account for dashboard access.</p>
            <form onSubmit={handleInvite}>
              {inviteError && (
                <div className="m3-error-block" role="alert" style={{ marginBottom: '12px' }}>
                  <AlertCircle size={16} aria-hidden="true" />
                  {inviteError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="m3-field">
                  <label htmlFor="invite-email">Email</label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="staff@beilo.store"
                    value={inviteEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="m3-field">
                  <label htmlFor="invite-password">Password</label>
                  <input
                    id="invite-password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={invitePassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvitePassword(e.target.value)}
                  />
                  <span className="m3-field-hint">At least 8 characters.</span>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="m3-btn m3-btn-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="m3-btn m3-btn-filled"
                  disabled={inviteLoading || !inviteEmail || !invitePassword}
                >
                  {inviteLoading ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th><span className="m3-body-small">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={3} className="admin-table-empty">
                  <div className="m3-empty">
                    <span className="m3-empty-icon"><Users size={28} aria-hidden="true" /></span>
                    <p className="m3-title-medium">No staff members yet</p>
                    <p className="m3-body-medium m3-on-surface-variant">Invite your first team member to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              staff.map((member) => {
                const isAdmin = member.role === 'admin';
                return (
                <tr key={member.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{member.email}</div>
                  </td>
                  <td>
                    <span
                      className="m3-chip-status"
                      style={isAdmin
                        ? { background: 'var(--m3-primary-container)', color: 'var(--m3-on-primary-container)' }
                        : { background: 'var(--m3-secondary-container)', color: 'var(--m3-on-secondary-container)' }}
                    >
                      {isAdmin ? <Shield size={12} aria-hidden="true" /> : <ShieldCheck size={12} aria-hidden="true" />}
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setDeleteConfirm(member.id)}
                      className="admin-action-btn danger"
                      aria-label={`Remove ${member.email}`}
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </div>

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="remove-staff-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="remove-staff-title">Remove staff member?</h3>
            <p>This will revoke their dashboard access.</p>
            <div className="admin-modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="m3-btn m3-btn-text">
                Cancel
              </button>
              <button onClick={() => handleRemoveStaff(deleteConfirm)} className="m3-btn m3-btn-text is-danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
