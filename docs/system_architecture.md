# System Architecture

## Overview

EE Utils is a collection of code that is shared between various projects. The schemas for the AWS DocumentDB are defined in the `mongodb` directory. The `src` directory contains shared code used in lambdas.

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Dependencies](#dependencies)

## Technologies Used

- **Node.js**: Node.js is an open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside a web browser. The EE Dashboard Backend is written in Node.js.
- **AWS SDK**: The AWS SDK for JavaScript is a collection of tools for developers to create applications and manage services. It is used to interact with AWS services.
- **Octokit**: Octokit is a GitHub API client for Node.js. It is used to fetch data from GitHub.
- **Vitest**: Vitest is a testing framework for Node.js.

## Installation

To set up this project, you will need Node.js and Yarn installed. Follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/NHSDigital/ee-utils.git
   cd ee-utils
   ```

2. Install the dependencies:

   ```sh
    yarn install
   ```

## Deployment

EE Utils is deployed using GitHub Actions and GitHub Packages. The deployment process is automated using GitHub Actions. Run the actions on GitHub to deploy new versions of this package. You can find the deployment configuration in the `.github/workflows` directory.

## Testing

The EE Dashboard Backend uses Vitest for testing. To run the tests, use the following commands:

```sh
yarn test
```

## Dependencies

Many projects depend on this one for shared code. The following projects use EE Utils:

- [EE Dashboard Backend](https://github.com/NHSDigital/ee-dashboard-backend)
- [EE Dashboard Frontend](https://github.com/NHSDigital/ee-dashboard-frontend)
- [Github Scanning Utils](https://github.com/NHSDigital/github-scanning-utils)
- [Repo Meta Data](https://github.com/NHSDigital/repo-meta-data)
