# Sample Secondary School: demonstration website (Stage 1)

DEMONSTRATION ONLY. Fictional school, sample content, no real contacts, fees, results or dates.

## What exists
- Public site: Home, About, Academics, Admissions, School Life, News and Events (with article pages), Gallery, Contact, not-found page.
- Dashboard at `admin/` (local demo sign-in): Overview, Page content, News, Events, Admissions, Gallery, Enquiries, Settings, Staff access, with role-based menus.
- Working workflows: news draft, preview, publish, edit, unpublish, delete (with confirmation); events; gallery upload; admissions edits; enquiry status; settings including a validated Google Map location; staff roles.
- Design system: `assets/css/site.css` (colours at the top). Data layer: `assets/js/store.js`.
- `supabase/schema.sql`: database schema and security rules for the connected version (written, NOT yet run).
- `docs/`: staff guide, demo script, Supabase setup, testing record.

## What does NOT exist yet
Supabase connection and real authentication (Stage 4), email notifications, real photographs, a verified school location, a real logo, performance measurements.

## Local demo mode (read this)
Content is stored in the visitor's browser (localStorage). It is NOT a database, NOT shared between devices and NOT secure. There is no real authentication yet. The connected version (Supabase) comes in a later stage.

## Run it
Open `index.html` in a browser, or deploy the folder contents to GitHub Pages (Settings > Pages > Deploy from a branch > main > / root). All links are relative, so it also works from a repo sub-path.

## Photos
Photo slots show a dashed placeholder until you add a file with the named filename into `assets/img/` (for example `hero-students.jpg`). See `IMAGE-LICENCES.md` for the slot list, suggested searches and the licence record to fill in.
