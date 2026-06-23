'use client';

import { useEffect, useState } from 'react';

interface Prescription { id: number; medication: string; dosage: string; quantity: number; refillOn: string; refillSchedule: string; }

function getNextRefills(refillOn: string, schedule: string, count: number): Date[] {
  const results: Date[] = [];
  const current = new Date(refillOn);
  const now = new Date();
  for (let i = 0; i < 500; i++) {
    if (current >= now) break;
    if (schedule === 'weekly') current.setDate(current.getDate() + 7);
    else if (schedule === 'monthly') current.setMonth(current.getMonth() + 1);
    else break;
  }
  for (let i = 0; i < count; i++) {
    results.push(new Date(current));
    if (schedule === 'weekly') current.setDate(current.getDate() + 7);
    else if (schedule === 'monthly') current.setMonth(current.getMonth() + 1);
    else break;
  }
  return results;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const { user } = await meRes.json();
      const res = await fetch(`/api/patients/${user.id}/prescriptions`);
      setPrescriptions(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Prescriptions</h1>
        <p className="text-gray-500 mt-1">{prescriptions.length} active medications</p>
      </div>
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No active prescriptions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map(rx => {
            const nextRefills = getNextRefills(rx.refillOn, rx.refillSchedule, 3);
            return (
              <div key={rx.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{rx.medication}</h3>
                    <p className="text-gray-500">{rx.dosage} · Qty {rx.quantity}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full capitalize">{rx.refillSchedule}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Next Refills:</p>
                  <div className="space-y-1">
                    {nextRefills.map((date, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}