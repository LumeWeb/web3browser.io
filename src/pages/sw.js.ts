import type { APIRoute } from "astro";
import * as fs from "node:fs";
import * as path from "node:path";

export const GET: APIRoute = ({params, request}) => {
    const filePath = path.resolve(process.cwd(), "dist/sw.js");
    const fileContents = fs.readFileSync(filePath);
    return new Response(fileContents, { status: 200, headers: { 'Content-Type': 'application/javascript' } });
}