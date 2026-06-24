'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from './lib/api';
import { Activity } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile) {
      router.push('/login');
    } else if (profile.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center flex-col gap-4">
      <Activity className="w-12 h-12 text-sky-500 animate-spin" />
      <span className="text-sm text-slate-400">Redirecting to Clinitech...</span>
    </div>
  );
}
