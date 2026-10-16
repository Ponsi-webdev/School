# Testing record

## Tests actually run (automated, real Chromium browser, local demo mode)
- Public site: 35 checks (layout at 320, 375, 390, 768, 1024, 1440 px on all pages; news publish workflow; enquiry validation and spam protection; map input rules; gallery viewer; admissions content; keyboard skip link).
- Dashboard: 40 functional and permission checks (role menus and blocked pages; news draft, preview, publish, edit, unpublish, delete with confirmation; events; gallery upload; enquiries; settings validation including map; staff rules; admissions).
- Dashboard responsive: 35 checks (no sideways scroll on 12 screens at 6 widths; mobile drawer open, focus, Tab loop, Escape; forms and buttons at least 44 px; cards on phones and tables on larger screens; visible focus ring).
- Text contrast measured on the public site: all text pairs measured are 6.2:1 or better.

## Live-mode code paths (against a test double of the Supabase client)
55 of 55 checks passed (sign-in and wrong password, setup code and invite codes, first administrator, news draft/publish/edit/unpublish/delete, cover upload, permission refusals, settings and map, staff roles and invites, last-administrator guard, admissions documents and file moves, gallery, events, enquiries, network-failure handling, fallback notice). This used a stand-in for the Supabase client because the testing sandbox cannot reach the internet. It proves the website code and mappings, NOT that the real service behaves the same. Run the phone checklist in docs/HANDOFF.md.

## Database security rules: tested against the real Supabase database
37 of 37 checks passed, run as the database roles (anonymous visitor, editor, admissions staff, administrator, signed-in person with no role). Test data was rolled back afterwards.
- Visitors see only published, already-live news; published events, documents and gallery items; approved document files only.
- Visitors CAN submit a valid enquiry; they cannot submit a pre-resolved or too-short one; they cannot read, update or delete enquiries; cannot create news; cannot upload files; cannot read staff profiles or change settings.
- Editors see drafts and can create news, edit page content and upload media; they CANNOT promote their own role, create or promote another profile, read enquiries or change settings.
- Admissions staff can read and update enquiries but cannot delete them, see drafts or create news.
- Administrators can see all profiles, change roles, change settings and read enquiries.
- A signed-in person with no staff role has the same access as a visitor.
- A document cannot be approved without a file.
Supabase security scan: one expected warning (the `staff_role()` helper can be called by signed-in users; it only returns the caller's own role and is needed by the rules).
Still untested against the real database: the website calling it, real sign-in, storage uploads from the browser, server-side rate limiting.

## Not tested yet (do these before showing as production-ready)
- Real devices (a physical Android phone and iPhone), other browsers (Safari, Firefox).
- Screen reader testing (NVDA, VoiceOver, TalkBack) and 200 percent zoom.
- Performance scores (Lighthouse / PageSpeed). None are claimed.
- Real photographs (only placeholders exist), real fonts online (tests ran with fallback fonts).
- The map with a verified school location.

## Needs the website connected to Supabase
- Real authentication and sessions in the browser.
- Browser uploads to storage.
- Server-side spam and rate limiting for the public enquiry form.
