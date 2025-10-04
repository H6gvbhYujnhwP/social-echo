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

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  lastLogin?: string | null;
  subscription?: {
    plan: string;
    status: string;
    usageCount: number;
    usageLimit: number;
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
      const res = await fetch(`/api/admin/users/${id}/delete`, { method: 'POST' });
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
                variant="outline" 
                onClick={() => window.open('/api/admin/users/export', '_blank')}
              >
                Export CSV
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
                    `${u.subscription.usageCount}/${u.subscription.usageLimit}` : 
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
                        <span className="text-gray-600">Usage:</span> {detail.subscription.usageCount}/{detail.subscription.usageLimit}
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
              
              <div className="flex flex-wrap gap-2">
                {detail.isSuspended ? (
                  <Button onClick={() => unsuspendUser(detail.id)}>
                    Unsuspend User
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => suspendUser(detail.id)}>
                    Suspend User
                  </Button>
                )}
                
                {detail.subscription?.stripeCustomerId && (
                  <Button variant="outline" onClick={() => openPortal(detail.id)}>
                    Open Billing Portal
                  </Button>
                )}
                
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
                
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
