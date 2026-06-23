'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Appointment { id: number; provider: string; datetime: string; repeat: string; endDate: string | null; }
interface Prescription { id: number; medication: string; dosage: string; quantity: number; refillOn: string; refillSchedule: string; }
interface PatientData { id: number; name: string; email: string; appointments: Appointment[]; prescriptions: Prescription[]; }

function getOccurrences(start: string, repeat: string, daysOut: number, endDate?: string | null): Date[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysOut);
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

export default function PortalDashboard() {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      const { user } = await meRes.json();
      const patientRes = await fetch(`/api/patients/${user.id}`);
      setData(await patientRes.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  const upcomingAppts = data.appointments
    .flatMap(appt => getOccurrences(appt.datetime, appt.repeat, 7, appt.endDate).map(date => ({ appt, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingRefills = data.prescriptions
    .flatMap(rx => getOccurrences(rx.refillOn, rx.refillSchedule, 7).map(date => ({ rx, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {data.name}</h1>
        <p className="text-gray-500 mt-1">Your health summary for the next 7 days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold">Appointments This Week ({upcomingAppts.length})</h2>
            <Link href="/portal/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingAppts.length === 0 ? (
              <p className="px-6 py-8 text-gray-400 text-center text-sm">No upcoming appointments this week</p>
            ) : upcomingAppts.slice(0, 5).map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.appt.provider}</p>
                  <p className="text-sm text-gray-500">
                    {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                    {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">{item.appt.repeat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold">Refills This Week ({upcomingRefills.length})</h2>
            <Link href="/portal/prescriptions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingRefills.length === 0 ? (
              <p className="px-6 py-8 text-gray-400 text-center text-sm">No upcoming refills this week</p>
            ) : upcomingRefills.map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.rx.medication} {item.rx.dosage}</p>
                  <p className="text-sm text-gray-500">Refill {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Qty: {item.rx.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}