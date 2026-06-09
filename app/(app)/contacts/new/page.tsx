'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Users } from 'lucide-react';
import { Button, Card, Select } from '@/components/ui/index';
import { createContact, getStakeholders } from '@/lib/db';
import type { Stakeholder } from '@/lib/supabase';

function NewContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stakeholderId = searchParams.get('stakeholder');

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    stakeholder_id: stakeholderId || '',
    full_name: '',
    email: '',
    phone: '',
    position: '',
    is_primary: false,
    preferred_contact: 'Email' as 'Email' | 'Phone' | 'WhatsApp',
  });

  useEffect(() => {
    getStakeholders()
      .then(setStakeholders)
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stakeholder_id) {
      alert('Please select a stakeholder');
      return;
    }
    
    setLoading(true);
    try {
      await createContact(formData);
      router.push(`/stakeholders/${formData.stakeholder_id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save contact');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Add New Contact</h1>
            <p className="text-sm text-slate-400">Add a contact person for an organization</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" /> Organization Link
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Stakeholder <span className="text-red-400">*</span></label>
                {fetching ? (
                  <div className="form-input text-slate-500 flex items-center">Loading stakeholders...</div>
                ) : (
                  <Select
                    options={stakeholders.map(s => ({ label: s.name, value: s.id }))}
                    value={formData.stakeholder_id}
                    onChange={(val) => setFormData(f => ({ ...f, stakeholder_id: val }))}
                    placeholder="Select an organization"
                  />
                )}
              </div>
            </div>

            <hr className="border-white/[0.06]" />

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Contact Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData(f => ({ ...f, full_name: e.target.value }))}
                    className="form-input"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Position / Job Title</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => setFormData(f => ({ ...f, position: e.target.value }))}
                    className="form-input"
                    placeholder="e.g. Program Director"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="form-input"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="form-input"
                    placeholder="+254..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Contact Method</label>
                  <Select
                    options={[{label: 'Email', value: 'Email'}, {label: 'Phone', value: 'Phone'}, {label: 'WhatsApp', value: 'WhatsApp'}]}
                    value={formData.preferred_contact}
                    onChange={(val) => setFormData(f => ({ ...f, preferred_contact: val as any }))}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.is_primary}
                      onChange={e => setFormData(f => ({ ...f, is_primary: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white"></div>
                    <span className="ml-3 text-sm font-medium text-slate-300">Set as primary contact</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3 bg-white/[0.02]">
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Contact
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default function NewContactPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-400" /></div>}>
      <NewContactContent />
    </Suspense>
  );
}
