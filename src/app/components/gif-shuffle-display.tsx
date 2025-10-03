/** @format */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GifShuffleDisplay() {
  const [gifFiles, setGifFiles] = useState<string[]>([]);
  const [displayedGifs, setDisplayedGifs] = useState<string[]>([]);
  const numFrames = 3;

  useEffect(() => {
    fetch("/api/gifs")
      .then((res) => res.json())
      .then((data) => {
        setGifFiles(data.gifs);
        const shuffled = [...data.gifs].sort(() => Math.random() - 0.5);
        setDisplayedGifs(shuffled.slice(0, numFrames));
      });
  }, []);

  const getRandomUniqueGifs = useCallback(
    (count: number): string[] => {
      const available = [...gifFiles];
      const result: string[] = [];

      while (result.length < count && available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        result.push(available.splice(randomIndex, 1)[0]);
      }

      return result;
    },
    [gifFiles] // dependency
  );

  useEffect(() => {
    if (gifFiles.length === 0) return;

    const interval = setInterval(() => {
      setDisplayedGifs(getRandomUniqueGifs(numFrames));
    }, 3000);

    return () => clearInterval(interval);
  }, [gifFiles, getRandomUniqueGifs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      {gifFiles.length === 0 ? (
        <div className="text-white text-xl">Loading animations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {displayedGifs.map((gifName, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={gifName}
                  src={`/animations/${gifName}`}
                  alt={gifName.replace(".gif", "")}
                  className="w-full h-full object-cover"
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
