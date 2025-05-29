# @lastsntance/npm-publish-tool

### 🎯 What the Tool Does

When users run `npx @lastsntance/npm-publish-tool init`, it:

1. ✅ **Detects package manager** (npm/yarn/pnpm)
2. ✅ **Installs release-it** as dev dependency
3. ✅ **Creates .release-it.json** with optimized configuration
4. ✅ **Sets up GitHub Actions workflow** (`.github/workflows/release.yml`)
5. ✅ **Creates release script** (`scripts/npm-publish-tool.mjs`)
6. ✅ **Updates package.json** with `push-release-commit` script

## Features

🚀 **Automated Initialization**: One command to initialize everything
📦 **Package Manager Detection**: Automatically detects and uses npm, yarn, or pnpm
🔧 **GitHub Actions Integration**: Sets up automated releases via GitHub Actions
📋 **Release Commit Automation**: Creates properly formatted release commits
🎨 **Rich Visual Feedback**: Beautiful terminal output with progress indicators

## Installation

You don't need to install this globally. Use it directly with npx:

```bash
npx @lastsntance/npm-publish-tool init
```

## Usage

```bash
npm run push-release-commit
```

### Options

- `-p, --path <path>`: Specify a different project path (default: current directory)

### Example

```bash
# Initialize in current directory
npx @lastsntance/npm-publish-tool init

# Initialize in a specific directory
npx @lastsntance/npm-publish-tool init -p /path/to/your/project
```

## What It Does

When you run the init command, the tool will:

1. **Detect Package Manager**: Automatically detects whether you're using npm, yarn, or pnpm
2. **Install release-it**: Installs the release-it package as a dev dependency
3. **Copy Configuration**: Creates `.release-it.json` with optimized settings
4. **Initialize GitHub Actions**: Creates `.github/workflows/release.yml` for automated releases
5. **Create Scripts**: Creates `scripts/npm-publish-tool.mjs` for release commits
6. **Update package.json**: Adds a `push-release-commit` script to your package.json

## Generated Files

### `.release-it.json`

Configuration file for release-it with settings for:

- Git tagging and pushing
- GitHub releases with auto-generated release notes
- NPM publishing with provenance

### `.github/workflows/release.yml`

GitHub Actions workflow that:

- Triggers on pushes to main branch
- Detects release commits by pattern
- Automatically publishes releases

### `scripts/npm-publish-tool.mjs`

A script that:

- Reads version from package.json
- Creates a commit with format "release v{version}"
- Pushes changes to remote repository

### Updated `package.json`

Adds a new script:

```json
{
  "scripts": {
    "push-release-commit": "node ./scripts/npm-publish-tool.mjs"
  }
}
```

## Workflow

After initialization, your release workflow becomes:

1. **Make your changes** and commit them normally
2. **Update version** in package.json (manually or using `npm version`)
3. **Create release commit**: `npm run push-release-commit`
4. **Push to main**: The GitHub Action will automatically create the release

## GitHub Repository Setup

To use the automated releases, you need to configure these secrets in your GitHub repository:

### Required Secrets

1. **`NPM_TOKEN`**: Your NPM automation token

   - Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
   - Create an "Automation" token
   - Add it as a repository secret

2. **`ACCESS_TOKEN`**: GitHub Personal Access Token
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` scope
   - Add it as a repository secret

## Example Output

```
🔧 NPM Publish Tool Initialization
──────────────────────────
ℹ️  Initializing release-it configuration in: /path/to/project

──────────────────────────────────────────────────
📋 Step 1: Detecting package manager...
📦 Detected package manager: pnpm (8.15.0)
Progress: [████████████████████] 100%

📋 Step 2: Installing release-it...
📦 Installing release-it using pnpm...
✅ release-it installed successfully
Progress: [████████████████████] 100%

📋 Step 3: Copying .release-it.json configuration...
📁 Created: .release-it.json
Progress: [████████████████████] 100%

📋 Step 4: Setting up GitHub Actions workflow...
📁 Created: .github/workflows/release.yml
Progress: [████████████████████] 100%

📋 Step 5: Creating scripts and CLI tool...
📁 Created: scripts/npm-publish-tool.mjs
Progress: [████████████████████] 100%

📋 Step 6: Adding push-release-commit script to package.json...
📁 Updated: package.json (added push-release-commit script)
Progress: [████████████████████] 100%

──────────────────────────────────────────────────

🎉 Initialization completed successfully!
Your project is now configured with release-it and GitHub Actions.

Next steps:
1. Configure your GitHub repository secrets (NPM_TOKEN, ACCESS_TOKEN)
2. Make changes to your code
3. Run: npm run push-release-commit
4. Your release will be automatically created when pushed to main branch
```

## Requirements

- Node.js 16.0.0 or higher
- A valid package.json in your project
- Git repository (for release commits)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Ryota Murakami](https://ryota-murakami.github.io/)

## Related

- [release-it](https://github.com/release-it/release-it) - The underlying release automation tool
- [eslint-config-ts-prefixer](https://github.com/laststance/eslint-config-ts-prefixer) - Example project using this tool
