# Connecting Supabase

DONE: project `sample-school-demo` created, `supabase/schema.sql` applied, security rules tested (docs/TESTING.md).
NOT DONE: signing in and the website screens still use local demo mode. Steps 3 to 9 below remain.

1. Create a Supabase project (free plan allows 2 active projects).
2. (Done) `supabase/schema.sql` has been applied and tested.
3. Authentication > Sign In / Providers > Email: switch OFF "Allow new users to sign up" so strangers cannot create accounts. Staff are created by the administrator.
4. Create the first administrator: invite or add a user in Authentication > Users, then run:
   `insert into public.profiles (id, full_name, role) values ('<that user id>', 'Full Name', 'admin');`
5. Copy `assets/js/config.example.js` to `config.js` and add the project URL and anon key.
6. Replace the localStorage calls in `assets/js/store.js` with Supabase calls. The screens do not need to change.
7. Test every item in `docs/TESTING.md` under "Needs the connected version", including trying to read enquiries while signed out and trying to change your own role as an editor.
8. Add spam protection to the public enquiry form (for example Cloudflare Turnstile) before launch. The demo uses only a hidden field, a minimum time and a per-browser limit.
9. Email notifications are NOT configured. Do not tell the school that emails are sent until they are.
