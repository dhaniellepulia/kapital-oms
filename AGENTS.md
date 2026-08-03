# opencode.ai website

React 19 + TypeScript 6.0 + Vite 8 + Tailwind CSS v4 + Oxlint.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` — run before commit |
| `npm run lint` | `oxlint` — run before commit |
| `npm run preview` | Preview production build locally |

No test runner configured.

## TypeScript quirks

- `verbatimModuleSyntax` → use `import type` for type-only imports.
- `erasableSyntaxOnly` → no enums, no namespaces, no parameter properties.
- `noUnusedLocals` + `noUnusedParameters` — both errors.
- `allowArbitraryExtensions` — allows e.g. `import styles from "./foo.module.css"`.
- Project references: `tsc -b` checks both `tsconfig.app.json` (src/) and `tsconfig.node.json` (vite.config.ts).

## Tailwind CSS v4

Uses `@import "tailwindcss"` syntax in `src/index.css`. No `tailwind.config.js` — v4 uses CSS-based config.

## Linting

Oxlint (not ESLint). Config in `.oxlintrc.json`. Enables `react`, `typescript`, `oxc` plugins with `react/rules-of-hooks` (error) and `react/only-export-components` (warn).

## Skills (`.agents/skills/`)

- `frontend-design` — UI/design direction skill (from anthropics/skills).
- `grill-me` — design review/planning sharpening skill (from mattpocock/skills).

Loaded via `skills-lock.json`. Use the `skill` tool to activate them when the task matches.


# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses consise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub0agents to assist with reasearch
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- when using sub-agents to implement features, act as a coordinator only
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## DATABASE SCHEMA CHANGES

<!-- - Whenever you make changes to the database schema, ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push! -->

## TESTING

- Use any testing tools, libraries avaialble to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md

### Do

- default to small components. prefer focused modules over god components
- default to small files and diffs. avoid repo wide rewrites unless asked

### Don't
- do not hard code colors
- do not use `div`s if we have a component already
- do not add new heavy dependencies without approval

### Safety and permissions

Allowed without prompt:
- read files, list files
- tsc single file, prettier, eslint,
- vitest single test

Ask first: 
- package installs,
- git push
- deleting files, chmod
- running full build or end to end suites
