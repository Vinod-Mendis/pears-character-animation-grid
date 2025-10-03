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

  useEffect(() => {
    // Auto-start monitoring on mount
    startMonitoring();
  }, []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden p-5 box-border bg-gray-900"
      style={{ backgroundImage: "url('/bg.png')" }}>
      {allVideos.length > 0 && (
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mx-auto">
            {displayedVideos.map((video) => (
              <div
                key={video.path}
                className="bg-black rounded-lg overflow-hidden relative aspect-square w-full">
                <video
                  src={`/api/stream?path=${encodeURIComponent(video.path)}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {allVideos.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading videos...
        </div>
      )}
    </div>
  );
}
