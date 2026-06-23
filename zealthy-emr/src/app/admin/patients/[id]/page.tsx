// =============================================================
// FILE: src/app/admin/patients/[id]/page.tsx
// ROUTE: /admin/patients/:id
// =============================================================
// THE MOST COMPLEX PAGE — handles:
// 1. Display patient info (with inline edit toggle)
// 2. List appointments (Add / Edit / Delete)
// 3. List prescriptions (Add / Edit / Delete)
//
// KEY PATTERNS:
// - Modal component for create/edit forms
// - useCallback() to prevent re-creating the load function
// - Controlled form inputs
// - Optimistic reloading (refresh data after every mutation)
// =============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Appointment { id: number; provider: string; datetime: string; repeat: string; endDate: string | null; }
interface Prescription { id: number; medication: string; dosage: string; quantity: number; refillOn: string; refillSchedule: string; }
interface Patient { id: number; name: string; email: string; appointments: Appointment[]; prescriptions: Prescription[]; }

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<string[]>([]);
  const [dosages, setDosages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({ name: '', email: '', password: '' });
  const [apptModal, setApptModal] = useState<'create' | 'edit' | null>(null);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [apptForm, setApptForm] = useState({ provider: '', datetime: '', repeat: 'none', endDate: '' });
  const [rxModal, setRxModal] = useState<'create' | 'edit' | null>(null);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [rxForm, setRxForm] = useState({ medication: '', dosage: '', quantity: '1', refillOn: '', refillSchedule: 'monthly' });

  const loadPatient = useCallback(async () => {
    const res = await fetch(`/api/patients/${patientId}`);
    const data = await res.json();
    setPatient(data);
    setPatientForm({ name: data.name, email: data.email, password: '' });
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    loadPatient();
    fetch('/api/medications').then(r => r.json()).then(d => { setMedications(d.medications); setDosages(d.dosages); });
  }, [loadPatient]);

  async function handleUpdatePatient(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, string> = {};
    if (patientForm.name) body.name = patientForm.name;
    if (patientForm.email) body.email = patientForm.email;
    if (patientForm.password) body.password = patientForm.password;
    await fetch(`/api/patients/${patientId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setEditingPatient(false);
    await loadPatient();
  }

  function openCreateAppt() { setApptForm({ provider: '', datetime: '', repeat: 'none', endDate: '' }); setApptModal('create'); }
  function openEditAppt(appt: Appointment) {
    setEditingAppt(appt);
    setApptForm({ provider: appt.provider, datetime: new Date(appt.datetime).toISOString().slice(0, 16), repeat: appt.repeat, endDate: appt.endDate ? new Date(appt.endDate).toISOString().slice(0, 10) : '' });
    setApptModal('edit');
  }
  async function handleSaveAppt(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...apptForm, endDate: apptForm.endDate || null };
    if (apptModal === 'create') {
      await fetch(`/api/patients/${patientId}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else if (editingAppt) {
      await fetch(`/api/patients/${patientId}/appointments/${editingAppt.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setApptModal(null); setEditingAppt(null); await loadPatient();
  }
  async function handleDeleteAppt(id: number) {
    if (!confirm('Delete this appointment?')) return;
    await fetch(`/api/patients/${patientId}/appointments/${id}`, { method: 'DELETE' });
    await loadPatient();
  }

  function openCreateRx() { setRxForm({ medication: medications[0] || '', dosage: dosages[0] || '', quantity: '1', refillOn: '', refillSchedule: 'monthly' }); setRxModal('create'); }
  function openEditRx(rx: Prescription) {
    setEditingRx(rx);
    setRxForm({ medication: rx.medication, dosage: rx.dosage, quantity: String(rx.quantity), refillOn: new Date(rx.refillOn).toISOString().slice(0, 10), refillSchedule: rx.refillSchedule });
    setRxModal('edit');
  }
  async function handleSaveRx(e: React.FormEvent) {
    e.preventDefault();
    if (rxModal === 'create') {
      await fetch(`/api/patients/${patientId}/prescriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rxForm) });
    } else if (editingRx) {
      await fetch(`/api/patients/${patientId}/prescriptions/${editingRx.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rxForm) });
    }
    setRxModal(null); setEditingRx(null); await loadPatient();
  }
  async function handleDeleteRx(id: number) {
    if (!confirm('Delete this prescription?')) return;
    await fetch(`/api/patients/${patientId}/prescriptions/${id}`, { method: 'DELETE' });
    await loadPatient();
  }

  if (loading || !patient) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Patient Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Patient Record</h1>
          <button onClick={() => setEditingPatient(!editingPatient)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">{editingPatient ? 'Cancel' : 'Edit'}</button>
        </div>
        {editingPatient ? (
          <form onSubmit={handleUpdatePatient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="text" value={patientForm.password} onChange={e => setPatientForm({ ...patientForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="Leave blank to keep current" /></div>
            </div>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">Save Changes</button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{patient.name}</p></div>
            <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{patient.email}</p></div>
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Appointments</h2>
          <button onClick={openCreateAppt} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">+ Add</button>
        </div>
        {patient.appointments.length === 0 ? <p className="px-6 py-8 text-center text-gray-400 text-sm">No appointments</p> : (
          <div className="divide-y divide-gray-50">
            {patient.appointments.map(appt => (
              <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{appt.provider}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appt.datetime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    {' · '}<span className="capitalize">{appt.repeat}</span>
                    {appt.endDate && <span className="text-red-500">{' · Ends '}{new Date(appt.endDate).toLocaleDateString()}</span>}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditAppt(appt)} className="text-sm text-gray-500 hover:text-blue-600 font-medium">Edit</button>
                  <button onClick={() => handleDeleteAppt(appt.id)} className="text-sm text-gray-400 hover:text-red-600 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          <button onClick={openCreateRx} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">+ Add</button>
        </div>
        {patient.prescriptions.length === 0 ? <p className="px-6 py-8 text-center text-gray-400 text-sm">No prescriptions</p> : (
          <div className="divide-y divide-gray-50">
            {patient.prescriptions.map(rx => (
              <div key={rx.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{rx.medication} <span className="text-gray-500">{rx.dosage}</span></p>
                  <p className="text-sm text-gray-500">Qty: {rx.quantity} · Refill: {new Date(rx.refillOn).toLocaleDateString()} · <span className="capitalize">{rx.refillSchedule}</span></p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditRx(rx)} className="text-sm text-gray-500 hover:text-purple-600 font-medium">Edit</button>
                  <button onClick={() => handleDeleteRx(rx.id)} className="text-sm text-gray-400 hover:text-red-600 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      <Modal open={apptModal !== null} onClose={() => { setApptModal(null); setEditingAppt(null); }} title={apptModal === 'create' ? 'New Appointment' : 'Edit Appointment'}>
        <form onSubmit={handleSaveAppt} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Provider</label><input type="text" required value={apptForm.provider} onChange={e => setApptForm({ ...apptForm, provider: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Dr. Jane Smith" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label><input type="datetime-local" required value={apptForm.datetime} onChange={e => setApptForm({ ...apptForm, datetime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label><select value={apptForm.repeat} onChange={e => setApptForm({ ...apptForm, repeat: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"><option value="none">No Repeat</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          {apptForm.repeat !== 'none' && <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label><input type="date" value={apptForm.endDate} onChange={e => setApptForm({ ...apptForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /></div>}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => { setApptModal(null); setEditingAppt(null); }} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">{apptModal === 'create' ? 'Create' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Prescription Modal */}
      <Modal open={rxModal !== null} onClose={() => { setRxModal(null); setEditingRx(null); }} title={rxModal === 'create' ? 'New Prescription' : 'Edit Prescription'}>
        <form onSubmit={handleSaveRx} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Medication</label><select required value={rxForm.medication} onChange={e => setRxForm({ ...rxForm, medication: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">{medications.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label><select required value={rxForm.dosage} onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">{dosages.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" required min="1" value={rxForm.quantity} onChange={e => setRxForm({ ...rxForm, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Refill Date</label><input type="date" required value={rxForm.refillOn} onChange={e => setRxForm({ ...rxForm, refillOn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label><select value={rxForm.refillSchedule} onChange={e => setRxForm({ ...rxForm, refillSchedule: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => { setRxModal(null); setEditingRx(null); }} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">{rxModal === 'create' ? 'Create' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}