/** @format */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoShuffleDisplay() {
  const [videoFiles, setVideoFiles] = useState<string[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<string[]>([]);
  const numFrames = 6;

  const fetchVideos = useCallback(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        setVideoFiles(data.videos);
        const shuffled = [...data.videos].sort(() => Math.random() - 0.5);
        setDisplayedVideos(shuffled.slice(0, numFrames));
      });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Fetch videos every 1 minute
  useEffect(() => {
    const fetchInterval = setInterval(() => {
      fetchVideos();
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(fetchInterval);
  }, [fetchVideos]);

  const getRandomUniqueVideos = useCallback(
    (count: number): string[] => {
      const available = [...videoFiles];
      const result: string[] = [];

      while (result.length < count && available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        result.push(available.splice(randomIndex, 1)[0]);
      }

      return result;
    },
    [videoFiles]
  );

  // Shuffle displayed videos every 3 seconds
  useEffect(() => {
    if (videoFiles.length === 0) return;

    const interval = setInterval(() => {
      setDisplayedVideos(getRandomUniqueVideos(numFrames));
    }, 5000);

    return () => clearInterval(interval);
  }, [videoFiles, getRandomUniqueVideos]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8"
      style={{ backgroundImage: "url('/bg.png')" }}>
      {videoFiles.length === 0 ? (
        <div className="text-white text-xl">Loading videos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl">
          {displayedVideos.map((videoName, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.video
                  key={videoName}
                  src={`/animations/${videoName}`}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
