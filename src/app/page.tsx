/** @format */

// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Video {
  name: string;
  path: string;
  timestamp: number;
}

export default function Home() {
  const [directoryPath, setDirectoryPath] = useState(
    "D:\\DEV - vinod\\FLYXTO\\pears-character-animation-grid\\public\\animations"
  );
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videosPerPage = 6;

  const getRandomVideos = (videos: Video[], count: number) => {
    const shuffled = [...videos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, videos.length));
  };

  const fetchVideos = async () => {
    if (!directoryPath) return;

    try {
      const response = await fetch(
        `/api/videos?dirPath=${encodeURIComponent(directoryPath)}`
      );
      const data = await response.json();

      if (response.ok && data.videos) {
        setAllVideos((prevVideos) => {
          const prevPaths = new Set(prevVideos.map((v) => v.path));
          const newVideos = data.videos.filter(
            (v: Video) => !prevPaths.has(v.path)
          );

          if (newVideos.length > 0) {
            console.log(`Found ${newVideos.length} new video(s)`);
          }

          // Update displayed videos with random selection
          setDisplayedVideos(getRandomVideos(data.videos, videosPerPage));

          return [...data.videos];
        });
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const startMonitoring = () => {
    if (!directoryPath) {
      alert("Please enter a directory path");
      return;
    }

    setIsMonitoring(true);
    fetchVideos();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(fetchVideos, 10000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (allVideos.length > 0) {
      setDisplayedVideos(getRandomVideos(allVideos, videosPerPage));
    }
  }, [allVideos.length]);

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
      <div style={{ marginBottom: "20px", flexShrink: 0 }}>
        <h1 style={{ margin: "0 0 20px 0" }}>Video Grid Monitor</h1>

        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}>
          <input
            type="text"
            value={directoryPath}
            onChange={(e) => setDirectoryPath(e.target.value)}
            placeholder="Enter directory path (e.g., /path/to/videos)"
            style={{
              padding: "10px",
              flex: 1,
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            disabled={isMonitoring}
          />

          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}>
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}>
              Stop Monitoring
            </button>
          )}
        </div>

        {isMonitoring && (
          <div style={{ marginBottom: "20px", color: "#0070f3" }}>
            🔄 Monitoring active - Checking every 10 seconds ({allVideos.length}{" "}
            videos total)
          </div>
        )}
      </div>

      {allVideos.length > 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              width: "100%",
              height: "100%",
              maxHeight: "100%",
            }}>
            {displayedVideos.map((video) => (
              <div
                key={video.path}
                style={{
                  aspectRatio: "1",
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}>
                <video
                  src={`/api/stream?path=${encodeURIComponent(video.path)}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "8px",
                    fontSize: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                  {video.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMonitoring && allVideos.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}>
          Click "Start Monitoring" to begin
        </div>
      )}
    </div>
  );
}
