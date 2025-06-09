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

<br>

<p align="center">
  <img src="./assets/demo.gif" alt="demo"/>
</p>

<br>

## Usage(after install complete)

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

## 2. GitHub Repository Setup

To use the automated releases, you need to configure these secrets in your GitHub repository:

### Required Secrets

1. **`NPM_TOKEN`**: Your NPM automation token

   - Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
   - Create a token
   - Add it as a repository secret

2. **`ACCESS_TOKEN`**: GitHub Personal Access Token
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` scope
   - Add it as a repository secret

## 3. Update .github/workflows/release.yml

Update the `.github/workflows/release.yml` file with your own build steps.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Ryota Murakami](https://ryota-murakami.github.io/)

## Related

- [release-it](https://github.com/release-it/release-it) - The underlying release automation tool
