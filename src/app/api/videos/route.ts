/** @format */

// /** @format */

// import { NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// export async function GET() {
//   try {
//     const animationsDirectory = path.join(
//       process.cwd(),
//       "public",
//       "animations"
//     );

//     // Check if directory exists
//     if (!fs.existsSync(animationsDirectory)) {
//       return NextResponse.json({ videos: [] });
//     }

//     // Read all files from the animations directory
//     const files = fs.readdirSync(animationsDirectory);

//     // Filter for video files only
//     const videoFiles = files.filter((file) => {
//       const ext = path.extname(file).toLowerCase();
//       return [".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogg"].includes(ext);
//     });

//     return NextResponse.json({ videos: videoFiles });
//   } catch (error) {
//     console.error("Error reading video files:", error);
//     return NextResponse.json({ videos: [] }, { status: 500 });
//   }
// }

// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dirPath = searchParams.get("dirPath");

  if (!dirPath) {
    return NextResponse.json(
      { error: "Directory path is required" },
      { status: 400 }
    );
  }

  try {
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(dirPath);
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];

    const videos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .map((file) => ({
        name: file,
        path: path.join(dirPath, file),
        timestamp: fs.statSync(path.join(dirPath, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read directory" },
      { status: 500 }
    );
  }
}
