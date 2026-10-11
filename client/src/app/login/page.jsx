'use client';

import React, { Suspense } from 'react';
import AuthPage from '../../views/AuthPage';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-zinc-500 font-mono text-xs">Loading login...</div>}>
      <AuthPage initialMode="login" />
    </Suspense>
  );
}
