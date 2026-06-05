import { readFileSync, writeFileSync } from "node:fs";
import { sdsdk } from "./1_sdk-configuration.js";
import { Protocol, Ztdf } from "sdsdk";

// --------------------------------------------------------------------------
// Encrypt a file
// --------------------------------------------------------------------------
// Load plaintext data to be encrypted
const loadData = readFileSync("./fixtures/confidential-data.txt");
console.log(`Encrypting ./fixtures/confidential-data.txt ...`);
try {
  // Encrypt the data using the SymmetricKas protocol
  const ztdf = await sdsdk.encrypt({
    data: loadData,
    protocol: Protocol.SymmetricKas,
  });
  console.log(
    `Encryption complete. Encrypted file written to examples/quick-start/data/confidential-data.txt.ztdf`,
  );
  // Write the encrypted payload to a file
  writeFileSync("./data/confidential-data.txt.ztdf", await ztdf.toZip());
} catch (error) {
  console.error("Encryption error:", error);
}

// --------------------------------------------------------------------------
// Decrypt the previously created archive
// --------------------------------------------------------------------------
console.log(`Decrypting the encrypted data...`);
try {
  // Load the encrypted ZTDF file from disk
  const zipContent = readFileSync("./data/confidential-data.txt.ztdf");
  // Deserialize the ZTDF container
  const loadedZtdf = await Ztdf.fromZip(zipContent);
  // Decrypt file
  const clearData = await sdsdk.decrypt(loadedZtdf);
  // Save decrypted file
  writeFileSync("./data/confidential-data-decrypted.txt", clearData.data);
  console.log(
    `Decryption complete. Plain text written to examples/quick-start/data/confidential-data-decrypted.txt`,
  );
} catch (error) {
  console.error("Decryption error:", error);
}
