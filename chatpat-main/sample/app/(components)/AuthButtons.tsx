"use client";

export default function AuthButtons() {
  return (
    <div className="d-flex gap-2">
      <a className="btn btn-sm btn-outline-primary" href="/api/auth/login">Login</a>
      <a className="btn btn-sm btn-outline-secondary" href="/api/auth/logout">Logout</a>
    </div>
  );
}