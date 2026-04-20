import { readFileSync, writeFileSync } from "node:fs";
const COLOR_CYAN = "\x1b[36m";
const COLOR_RED = "\x1b[31m";
const COLOR_RESET = "\x1b[0m";
import { sdsdk } from "./1_sdk-configuration.js";

/**
 * Example script that encrypts sample documents using the Stormshield SDK.
 * It demonstrates how data attributes (e.g., `releasableTo` and `team`) are
 * mapped to specific KAS instances defined in `1_sdk-configuration.ts`.
 * The first encryption targets only the alice‑company KAS, while the second
 * encryption targets both alice‑company and bob‑company KASs, illustrating
 * selective multi‑KAS encryption.
 * The resulting `.ztdf` files are written to the `examples/base/data/`
 * directory.
 */

try {
  // Load data to encrypt
  const aliceCompanyConfidentialData = readFileSync(
    "./fixtures/alice-company-confidential-data.pdf",
  );
  const aliceBobInvoice = readFileSync("./fixtures/alice-bob-invoice.jpg");

  // Ecrypt the data with data attributes
  // Encrypt data only for the KAS mapped to "alice-company" (via the "releasableTo" attribute in the mapping section of 1_sdk-configuration.ts)
  const encryptedDataForAlice = await sdsdk.encrypt({
    data: aliceCompanyConfidentialData,
    dataAttributes: [{ releasableTo: "alice-company" }, { team: "finance" }],
  });

  // Encrypt data for both KAS (alice-company and bob-company) as defined by the "releasableTo" attributes in the mapping section of 1_sdk-configuration.ts
  const encryptedDataForAliceAndBob = await sdsdk.encrypt({
    data: aliceBobInvoice,
    dataAttributes: [
      { releasableTo: "alice-company" },
      { releasableTo: "bob-company" },
      { team: "finance" },
    ],
  });

  // Save the encrypted data for Alice's confidential file to a .ztdf archive
  writeFileSync(
    "./data/alice-company-confidential-data.ztdf",
    await encryptedDataForAlice.toZip(),
  );

  // Save the encrypted invoice (shared between Alice and Bob) to a .ztdf archive
  writeFileSync(
    "./data/alice-bob-invoice.ztdf",
    await encryptedDataForAliceAndBob.toZip(),
  );

  console.log(`${COLOR_CYAN}=== Encryption complete ===${COLOR_RESET}`);
  console.log(
    `Both alice-company-confidential-data.pdf and alice-bob-invoice.jpg\n` +
      `have been encrypted and are available in the ./examples/base/data folder\n` +
      `as .ztdf archives.`,
  );
  console.log(`${COLOR_CYAN}=== End of script ===${COLOR_RESET}`);
} catch (err) {
  console.error(`${COLOR_RED}❌ Encryption failed:${COLOR_RESET}`, err);
}
