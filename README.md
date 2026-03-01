# CRE Scenario Studio

Persona-aware commercial property calculator with scenario comparison, template composition, and export support.

## Run the web UI

1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Open the local URL printed by Vite.

## Verify release readiness

1. Run tests:
   - `npm test`
2. Build the UI bundle:
   - `npm run build`

### Manual QA checklist

- Analysis screen: each field label has an info bubble and displays contextual help text on hover/focus/tap.
- Analysis screen: pressing `Esc` on a focused info bubble closes it.
- Composer screen: field catalog items and placed fields each show info bubbles with matching help text.
- Composer screen: info bubbles do not break drag-and-drop reordering or cross-section moves.
- Mobile viewport: tap opens and closes info bubbles without obscuring primary form actions.

## Deploy to Cloudflare Pages

1. Authenticate Wrangler:
   - `npx wrangler login`
2. Create a Pages project (first time only):
   - `npx wrangler pages project create cre-scenario-studio --production-branch main`
3. Deploy current build:
   - `npm run deploy:cloudflare -- --project-name cre-scenario-studio`

Notes:
- `wrangler.toml` is configured with `pages_build_output_dir = "dist"`.
- The app uses hash-based routes, so no extra Cloudflare routing config is required.

## Key workflow screens

- `Analysis`: choose persona, fill assumptions, create up to 3 scenarios, view deltas, export CSV/JSON.
- `Template Composer`: drag calculator fields into sections, reorder/move fields, validate required fields, save templates.
- `Template Library`: use prebuilt templates and manage user templates (create, duplicate, rename, delete).
