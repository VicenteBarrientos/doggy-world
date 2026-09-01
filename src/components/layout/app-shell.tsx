import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isDemoCookieSet } from "@/lib/demo-cookie";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function AppShell({ children }: { children: ReactNode }) {
  // Demo mode is active when:
  //   1. Supabase credentials are absent (automatic fallback), OR
  //   2. The visitor explicitly clicked "Ver demo" (demo_mode session cookie)
  const cookieStore = await cookies();
  const isDemo = !isSupabaseConfigured() || isDemoCookieSet(cookieStore);

  return (
    <div className="min-h-screen bg-canvas">
      {isDemo ? <DemoBanner /> : null}
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
