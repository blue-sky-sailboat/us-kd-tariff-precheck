import React from 'react';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../roleAccess';

export function RoleWorkspaceBanner({ role }: { role: UserRole }) {
  const definition = ROLE_DEFINITIONS[role];
  return (
    <section className={`mb-5 rounded-2xl border p-4 ${definition.accent}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">현재 권한</p>
          <h2 className="mt-1 text-sm font-black">{definition.label}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed opacity-80">{definition.mission}</p>
        </div>
        <div className="flex max-w-xl flex-wrap gap-1.5">
          {definition.capabilities.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full border border-current/15 bg-white/70 px-2.5 py-1 text-[10px] font-bold">
              <CheckCircle2 className="h-3 w-3" /> {item}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 border-t border-current/10 pt-2 text-[10px] font-semibold opacity-70">
        <LockKeyhole className="h-3 w-3" /> {definition.restrictions[0]}
      </p>
    </section>
  );
}
