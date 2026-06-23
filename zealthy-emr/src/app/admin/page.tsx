// =============================================================
// FILE: src/app/admin/page.tsx — Patient List (Route: "/admin")
// =============================================================
// This is the MAIN admin page. It shows:
// 1. A table of all patients with appointment/prescription counts
// 2. A "New Patient" button that reveals a creation form
//
// KEY REACT PATTERNS USED:
// - useEffect(fn, [])  → Run once when page loads (fetch data)
// - useState(value)    → Create reactive state variables
// - Conditional rendering: {showForm && <form>...}
// - Controlled inputs: value={x} onChange={e => setX(e.target.value)}
// =============================================================
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Patient {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  _count: { appointments: number; prescriptions: number };
}

export default function AdminPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function loadPatients() {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
    setLoading(false);
  }

  useEffect(() => { loadPatients(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      await loadPatients();
    } catch {
      setError('Failed to create patient');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">{patients.length} patients in the system</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition">
          {showForm ? 'Cancel' : '+ New Patient'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Patient</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="text" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="Set a password" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Patient'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Appts</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rx</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {patients.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-400 sm:hidden">{patient.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{patient.email}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{patient._count.appointments}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{patient._count.prescriptions}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/patients/${patient.id}`} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View &rarr;</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}