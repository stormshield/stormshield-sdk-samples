import { Sdsdk, Protocol } from "sdsdk";

// Init sdsdk instance
export const sdsdk = new Sdsdk({
  defaultKasId: "alice-company",
  kasList: [
    {
      id: "alice-company",
      protocols: [Protocol.SymmetricKas],
      url: "https://alice-company-kmaas:3000/api/v1/025f02fe-bee2-444b-bf76-b5ead30327c0/kas",
      authentication: {
        type: "bearer",
        value: await loadBasicToken(),
      },
    },
  ],
});

export async function loadBasicToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: "alice-company",
    username: "jean.martin",
    password: "password",
  }).toString();

  const response = await fetch(
    `https://alice-company-idp:8443/realms/sep-demo/protocol/openid-connect/token`,
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
