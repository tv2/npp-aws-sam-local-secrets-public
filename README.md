
# npp-aws-sam-local-secrets-public
🔐 Fetch secrets from AWS Secrets Manager and generate a `.json` file — to use with AWS SAM for local development.


---

## ✅ Prerequisites

Before running the script, make sure you have:

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured with the correct `--profile`.
- [`jq`](https://stedolan.github.io/jq/) installed.

---

## 🚀 Usage
Run the script locally:
```bash
bash bin/fetch-secrets.sh <secrets.json> <output.json> [--region eu-central-1] [--profile tv2-cms-dev]
```

## 🔗 Run directly from GitHub
You can also run the script directly without cloning:

```bash
curl -sSL https://raw.githubusercontent.com/tv2/npp-aws-sam-local-secrets-public/main/bin/fetch-secrets.sh | bash -s -- <secrets.json> <output.json> [--region ...] [--profile ...]
```

Example:
```bash
# Fetch secrets and generate local.env.json from local.secrets.json
curl -sSL https://raw.githubusercontent.com/tv2/npp-aws-sam-local-secrets-public/main/bin/fetch-secrets.sh \
  | bash -s -- local.secrets.json local.env.json --region eu-central-1 --profile tv2-cms-dev
```

## 📂 Example secrets.json
See example.secrets.json for the expected format of the input file.

## ⚙️ Using with AWS SAM
To use the generated secrets with AWS SAM, pass the output file using `--env-vars`:

```bash
sam local start-api --env-vars local.env.json
```
### 🔒 Security tip
The generated secrets file (local.env.json) contains real secret values.
Always add it to .gitignore so it’s never committed to Git!
Example .gitignore:
```
# Local AWS secrets
local.env.json
```

✅ That’s it — happy secret fetching!