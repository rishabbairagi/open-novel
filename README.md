# OpenNovel

Git-backed novel reader and community publishing pipeline. Next.js 15 (App Router), Tailwind, Octokit. No database.

## Run
```bash
npm install
cp .env.example .env.local   # optional: without a real token, submissions are mocked in dev
npm run dev
```

## Content layout
`content/novels/<slug>/meta.json` and `ch-NN.md` (frontmatter: chapter, title, publishedAt, author, wordCount).
Invalid content fails the build with a file-specific error (see `lib/novels.ts`, `lib/schemas.ts`).

## Submissions
`app/actions/submit-chapter.ts` validates with Zod, branches from `main`, commits files, opens a PR.
Without `GITHUB_PAT_TOKEN` (and outside production) it logs the Git operations and returns a fake PR URL.
Use a fine-grained PAT limited to the content repo: Contents + Pull requests read/write.

## Webhook
GitHub repo > Settings > Webhooks: URL `https://<host>/api/revalidate`, content type `application/json`,
secret = `REVALIDATION_SECRET`, event "Pull requests". The route accepts GitHub's HMAC signature or an
`x-revalidation-secret` header.

## Deployment note
Content is read from the filesystem at build time. Revalidation refreshes cached pages, but a merged PR
only shows new chapters once the deployment contains the new files, so keep Git-triggered redeploys
(e.g. Vercel) enabled. Sample "The Time Machine" chapters are an abridged retelling, not Wells's text.
