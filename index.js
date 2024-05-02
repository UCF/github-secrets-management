#!/usr/bin/env node
const { Octokit }  = require('octokit');
const yargs = require('yargs');
const sodium = require('libsodium-wrappers');

const options = yargs
  .usage('Usage: -t <token> -s <secret name> -v <secret value>')
  .option('t', { alias: 'token', describe: 'Your access token for GitHub', type: 'string', demandOption: true })
  .option('s', { alias: 'secret', describe: 'The name of the secret to deploy', type: 'string', demandOption: true })
  .option('v', { alias: 'value', describe: 'The value of the option to deploy', type: 'string', demandOption: true })
  .option('o', { alias: 'org', describe: 'The name of the organization to deploy to', type: 'string', demandOption: true})
  .argv;

const token = options.token;
const secretName = options.secret;
const secretValue = options.value;
const org = options.value;

/**
 * Encrypts a secret using the specified salt
 * @param {string} salt The public key to use to salt the secret
 * @param {string} secret The secret to encrypt
 * @returns
 */
function encryptSecret(salt, secret) {
  let binKey = sodium.from_base64(salt, sodium.base64_variants.ORIGINAL)
  let binSec = sodium.from_string(secret);

  let encBytes = sodium.crypto_box_seal(binSec, binKey);

  return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}

async function main() {
  let keysUpdated = 0;

  const octokit = new Octokit({
    auth: token
  });

  const iterator = await octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
    org: org
  });

  for await (const { data: repositories } of iterator) {
    for (const repo of repositories) {
      const secrets = await octokit.rest.actions.listRepoSecrets({
        owner: org,
        repo: repo.name
      });

      for (const secret of secrets.data.secrets) {
        if (secret.name === secretName) {
          const publicKey = await octokit.rest.actions.getRepoPublicKey({
            owner: org,
            repo: repo.name
          });

          const encryptedSecret = encryptSecret(publicKey.data.key, secretValue);

          const response = await octokit.rest.actions.createOrUpdateRepoSecret({
            owner: org,
            repo: repo.name,
            secret_name: secretName,
            encrypted_value: encryptedSecret,
            key_id: publicKey.data.key_id
          });

          if (response.status > 200 && response.status < 300) {
            keysUpdated++;
          }
        }
      }
    }
  }

  console.log(`Updated ${keysUpdated} secrets!`);
}

main();
