## Intro

I need you to create an npm package named `@lastsntance/npm-publish-tool` that automates the setup of `release-it` in user projects. This tool should streamline the process of creating releases with proper versioning, changelogs, and GitHub releases. The goal is to simplify the release process for developers using `release-it`.

## Prepare

- Create `setup.mjs` and write application logic in this file. and store provided templates in `templates` directory.
- Attach the CLI script to the `package.json`'s `bin` field under the command `setup.mjs` so users can run it with `npx @lastsntance/npm-publish-tool setup`.
- Application Logic run with `npx @lastsntance/npm-publish-tool setup` command.

## Application Logic

install the `release-it` npm package using the user's project's package manager (npm, yarn, pnpm).

- Copy the provided `.release-it.json` and `.github/workflows/release.yml` templates into the user's project.
- Create a CLI script in user's project `scripts/npm-publish-tool.mjs` that:
  - Reads the version from the project's `package.json` file.
  - Commits the changes with the message "release v{package_version}".
  - Pushes the commit to the remote repository.
- add { "release-commit": "node ./scripts/npm-publish-tool.mjs" } field in "script" user's package.json
- These processes need to display their current state to the user from the Terminal using rich and graphical visual representations.
- Especially when the setup is complete, it should be clearly message displayed using the 🎉 emoji.

## Templates

.release-it.json

```json
{
  "git": {
    "changelog": null,
    "tag": true,
    "push": true,
    "commit": false
  },
  "github": {
    "release": true,
    "releaseName": "v${version}",
    "releaseNotes": "git log --no-merges --pretty=format:\"* %s %h\" ${latestTag}...main | grep -v 'release v[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}'
"
  },
  "npm": {
    "publishArgs": ["--provenance"]
  }
}
```

release.yml

```yaml
concurrency:
  cancel-in-progress: true
  group: ${{ github.workflow }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: ./.github/actions/prepare
      - run: git config user.name "${{ GITHUB_ACTOR }}"
      - run: git config user.email "${{ GITHUB_ACTOR }}@users.noreply.github.com"
      - env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
      - env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        run: |
          if git log --format=%B -n 1 | grep -q 'release v[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'; then
            pnpm release-it --no-increment  --verbose
          fi

name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write
```
