# Tasty Bites: main website + admin + backend

Three separate parts:

    food-project/
      backend/server.js              the backend (API + data storage)
      backend/package.json
      main-website/main-website.html the public food website
      admin/admin.html               the admin panel (password protected)

## Run it
1. Install Node.js 18 or newer (https://nodejs.org). No other installs needed.
2. Start the backend:
       cd backend
       node server.js
   It prints: Tasty Bites backend running on http://localhost:3000
   The first run creates backend/data.json with the starting menu. All edits are saved there.
3. Double-click main-website/main-website.html to open the website.
4. Double-click admin/admin.html, log in (default password: admin123) and edit anything.
   The website updates by itself within about 5 seconds.
5. In the admin menu items, choose a picture file to upload it. Uploaded pictures appear on the public menu; items without a picture continue to use their emoji.

## Change the admin password
    ADMIN_PASSWORD=mysecret node server.js        (Mac/Linux)
    set ADMIN_PASSWORD=mysecret && node server.js (Windows cmd)

## Putting it online later
Host backend/ on a Node host, host the two HTML files anywhere, then change the line
`const API = "http://localhost:3000";` at the top of both HTML files to your backend's address.
Use a strong ADMIN_PASSWORD and HTTPS before going public.
