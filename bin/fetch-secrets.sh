#!/usr/bin/env bash

set -euo pipefail

# --- Check dependencies ---
for cmd in aws jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Required command '$cmd' is not installed or not in PATH."
    exit 1
  fi
done

# --- Parse CLI args ---
if [ "$#" -lt 2 ]; then
  echo "
Usage:
  fetch-secrets.sh <secrets.json> <output.json> [--region eu-central-1] [--profile tv2-cms-dev]
"
  exit 1
fi

secrets_file=$1
output_file=$2

region=""
profile=""

shift 2
while [ "$#" -gt 0 ]; do
  case "$1" in
    --region)
      region=$2
      shift 2
      ;;
    --profile)
      profile=$2
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

region=${region:-${AWS_REGION:-}}
profile=${profile:-${AWS_PROFILE:-}}

if [ -z "$region" ]; then
  echo "❌ No AWS region provided. Use --region or set AWS_REGION."
  exit 1
fi

if [ -z "$profile" ]; then
  echo "❌ No AWS profile provided. Use --profile or set AWS_PROFILE."
  exit 1
fi

echo "Using AWS region: $region"
echo "Using AWS profile: $profile"

if ! [ -f "$secrets_file" ]; then
  echo "❌ File not found: $secrets_file"
  exit 1
fi

output_json='{ "Parameters": {} }'

while IFS="=" read -r env_var secret_info; do
  secret_id=$(echo "$secret_info" | jq -r '.SecretId')
  key=$(echo "$secret_info" | jq -r '.Key')

  echo "🔑 Fetching $secret_id ..."

  secret_string=$(aws secretsmanager get-secret-value \
    --secret-id "$secret_id" \
    --region "$region" \
    --profile "$profile" \
    --query SecretString \
    --output text)

  if [ -z "$secret_string" ]; then
    echo "❌ Failed to fetch $secret_id"
    exit 1
  fi

  value=$(echo "$secret_string" | jq -r --arg key "$key" '.[$key]')

  if [ "$value" == "null" ]; then
    echo "⚠️  Key '$key' not found in secret '$secret_id'"
    continue
  fi

  output_json=$(echo "$output_json" | jq --arg k "$env_var" --arg v "$value" '.Parameters[$k] = $v')

done < <(jq -r 'to_entries[] | "\(.key)=\(.value | @json)"' "$secrets_file")

echo "$output_json" | jq '.' > "$output_file"

echo "✅ Secrets written to $output_file"