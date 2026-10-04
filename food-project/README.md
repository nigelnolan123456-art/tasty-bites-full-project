# Tasty Bites

The public menu and admin panel use Supabase for the database, authentication, and food-image storage.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates and seeds the menu tables, locks writes behind the admin allowlist, and creates the public `menu-images` storage bucket.
3. In **Project Settings → API**, copy the Project URL and the anon/publishable key into [`supabase/config.js`](supabase/config.js). Never use or publish the `service_role` key.
4. In **Authentication → Settings**, disable public sign-ups.
5. Create your admin user in **Authentication → Users**. Copy that user's UUID and add it to the allowlist in the SQL Editor:

       insert into public.admin_users (user_id)
       values ('YOUR-AUTH-USER-UUID');

6. Serve `main-website/main-website.html` and `admin/admin.html` on a static host. Both pages use the shared Supabase config. The menu page is public; the admin page requires an allowlisted Supabase account.

The sample menu is inserted only when `menu_items` is empty. Existing rows are preserved when the schema is rerun.

## Local development

You can open the HTML pages from a local static server or host them on GitHub Pages after making the repository public or enabling Pages on the plan. The Node server in `backend/server.js` is retained as the original standalone/local backend; the website and admin frontend now use Supabase directly.

For a quick static server with Node.js installed, run this from `food-project`:

    npx serve .

Then open the printed URL with `/main-website/main-website.html` or `/admin/admin.html`.

## Image uploads

Admins can upload JPG, PNG, WebP, or GIF images up to 5 MB per menu item. Image files are stored in the public `menu-images` bucket; only allowlisted admins can upload, replace, or delete them.
