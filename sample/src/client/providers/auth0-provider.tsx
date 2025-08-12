"use client";

import type { PropsWithChildren } from 'react';

export default function Auth0Provider({ children }: PropsWithChildren) {
  // Using Auth0 App Router API routes directly; no client provider needed.
  return children;
}