# Security policy

## Supported version

Doggy World is an early open-source experiment. Security fixes currently target the latest `main` branch.

## Reporting a vulnerability

Please use the repository host's private security-advisory feature when available. Do not publish an exploitable report in a public issue. Include the affected route or policy, reproduction steps, expected boundary, observed behavior, and any suggested mitigation.

Do not include real user data, credentials, session tokens, or production database exports in a report.

## Security model

- Supabase Auth establishes identity.
- Server Actions re-authenticate and validate inputs.
- PostgreSQL RLS is the authoritative data-access boundary.
- Storage policies restrict writes to owner-scoped folders.
- Public dog profiles intentionally expose a narrow view of dog data.

This project does not require or expose a service-role credential in the web application.
