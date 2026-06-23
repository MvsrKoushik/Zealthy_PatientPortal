'use client';

import { useEffect, useState } from 'react';

interface Appointment { id: number; provider: string; datetime: string; repeat: string; endDate: string | null; }

function getOccurrences(start: string, repeat: string, months: number, endDate?: string | null): Date[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + months);
  const results: Date[] = [];
  const current = new Date(start);
  for (let i = 0; i < 500; i++) {
    if (current > cutoff) break;
    if (endDate && current > new Date(endDate)) break;
    if (current >= now) results.push(new Date(current));
    if (repeat === 'weekly') current.setDate(current.getDate() + 7);
    else if (repeat === 'monthly') current.setMonth(current.getMonth() + 1);
    else break;
  }
  return results;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const { user } = await meRes.json();
      const res = await fetch(`/api/patients/${user.id}/appointments`);
      setAppointments(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const allOccurrences = appointments
    .flatMap(appt => getOccurrences(appt.datetime, appt.repeat, 3, appt.endDate).map(date => ({ appt, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const grouped: Record<string, typeof allOccurrences> = {};
  allOccurrences.forEach(item => {
    const key = item.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointment Schedule</h1>
        <p className="text-gray-500 mt-1">Next 3 months · {allOccurrences.length} appointments</p>
      </div>
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">{month}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.appt.provider}</p>
                  <p className="text-sm text-gray-500">
                    {item.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at{' '}
                    {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">{item.appt.repeat}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {allOccurrences.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No upcoming appointments in the next 3 months</p>
        </div>
      )}
    </div>
  );
}