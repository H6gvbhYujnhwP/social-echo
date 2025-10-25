'use client';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { createUserWithTrial, generateSecurePassword } from './actions';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  lastLogin?: string | null;
  notes?: string | null;
  subscription?: {
    plan: string;
    status: string;
    usageCount: number;
    usageLimit: number | null;
    currentPeriodEnd: string | null;
    stripeCustomerId?: string | null;
  } | null;
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{ items: UserRow[]; total: number; page: number; pageSize: number }>();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'pro' as 'starter' | 'pro',
    trialAmount: 7,
    trialUnit: 'days' as 'minutes' | 'hours' | 'days',
    sendEmail: false,
  });
  const [creating, setCreating] = useState(false);

  async function fetchPage(p = 1) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?query=${encodeURIComponent(query)}&page=${p}`, { cache: 'no-store' });
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
        setPage(p);
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to fetch users' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setLoading(false);
  }

  useEffect(() => { 
    fetchPage(1); 
    // eslint-disable-next-line
  }, []);

  const allSelected = useMemo(() => {
    const ids = new Set((data?.items ?? []).map(i => i.id));
    for (const id of ids) if (!selected.has(id)) return false;
    return ids.size > 0;
  }, [data, selected]);

  function toggleAll() {
    if (!data?.items) return;
    const ids = data.items.map(i => i.id);
    const next = new Set(selected);
    if (allSelected) ids.forEach(id => next.delete(id));
    else ids.forEach(id => next.add(id));
    setSelected(next);
  }

  async function bulk(action: 'suspend'|'unsuspend') {
    if (selected.size === 0) return;
    
    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action })
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: json.message });
        setSelected(new Set());
        fetchPage(page);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function syncUsageLimits() {
    if (!confirm('Sync usage limits for all subscriptions? This will update Pro plans to 30/month.')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usage/sync-limits', { method: 'POST' });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: `Synced ${json.updated} subscriptions successfully` });
        fetchPage(page);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setLoading(false);
  }

  async function suspendUser(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'User suspended' });
        fetchPage(page);
        if (detail?.id === id) setDetail(null);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function unsuspendUser(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/unsuspend`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'User unsuspended' });
        fetchPage(page);
        if (detail?.id === id) setDetail(null);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function openPortal(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/portal`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok && json.url) {
        window.open(json.url, '_blank');
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function deleteUser(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/delete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'hard' })
      });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted permanently' });
        fetchPage(page);
        setDetail(null);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function resetPassword(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok && json.resetUrl) {
        // Copy to clipboard
        navigator.clipboard.writeText(json.resetUrl);
        setMessage({ type: 'success', text: 'Reset link copied to clipboard!' });
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function changeEmail(id: string) {
    const newEmail = prompt('Enter new email address:');
    if (!newEmail) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}/email`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email updated successfully' });
        fetchPage(page);
        if (detail?.id === id) setDetail(null);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function resetUsage(id: string) {
    if (!confirm('Reset usage count to 0?')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-usage`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Usage count reset to 0' });
        fetchPage(page);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function updateNotes(id: string) {
    const notes = prompt('Enter admin notes:', detail?.notes || '');
    if (notes === null) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}/notes`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const json = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Notes updated' });
        fetchPage(page);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  async function viewPosts(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/posts`);
      const json = await res.json();
      
      if (res.ok) {
        const postsText = json.posts.map((p: any) => 
          `[${new Date(p.createdAt).toLocaleDateString()}] ${p.postType} - ${p.tone}\n${p.postText.substring(0, 100)}...`
        ).join('\n\n');
        alert(`User's Posts (${json.posts.length}):\n\n${postsText || 'No posts yet'}`);
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  }

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right font-bold">×</button>
          </div>
        )}

        <Card className="p-6 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input 
                placeholder="Search email or ID…" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchPage(1)}
                className="flex-1"
              />
              <Button onClick={() => fetchPage(1)} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                + Create User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('/api/admin/users/export', '_blank')}
              >
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={syncUsageLimits}
                disabled={loading}
                title="Sync usage limits for all subscriptions (Pro → 30/month)"
              >
                Sync Limits
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => bulk('suspend')} 
                disabled={selected.size===0}
              >
                Suspend ({selected.size})
              </Button>
              <Button 
                onClick={() => bulk('unsuspend')} 
                disabled={selected.size===0}
              >
                Unsuspend ({selected.size})
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="p-3 w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Created</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).map(u => {
                  const sel = selected.has(u.id);
                  const usage = u.subscription ? 
                    (u.subscription.usageLimit === null 
                      ? `${u.subscription.usageCount}/Unlimited` 
                      : `${u.subscription.usageCount}/${u.subscription.usageLimit}`) : 
                    'N/A';
                  
                  return (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox 
                          checked={sel} 
                          onCheckedChange={(checked) => {
                            const next = new Set(selected);
                            if (checked) next.add(u.id);
                            else next.delete(u.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className="p-3 font-medium">{u.email}</td>
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">
                        <Badge variant={u.role === 'MASTER_ADMIN' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3">{u.subscription?.plan || 'None'}</td>
                      <td className="p-3">
                        {u.isSuspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant={u.subscription?.status === 'active' ? 'default' : 'secondary'}>
                            {u.subscription?.status || 'inactive'}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">{usage}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDetail(u)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * data.pageSize) + 1} to {Math.min(page * data.pageSize, data.total)} of {data.total} users
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => fetchPage(page - 1)} 
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fetchPage(page + 1)} 
                  disabled={page * data.pageSize >= data.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {detail && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-lg">{detail.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-lg">{detail.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Role</label>
                  <p><Badge>{detail.role}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <p>
                    {detail.isSuspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </p>
                </div>
              </div>

              {detail.subscription && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Subscription</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Plan:</span> {detail.subscription.plan}
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span> {detail.subscription.status}
                      </div>
                      <div>
                        <span className="text-gray-600">Usage:</span> {detail.subscription.usageCount}/{detail.subscription.usageLimit ?? 'Unlimited'}
                      </div>
                      <div>
                        <span className="text-gray-600">Period End:</span>{' '}
                        {detail.subscription.currentPeriodEnd 
                          ? new Date(detail.subscription.currentPeriodEnd).toLocaleDateString()
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <h4 className="w-full text-sm font-semibold text-gray-700 mb-1">Account Actions</h4>
                  {detail.isSuspended ? (
                    <Button onClick={() => unsuspendUser(detail.id)}>
                      Unsuspend User
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={() => suspendUser(detail.id)}>
                      Suspend User
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => resetPassword(detail.id)}>
                    Reset Password
                  </Button>
                  
                  <Button variant="outline" onClick={() => changeEmail(detail.id)}>
                    Change Email
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm(`Are you sure you want to permanently delete ${detail.email}? This action cannot be undone.`)) {
                        deleteUser(detail.id);
                      }
                    }}
                  >
                    Delete User
                  </Button>
                </div>

                {detail.subscription && (
                  <div className="flex flex-wrap gap-2">
                    <h4 className="w-full text-sm font-semibold text-gray-700 mb-1">Subscription Actions</h4>
                    {detail.subscription.stripeCustomerId && (
                      <Button variant="outline" onClick={() => openPortal(detail.id)}>
                        Open Billing Portal
                      </Button>
                    )}
                    
                    <Button variant="outline" onClick={() => resetUsage(detail.id)}>
                      Reset Usage Count
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <h4 className="w-full text-sm font-semibold text-gray-700 mb-1">Information</h4>
                  <Button variant="outline" onClick={() => viewPosts(detail.id)}>
                    View Posts
                  </Button>
                  
                  <Button variant="outline" onClick={() => updateNotes(detail.id)}>
                    Edit Notes
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setDetail(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User with Trial</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setCreating(true);
            
            try {
              const result = await createUserWithTrial(createForm);
              
              if (result.success) {
                setMessage({ type: 'success', text: result.message || 'User created successfully' });
                
                // Copy reset link to clipboard
                if (result.resetUrl) {
                  try {
                    await navigator.clipboard.writeText(result.resetUrl);
                    setMessage({ 
                      type: 'success', 
                      text: `${result.message}. Reset link copied to clipboard!` 
                    });
                  } catch (clipError) {
                    console.error('Failed to copy to clipboard:', clipError);
                  }
                }
                
                // Reset form and close modal
                setCreateForm({
                  name: '',
                  email: '',
                  password: '',
                  plan: 'pro',
                  trialAmount: 7,
                  trialUnit: 'days',
                  sendEmail: false,
                });
                setShowCreateModal(false);
                
                // Refresh the user list
                fetchPage(1);
              } else {
                setMessage({ 
                  type: 'error', 
                  text: result.error || 'Failed to create user' 
                });
                
                // If user exists, show link to their detail page
                if (result.existingUserId) {
                  setMessage({ 
                    type: 'error', 
                    text: `${result.error}. Click to view existing user.` 
                  });
                }
              }
            } catch (error) {
              setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to create user' 
              });
            } finally {
              setCreating(false);
            }
          }} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (optional)
              </label>
              <Input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const pwd = await generateSecurePassword();
                    setCreateForm({ ...createForm, password: pwd });
                  }}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="starter"
                    checked={createForm.plan === 'starter'}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value as 'starter' | 'pro' })}
                    className="w-4 h-4"
                  />
                  <span>Starter (8 posts/month)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="pro"
                    checked={createForm.plan === 'pro'}
                    onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value as 'starter' | 'pro' })}
                    className="w-4 h-4"
                  />
                  <span>Pro (30 posts/month)</span>
                </label>
              </div>
            </div>

            {/* Trial Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trial Duration <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={createForm.trialAmount}
                  onChange={(e) => setCreateForm({ ...createForm, trialAmount: parseFloat(e.target.value) })}
                  placeholder="7"
                  min="0.001"
                  max="365"
                  step="0.001"
                  required
                  className="flex-1"
                />
                <select
                  value={createForm.trialUnit}
                  onChange={(e) => setCreateForm({ ...createForm, trialUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Decimals allowed (e.g., 0.5 hours = 30 minutes)
              </p>
            </div>

            {/* Send Email */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={createForm.sendEmail}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, sendEmail: checked as boolean })}
                aria-labelledby="sendEmailLabel"
              />
              <span id="sendEmailLabel" className="text-sm text-gray-700 cursor-pointer" onClick={() => setCreateForm({ ...createForm, sendEmail: !createForm.sendEmail })}>
                Send trial activation email
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    name: '',
                    email: '',
                    password: '',
                    plan: 'pro',
                    trialAmount: 7,
                    trialUnit: 'days',
                    sendEmail: false,
                  });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating || !createForm.email || !createForm.password || createForm.password.length < 8}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {creating ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
