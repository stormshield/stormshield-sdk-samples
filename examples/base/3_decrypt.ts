import { readFileSync, writeFileSync } from "node:fs";

// ANSI color codes for console output
const COLOR_CYAN = "\x1b[36m";
const COLOR_RED = "\x1b[31m";
const COLOR_RESET = "\x1b[0m";
import { sdsdk } from "./1_sdk-configuration.js";
import { Ztdf } from "sdsdk";

try {
  // Load data to encrypt
  const encryptedFileForAlice = readFileSync(
    "./data/alice-company-confidential-data.ztdf",
  );
  const encryptedFileForAliceAndBob = readFileSync(
    "./data/alice-bob-invoice.ztdf",
  );

  // Create Ztdf object from .ztdf files
  const encryptedDataForAlice = await Ztdf.fromZip(encryptedFileForAlice);
  const clearDataForAlice = await sdsdk.decrypt(encryptedDataForAlice);

  // Decrypt the ztdf object
  const encryptedDataForAliceAndBob = await Ztdf.fromZip(
    encryptedFileForAliceAndBob,
  );
  const clearDataForAliceAndBob = await sdsdk.decrypt(
    encryptedDataForAliceAndBob,
  );

  // Write clear data
  writeFileSync(
    "./data/alice-company-confidential-data.pdf",
    clearDataForAlice.data,
  );
  writeFileSync("./data/alice-bob-invoice.jpg", clearDataForAliceAndBob.data);

  console.log(`${COLOR_CYAN}=== Decryption complete ===${COLOR_RESET}`);
  console.log(`Both encrypted files have now been decrypted:
    alice-company-confidential-data.ztdf → alice-company-confidential-data.pdf
    alice-bob-invoice.ztdf → alice-bob-invoice.jpg
The decrypted PDFs and images are available in the examples/base/data directory`);
  console.log(`${COLOR_CYAN}=== End of script ===${COLOR_RESET}`);
} catch (err) {
  console.error(`${COLOR_RED}❌ Decryption failed:${COLOR_RESET}`, err);
}
