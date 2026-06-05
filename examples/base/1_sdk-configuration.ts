import { readFileSync } from "node:fs";
import { Sdsdk, Protocol, MappingItemType } from "sdsdk";

/**
 * Configuration of the Stormshield SDK for the example scenario.
 *
 * - **defaultKasId**: the KAS used when no explicit target is provided
 *   (here `alice-company`).
 * - **kasList**: definitions of the two Key‑Server instances (Alice and Bob),
 *   including their URLs, supported protocols, public keys and authentication
 *   tokens obtained via `loadBasicToken`.
 * - **mappingSections**: a mapping that links data attributes to KAS IDs.  The
 *   `releasableTo` attribute determines which KAS the encrypted payload will be
 *   used based on the data attributes when the `releasableTo` attribute is set on the data, values "alice-company" and "bob-company" map to the respective
 *   KAS IDs.  This mapping drives the behaviour demonstrated in the encryption
 *   example (`2_encrypt.ts`).
 *
 * The file also exports `loadBasicToken`, a helper that retrieves an OIDC
 * access token from the IDP for a given client/user combination.
 */

// Load public key for both company
const aliceCompanyPK = readFileSync("./public-key/alice-company.pub", "utf8");
const bobCompanyPK = readFileSync("./public-key/bob-company.pub", "utf8");

// Init sdsdk instance
export const sdsdk = new Sdsdk({
  defaultKasId: "alice-company",
  kasList: [
    {
      id: "alice-company",
      protocols: [Protocol.SymmetricKas, Protocol.Kas],
      url: "https://alice-company-kmaas:3000/api/v1/025f02fe-bee2-444b-bf76-b5ead30327c0/kas",
      publicKey: {
        kid: "d408744b-ed05-403e-9166-5eaef1128e37",
        value: aliceCompanyPK,
      },
      authentication: {
        type: "bearer",
        value: await loadBasicToken(
          "alice-company-idp",
          "alice-company",
          "jean.martin",
          "password",
        ),
      },
    },
    {
      id: "bob-company",
      protocols: [Protocol.SymmetricKas, Protocol.Kas],
      url: "https://bob-company-kmaas:3000/api/v1/b0c6c055-8e61-4cde-ae08-c20a3d9ea3d8/kas",
      publicKey: {
        kid: "f19484ec-3fa2-4603-8de4-afc51d762d30",
        value: bobCompanyPK,
      },
      authentication: {
        type: "bearer",
        value: await loadBasicToken(
          "bob-company-idp",
          "bob-company",
          "finn.fischer",
          "password",
        ),
      },
    },
  ],
  // Mapping configuration: dynamically select KAS instances based on dataAttributes.
  // The "releasableTo" attribute determines which KAS(s) will receive the encrypted DEK.
  // See Stormshield SDK documentation (Advanced multiKas configuration with mapping) for details.
  mappingSections: [
    {
      label: "mapping",
      mapping: [
        {
          attributeName: "releasableTo",
          attributeValues: [
            {
              kasIds: ["alice-company"],
              value: "alice-company",
            },
            {
              kasIds: ["bob-company"],
              value: "bob-company",
            },
          ],
          type: MappingItemType.Permissive,
        },
      ],
    },
  ],
});

export async function loadBasicToken(
  host: string,
  clientId: string,
  userName: string,
  password: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    username: userName,
    password,
  }).toString();

  const response = await fetch(
    `https://${host}:8443/realms/sep-demo/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body).toString(),
      },
      body,
    },
  );

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("access_token missing");
  return data.access_token;
}
