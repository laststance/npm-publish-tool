<h1 align="center">
    @laststance/npm-publish-tool
</h1>

<br>

<p align="center">
  <img src="./assets/cover_image.png" alt="cover_image"/>
</p>

<br>

## Feature

🚀 **Release npm package with `npm run push-release-commit` command**
📦 **Autogenerate Github release page**
🔧 **Publish NPM in GitHub Actions by [release-it](https://github.com/release-it/release-it)**
🔐 **OIDC Trusted Publishing (no NPM_TOKEN needed)**

<br>

<p align="center">
  <img src="./assets/demo.gif" alt="demo"/>
</p>

<br>

## Usage (after install complete)

```bash
npm run push-release-commit
```

## Requirements

- Node.js 20.0.0 or higher

## 1. Installation

```bash
npx @laststance/npm-publish-tool@latest init # generate .release-it.json/.github/workflows/release.yml, add `push-release-commit` npm script in package.json
npm install -D @laststance/npm-publish-tool # install `push-release-commit` script file
```

## 2. Configure npm Trusted Publishing (OIDC)

### Why OIDC? (Shai-Hulud Attack Background)

In late 2025, the **Shai-Hulud worm attack** compromised 1,150+ npm packages by stealing `NPM_TOKEN` secrets from repositories. The attack:

- Affected 20+ million weekly downloads
- Caused ~$50M in cryptocurrency theft
- Was the first self-replicating worm in the JavaScript ecosystem

**npm's response**: OIDC Trusted Publishing (GA July 2025) eliminates long-lived tokens entirely. This tool now uses OIDC by default - no `NPM_TOKEN` needed.

### Setup Steps

#### Step 1: First Publish (One-time only)

OIDC only works after your package exists on npm. For the first publish:

```bash
npm publish --access public
```

#### Step 2: Configure Trusted Publishing on npmjs.com

1. Go to [npmjs.com](https://www.npmjs.com/) → Your Package → **Settings**
2. Scroll to **"Trusted Publishing"** section
3. Click **"Add GitHub Actions"**
4. Fill in:
   | Field | Value |
   |-------|-------|
   | Owner | Your GitHub username or org (e.g., `laststance`) |
   | Repository | Your repo name (e.g., `my-package`) |
   | Workflow | `release.yml` |
   | Environment | _(leave empty)_ |
5. Click **"Add Trusted Publisher"**

#### Step 3: (Recommended) Disable Token Publishing

For maximum security, after enabling OIDC:

1. Go to Package Settings → **Publishing Access**
2. Select **"Require two-factor authentication and disallow tokens"**

This completely disables token-based publishing while OIDC continues working.

### Required Secret

Only one secret is needed now:

- **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions (no setup needed)

> **Note**: `NPM_TOKEN` is no longer required with OIDC Trusted Publishing.

### How OIDC Works

```
┌─────────────────────────────────────────────────────────────┐
│                    OIDC Trusted Publishing                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GitHub Actions                        npmjs.com           │
│  ┌───────────┐                        ┌───────────┐        │
│  │ release.  │  ──── OIDC Token ────► │  Package  │        │
│  │ yml       │       (short-lived)    │  Registry │        │
│  └───────────┘                        └───────────┘        │
│       │                                     │              │
│       │ id-token: write                     │ Verify:      │
│       │ permission                          │ - owner      │
│       ▼                                     │ - repo       │
│  Cryptographic                              │ - workflow   │
│  Identity                                   ▼              │
│                                        ✅ Publish!         │
│                                        + Provenance        │
└─────────────────────────────────────────────────────────────┘
```

## 3. Update .github/workflows/release.yml

Update the `.github/workflows/release.yml` file with your own build steps.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Ryota Murakami](https://ryota-murakami.github.io/)

## Related

- [release-it](https://github.com/release-it/release-it) - The underlying release automation tool
- [npm OIDC Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements) - Official npm documentation
