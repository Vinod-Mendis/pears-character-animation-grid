/** @format */

// app/api/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoPath = searchParams.get("path");

  if (!videoPath) {
    return NextResponse.json(
      { error: "Video path is required" },
      { status: 400 }
    );
  }

  try {
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const headers = new Headers({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "video/mp4",
      });

      return new NextResponse(file as any, {
        status: 206,
        headers,
      });
    } else {
      const headers = new Headers({
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
      });

      const file = fs.createReadStream(videoPath);
      return new NextResponse(file as any, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to stream video" },
      { status: 500 }
    );
  }
}
