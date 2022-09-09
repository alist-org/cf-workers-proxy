import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64url";
import { TOKEN } from "./handleDownload";

export const verify = (data: string, sign: string): string => {
  const signSlice = sign.split(":");
  if (!signSlice[signSlice.length - 1]) {
    return "expire missing";
  }
  const expire = parseInt(signSlice[signSlice.length - 1]);
  if (isNaN(expire)) {
    return "expire invalid";
  }
  if (expire < Date.now()) {
    return "expire expired";
  }
  const right = Base64.stringify(hmacSHA512(`${data}:${expire}`, TOKEN));
  if (sign !== right) {
    return "sign mismatch";
  }
  return "";
};
