/** @format */

import { NextResponse } from "next/dist/server/web/spec-extension/response";
import fs from "fs";
import path from "path";

export async function GET() {
  // CHANGE THIS LINE - point to your external folder
  const animationsDir = path.join(process.cwd(), "public", "animations");

  // Replace with absolute path to your external folder:
  // For example:
  //? Windows:
  // const animationsDir = "C:\\Users\\USER\\Downloads\\gifs";
  //? Mac::
  // const animationsDir = '/home/yourname/external-gifs';

  const files = fs.readdirSync(animationsDir);
  const gifFiles = files.filter((file) => file.endsWith(".gif"));

  return NextResponse.json({ gifs: gifFiles });
}
