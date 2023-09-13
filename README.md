# ee-utils

This is a collection of util functions for the Engineering Experience team.

## Usage

In order to use this package locally, you must authenticate with GitHub Packages. A number of options are given [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

The preferred method is to use a PAT token and sign in via `npm login`. You must use the legacy `auth-type` option as below.

```bash
npm login --scope=@NHSDigital --auth-type=legacy --registry=https://npm.pkg.github.com
```

You will be prompted to enter a Username and Password. The Username is your GitHub username and the Password is your PAT token.

**_NOTE:_** This PAT only needs the `read:packages` scope to install packages.

## GitHub Actions

To use this package in a GitHub Action, you must add a few extra steps to the usual `setup-node` workflow.

The `registry-url`, `scope` and `NODE_AUTH_TOKEN` variables must be set as below.

```yaml
- name: Setup Node
  uses: actions/setup-node@v3
  with:
    node-version: "18"
    cache: yarn
    registry-url: "https://npm.pkg.github.com"
    scope: "@NHSDigital"

- name: Install dependencies
  run: make install
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
