# StoryDNA Studio — Netlify Deployment

## 1. Connect this local repository to GitHub

Run every Git command from the project directory, not from `~`:

```bash
cd "/Users/jasminemack/Documents/Codex/2026-07-18/storydna-studio-codex-project-kickoff-you"
git status
```

Create an empty GitHub repository named `storydna-studio`, copy its real HTTPS URL, then run:

```bash
git remote add origin https://github.com/YOUR-ACTUAL-USERNAME/storydna-studio.git
git push -u origin main
```

Do not paste the placeholder username literally. Confirm the connection with:

```bash
git remote -v
```

## 2. Connect the correct repository in Netlify

Use these settings:

```text
Repository: the GitHub repository that contains this package.json
Branch: main
Base directory: leave blank
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

The committed `netlify.toml` supplies the build, publish, functions, Node.js, SPA fallback, and security-header settings. File-based settings override conflicting UI values.

## 3. Configure server-only environment variables

In Netlify, open **Project configuration → Environment variables** and add:

```text
OPENAI_API_KEY = your newly rotated project key
OPENAI_MODEL = gpt-5.6
```

Never add `VITE_` to the key name. Never upload or commit `.env.openai`.

If no key is configured, the deployed site intentionally runs in guided-demo mode.

## 4. Deploy and verify

Trigger **Deploys → Trigger deploy → Clear cache and deploy site**, then verify:

1. The landing page loads.
2. Refreshing a deep client route still serves the app.
3. The header says `OpenAI ready` when both environment variables are configured.
4. Story analysis returns StoryDNA and exactly three questions.
5. Scene, image, motion, estimate, export, and commentary stages still work.
6. Director's Commentary clearly states its sampled-frame and audio limitations.

## Common failures

### `ENOENT ... /opt/build/repo/package.json`

Netlify is connected to the wrong repository, the app was not pushed, or the Base directory points at the wrong folder. This repository has `package.json` at its root, so Base directory should be blank.

### The site loads but `/api/story/status` returns 404

Confirm that `netlify/functions/story.mts` and `netlify.toml` are committed and that the deploy log reports one bundled function.

### The site says `Guided demo`

`OPENAI_API_KEY` is missing from the Netlify environment or was added only to a deploy context that is not active. Add it to Production and redeploy.

### OpenAI requests return 429

The API project needs available quota or billing. Guided-demo mode remains available when the key is removed.
