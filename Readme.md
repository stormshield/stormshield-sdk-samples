# Example of using the Stormshield SDK (Base)

This repository contains a small **TypeScript** project illustrating the main features of the *Stormshield SDK*:

- SDK configuration
- File encryption
- File decryption
- Attribute‑Based Access Control (ABAC)

The project follows the official SDK documentation: <https://documentation.stormshield.eu/SEP/en/Content/SDK_doc/>.

## Example scenario

Two companies, **alice-company** and **bob-company**, need to share and protect confidential documents (invoices, confidential PDFs, etc.). The example demonstrates how to:
- configure the Stormshield SDK for both parties
- encrypt documents to one or multiple KAS instances based on a mapping of data attributes, allowing selective encryption for specific recipients or groups
- decrypt the document by authorized users
- example of file decryption by an unauthorized user, decryption rejected by PDP or IDP

---

## Prerequisites

- **Docker** (for the provided `docker-compose.yml`) – used to run the SEP platform.
- **stormshield/kmaas:4.6.0.309** Docker image – must be loaded from a tgz archive (see note below).
- **stormshield-sdk/sdsdk.tgz** – the SDK archive must be supplied by the user and placed in the `stormshield-sdk/` directory.

## Installation

Before starting, load the required KMaaS image from the supplied tgz archive:

```bash
docker load -i stormshield-kmaas.tgz
```

If you need to use a different version or image name, edit the `image:` field in `docker-compose.yml` accordingly.

All required components are run inside Docker containers; no local Node.js or npm dependencies are needed.

## Starting the SEP stack

First, start the SEP services (IDP, PDP, KMAAS instances) using the `sep` profile:

```bash
docker compose --profile sep up -d
```
## Running the examples

After the SEP stack is up, run the examples inside the `example-base` container:

```bash
# Encryption (2_encrypt.ts)
docker compose run --rm example-base encrypt

# Decryption (3_decrypt.ts)
docker compose run --rm example-base decrypt

# PDD denial (4_pdp-denial.ts)
docker compose run --rm example-base pdp-denial
```

---

## Project structure

- `data/` – example files (PDFs, images, and their encrypted `.ztdf` versions).
- `public-key/` – public keys of the entities (Alice, Bob).
- `src/` (or the `.ts` files at the repository root) – example scripts.
- `dist/` – compiled JavaScript output.
- `Dockerfile` & `docker‑compose.yml` – launch a demonstration SEP container.

---

