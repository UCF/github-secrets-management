# GitHub Secrets Management

This project provides a simple node utility for updating a shared repository secret across a GitHub Organization. If your GitHub organization is using a GitHub Teams or Enterprise, this utility is unnecessary as you can manage organizational secrets through the UI interface or through a different set of REST API calls. However, for legacy account or organizations without access to the organizational secrets feature, this can be an effective way of managing secrets.

## Installation

Current, the project is not really "installable" but can be run by calling the node script directly. The run the script you will need to install the project dependencies by running `npm install` and then you can run the script using the [usage information](#usage) below.

In order to run the script against your organization, you will need the following pieces of information:

1. An access token with sufficient permissions for managing repository secrets as well as viewing the repository's public key on all the repositories in your organization.
2. The name of the repository secret to update. This script is intended to update a secret across the organization that uses the same name on all repositories.
3. The value of the secret to be uploaded to each repository.
4. The organization slug. You can obtain this by going to your organization's GitHub home page and copying the slug in the URL immediately after `github.com/`.

## Usage

To run the script, use the following syntax:

```bash
node index.js --token <Your GitHub Token> --secret <The secret name> --value <The secret value> --org <The organization name>
```

Short parameter names can also be used:

```bash
node index.js -t <Your GitHub Token> -s <The secret name> -v <The secret value> -o <The organization name>
```
