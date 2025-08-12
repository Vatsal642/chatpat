"use client";

import Link from 'next/link';

export default function LoginButtons() {
  return (
    <div className="d-flex gap-2">
      <Link href="/api/auth/login" className="btn btn-sm btn-outline-primary">Login</Link>
      <Link href="/api/auth/logout" className="btn btn-sm btn-outline-secondary">Logout</Link>
    </div>
  );
}