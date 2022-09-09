import { TOKEN } from "./const";

export const verify = async (data: string, _sign: string): Promise<string> => {
  const signSlice = _sign.split(":");
  if (!signSlice[signSlice.length - 1]) {
    return "expire missing";
  }
  const expire = parseInt(signSlice[signSlice.length - 1]);
  if (isNaN(expire)) {
    return "expire invalid";
  }
  if (expire < Date.now() && expire > 0) {
    return "expire expired";
  }
  const right = await hmacSha256Sign(data, expire);
  if (_sign !== right) {
    return "sign mismatch";
  }
  return "";
};

export const hmacSha256Sign = async (
  data: string,
  expire: number
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(TOKEN),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const buf = await crypto.subtle.sign(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    key,
    new TextEncoder().encode(`${data}:${expire}`)
  );
  // to base64url
  return (
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_") +
    ":" +
    expire
  );
};
