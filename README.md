# @tv2/aws-secrets-to-env

🔐 Fetch secrets from AWS Secrets Manager and generate a .json file, to use with AWS SAM for local development.

## Prerequisites

- AWS CLI installed and configured
- jq installed

## Usage

```
sh bin/fetch-secrets.sh <secrets.json> <output.json> [--region eu-central-1] [--profile tv2-cms-dev]
```

You can also run the script directly from the remote repository:

```bash
# Fetch secrets from remote repository and execute the script

curl -sSL https://raw.githubusercontent.com/tv2/npp-aws-sam-local-secrets-public/main/bin/fetch-secrets.sh | bash -s -- <args>
```
Example:

```bash
# Fetch secrets and generate local.secrets.json and local.env.json
curl -sSL https://raw.githubusercontent.com/tv2/npp-aws-sam-local-secrets-public/main/bin/fetch-secrets.sh \
  | bash -s -- local.secrets.json local.env.json --region eu-central-1 --profile tv2-cms-dev
```

<!-- ```bash
npx @tv2/aws-secrets-to-env fetch-secrets local.secrets.json local.env.json --region eu-central-1 --profile tv2-cms-dev -->
