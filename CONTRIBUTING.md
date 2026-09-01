# Contributing to Doggy World

Thanks for helping build a trustworthy dog-centered product. Keep changes focused, accessible, and compatible with the privacy model.

## Development workflow

1. Install Node.js 20.9 or newer and run `npm ci`.
2. Use `npm run dev` for the interface-only demo, or follow the full local Supabase setup in the README.
3. Create a branch with a concise purpose.
4. Add or update tests for behavior and database rules.
5. Run `npm run verify`; run `npm run db:test` when changing SQL or authorization.
6. Open a pull request describing the user outcome, security impact, and verification performed.

## Engineering principles

- Keep the dog as the central domain entity and prefer explicit relational data.
- Treat Server Actions as untrusted request boundaries: authenticate, authorize, and validate.
- Enforce ownership and privacy in RLS, not only in application code.
- Never commit credentials, private user information, precise home locations, or production exports.
- Keep visible product language in natural Latin American Spanish; use English for code and schema names.
- Use semantic HTML, keyboard-accessible controls, descriptive alternatives, and understandable errors.
- Add a new versioned migration instead of rewriting an applied migration.
- Avoid presenting roadmap ideas as functional features.

## Commit style

Prefer outcome-oriented commits such as `Add dog preference management` or `Harden friendship transitions`. Avoid unrelated formatting or generated-file churn.

## License

Contributions are accepted under the MIT License in this repository.
