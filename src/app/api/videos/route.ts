/** @format */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const animationsDirectory = path.join(
      process.cwd(),
      "public",
      "animations"
    );

    // Check if directory exists
    if (!fs.existsSync(animationsDirectory)) {
      return NextResponse.json({ videos: [] });
    }

    // Read all files from the animations directory
    const files = fs.readdirSync(animationsDirectory);

    // Filter for video files only
    const videoFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogg"].includes(ext);
    });

    return NextResponse.json({ videos: videoFiles });
  } catch (error) {
    console.error("Error reading video files:", error);
    return NextResponse.json({ videos: [] }, { status: 500 });
  }
}
