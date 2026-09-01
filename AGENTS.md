<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:shared-vault-coordination -->
## Shared vault coordination

Before project work, read `C:\Users\hp\OneDrive\Documentos\Obsidian Vault\Agent Control Center.md`, then `C:\Users\hp\OneDrive\Documentos\Obsidian Vault\Proyectos\Doggy World.md`.

Authority split:

- The vault owns the accepted outcome, priority, scope, durable decisions, privacy rules, authority routing, and stable synthesis.
- This repository and its tests own code, schema, implementation, and git state.
- The project-local `HANDOFF.md` owns transient work and ownership.
- Observed Supabase and Vercel services own deployed or transactional state.
- Knowledge does not grant external-action permission. Follow the stricter current task, repository, vault, and provider gates.

If the live vault is unavailable, use only an allowlisted task-scoped context pack with source checkpoints and expiry; state that limitation in the handoff.
<!-- END:shared-vault-coordination -->

## UI ownership and integration boundary

Lovable is the visual source of truth for the final landing page, visual identity, design tokens, typography, color, imagery, motion, and presentation polish. This repository is the product and engineering source of truth for Next.js architecture, Supabase, Auth, schema, RLS, Storage, domain logic, privacy, tests, deployment readiness, and the integration contracts consumed by presentation components.

- Keep the current UI functional, clean, responsive, accessible, semantic, and easy to restyle.
- Prioritize correct behavior and critical-flow UX over decorative refinement or pixel-perfect polish.
- Do not spend material time redesigning the brand, adding elaborate landing sections, or building a competing design system.
- Keep data access and mutations outside highly styled components. Prefer typed data/action props so presentation can be replaced without rewriting domain logic.
- When the separate design repository becomes available, inspect and adopt its tokens/components while preserving working backend and domain behavior.
- Do not perform additional polish work on the current landing page unless explicitly requested.
