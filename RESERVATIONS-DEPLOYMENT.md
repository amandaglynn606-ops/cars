# Online reservations on Vercel

Email is optional. Reservation requests are stored in Postgres and reviewed at `/admin`; submitting a request does not send an email or confirm the booking.

1. In the Vercel project, connect a **Neon Postgres** database through Storage. Make its `DATABASE_URL` (or `POSTGRES_URL`) available to the Production deployment. Use a separate database for Preview deployments.
2. Run `node scripts/init-hosted-reservations.mjs` locally. It creates private, Git-ignored configuration in `.local/hosted-reservations.env` and the administrator password in `.local/hosted-admin-password.txt`. It never overwrites existing keys.
3. Copy `ZAVI_DOCUMENT_KEY` and `ZAVI_ADMIN_AUTH` from that private configuration into Vercel's Production environment variables. Do not add `NEXT_PUBLIC_` to these names, commit the values, or share them in chat.
4. Set `NEXT_PUBLIC_SITE_URL=https://www.dubailuxurycarrentals.ae` and redeploy the latest `main` commit.
5. Submit an authorised test reservation and check it in `/admin`. Confirm the document download and cancellation workflow before collecting customer documents. Database tables are created automatically on first use.

The form is visible even before the connection is configured. Without a database it returns an error instead of claiming to have saved a request. Database failures do not return a successful reservation reference. If document encryption is not configured, submissions without documents can still be stored; document uploads return an explicit error.

Vercel requests accept up to four documents with a **combined maximum of 3 MB**, below the function request-size limit. Documents are encrypted with AES-256-GCM, downloaded only through authenticated admin endpoints, and expire after 30 days. Protect and back up the encryption key separately; replacing it makes existing documents unreadable. File type checks are not malware scanning. Add malware scanning and stronger shared rate limiting before wider public document collection.

Local development still uses the existing SQLite store. Hosted fleet editing and partner applications are separate from this reservation integration and are not enabled by connecting this database.
