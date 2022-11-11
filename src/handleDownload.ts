import { ADDRESS, TOKEN } from "./const";
import { verify } from "./verify";

export async function handleDownload(request: Request) {
  const origin = request.headers.get("origin") ?? "*";
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname);
  const sign = url.searchParams.get("sign") ?? "";
  const verifyResult = await verify(path, sign);
  if (verifyResult !== "") {
    const resp = new Response(
      JSON.stringify({
        code: 401,
        message: verifyResult,
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
    );
    resp.headers.set("Access-Control-Allow-Origin", origin);
    return resp;
  }

  let resp = await fetch(`${ADDRESS}/api/fs/link`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: TOKEN,
    },
    body: JSON.stringify({
      path: path,
    }),
  });
  let res: any = await resp.json();
  if (res.code !== 200) {
    return new Response(JSON.stringify(res));
  }
  request = new Request(res.data.url, request);
  if (res.data.header) {
    for (const k in res.data.header) {
      for (const v of res.data.header[k]) {
        request.headers.set(k, v);
      }
    }
  }
  let response = await fetch(request);
  // Recreate the response so we can modify the headers
  response = new Response(response.body, response);
  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", origin);
  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append("Vary", "Origin");
  return response;
}
