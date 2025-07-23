#!/usr/bin/env node

//  NOT IN USE AS WE SWITCHED TO BASH INSTEAD

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import fs from "node:fs";

// --- ✅ Parse CLI args ---
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(`
Usage:
  fetch-secrets <secrets.json> <output.json> [--region eu-central-1] [--profile tv2-cms-dev]

Examples:
  fetch-secrets secrets.json output.json --region eu-central-1 --profile tv2-cms-dev
`);
  process.exit(1);
}

const secretsFile = args[0];
const outputFile = args[1];

let regionArg;
let profileArg;

for (let i = 2; i < args.length; i++) {
  if (args[i] === '--region') {
    regionArg = args[i + 1];
    i++;
  } else if (args[i] === '--profile') {
    profileArg = args[i + 1];
    i++;
  }
}

// --- ✅ Resolved region/profile ---
const region = regionArg || process.env.AWS_REGION;
const profile = profileArg || process.env.AWS_PROFILE;

if (!region) {
  console.error("❌ No AWS region provided. Use --region or set AWS_REGION.");
  process.exit(1);
}

if (!profile) {
  console.error("❌ No AWS profile provided. Use --profile or set AWS_PROFILE.");
  process.exit(1);
}

console.log(`Using AWS region: ${region}`);
console.log(`Using AWS profile: ${profile}`);

process.env.AWS_SDK_LOAD_CONFIG = "true";
process.env.AWS_PROFILE = profile;

const client = new SecretsManagerClient({ region });

// --- ✅ Load secrets config ---
let secrets;
try {
  secrets = JSON.parse(fs.readFileSync(secretsFile, "utf8"));
} catch (err) {
  console.error(`❌ Failed to read ${secretsFile}: ${err}`);
  process.exit(1);
}

// --- ✅ Fetch unique secrets ---
const secretsById = new Map();
Object.entries(secrets).forEach(([envVar, { SecretId }]) => {
  secretsById.set(SecretId, null);
});

// Actually fetch them
for (const secretId of secretsById.keys()) {
  console.log(`🔑 Fetching ${secretId} ...`);
  try {
    const data = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
    secretsById.set(secretId, JSON.parse(data.SecretString));
  } catch (err) {
    console.error(`❌ Failed to fetch ${secretId}: ${err}`);
    process.exit(1);
  }
}

// --- ✅ Map env vars & build output ---
const outputObject = { Parameters: {} };

for (const [envVar, { SecretId, Key }] of Object.entries(secrets)) {
  const secretObject = secretsById.get(SecretId);
  const value = secretObject?.[Key];

  if (value === undefined) {
    console.error(`⚠️  Key '${Key}' not found in secret '${SecretId}'`);
    continue;
  }

  outputObject.Parameters[envVar] = value;
}

fs.writeFileSync(outputFile, JSON.stringify(outputObject, null, 2));

console.log(`✅ Secrets written to ${outputFile}`);