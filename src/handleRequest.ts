import { handleDownload } from "./handleDownload";
import { handleOptions } from "./handleOptions";

export async function handleRequest(request: Request) {
    if (request.method === "OPTIONS") {
        return handleOptions(request);
    }
    return await handleDownload(request);
}