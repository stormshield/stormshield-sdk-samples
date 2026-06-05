import { createWriteStream, openAsBlob } from "node:fs";
import { Writable } from "node:stream";
import { sdsdk } from "./1_sdk-configuration.js";
import { NodeFileSeekableSource } from "./file-seekable.js";

import { Protocol } from "sdsdk";
// --------------------------------------------------------------------------
// Encrypt a file using streaming APIs
// --------------------------------------------------------------------------
console.log(`Encrypting ./fixtures/confidential-data.txt ...`);
const loadDataStream = await openAsBlob("./fixtures/confidential-data.txt");
// Destination for the encrypted ZTDF archive
const encryptedDataStream = Writable.toWeb(
  createWriteStream("./data/confidential-data.txt.ztdf", { flags: "w" }),
);

try {
  await sdsdk.encryptToStream({
    clearDataStream: loadDataStream.stream(),
    encryptedDataStream,
    protocol: Protocol.SymmetricKas,
  });
  console.log(
    "Encryption via stream completed. Encrypted file written to examples/quick-start/data/confidential-data.txt.ztdf",
  );
} catch (error) {
  console.error("Encryption error:", error);
}

// --------------------------------------------------------------------------
// Decrypt the previously created archive using streaming APIs
// --------------------------------------------------------------------------
console.log(`Decrypting the encrypted data...`);
// Create a seekable source for the encrypted ZTDF file (see: examples/quick-start/file-seekable.ts)
const encryptedZipSource = await NodeFileSeekableSource.fromPath(
  "./data/confidential-data.txt.ztdf",
);

// Destination for the decrypted plaintext
const clearDataStream = Writable.toWeb(
  createWriteStream("./data/confidential-data-decrypted.txt", { flags: "w" }),
) as WritableStream<Uint8Array>;

try {
  await sdsdk.decryptSeekableToStream({
    encryptedZipSource,
    clearDataStream: clearDataStream,
  });
  console.log(
    "Decryption via stream completed. Plain text written to examples/quick-start/data/confidential-data-decrypted.txt",
  );
} catch (error) {
  console.error("Decryption error:", error);
}
