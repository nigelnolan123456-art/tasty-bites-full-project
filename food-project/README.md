# Tasty Bites

The public menu and admin panel use Supabase for the database, authentication, and food-image storage.

## Connected Supabase project

This app is configured for the [Tasty Bites Supabase project](https://supabase.com/dashboard/project/kqqyhawmoaohuipjxphe). Its database, row-level security policies, seed menu, and `menu-images` storage bucket have been set up. The project URL and public publishable key are in [`supabase/config.js`](supabase/config.js). That key is intended for browser use; never put a `service_role` key in frontend code.

## Enable admin access

Public sign-ups are disabled. Create the restaurant admin account in **Authentication → Users**, then copy its UUID and add it to the admin allowlist in the SQL Editor:

       insert into public.admin_users (user_id)
       values ('YOUR-AUTH-USER-UUID');

The admin can then log in at `admin/admin.html`. Only allowlisted users can edit menu data or upload images.

## Set up a different Supabase project

1. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). The sample menu is inserted only if `menu_items` is empty, and existing rows are preserved.
2. Replace the project URL and public anon/publishable key in [`supabase/config.js`](supabase/config.js). Never use or publish the `service_role` key.
3. Disable public sign-ups, create an admin user in **Authentication → Users**, then add that user's UUID to `public.admin_users` as shown above.

## Run or host the website

Serve `main-website/main-website.html` and `admin/admin.html` on a static host. Both pages use the shared Supabase config. GitHub Pages for this private repository requires an eligible plan; making the repository public is another option. The Node server in `backend/server.js` is retained as the original local backend, but the website and admin frontend now use Supabase directly.

## Image uploads

Admins can upload JPG, PNG, WebP, or GIF images up to 5 MB per menu item. Image files are stored in the public `menu-images` bucket; only allowlisted admins can upload, replace, or delete them.
