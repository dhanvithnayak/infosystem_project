"use client";

import React, { useEffect, useRef } from "react";
import { Video } from "@/types";

interface VideoPlayerProps {
  video: Video | null;
  onEnded: () => void;
}

export default function VideoPlayer({ video, onEnded }: VideoPlayerProps) {
  const gazeDataRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);

  // TODO: De-slopify this code
  useEffect(() => {
    // 1. Set up the listener
    webgazer.setGazeListener((data: any, timestamp: number) => {
      if (data) {
        // Push raw data to our ref
        gazeDataRef.current.push({
          x: data.x,
          y: data.y,
          timestamp: timestamp,
        });
      }
    });

    // 2. The Cleanup Function: Runs when component unmounts
    return () => {
      // Optional: Clear the listener so it doesn't keep running in the background
      webgazer.clearGazeListener();

      // Check if we actually have data to save
      if (gazeDataRef.current.length > 0) {
        // Create the file blob
        const blob = new Blob([JSON.stringify(gazeDataRef.current, null, 2)], {
          type: "application/json",
        });
        
        // Generate a timestamp for the filename
        const date = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `gaze-session-${date}.json`;

        // Create a temporary link and trigger the download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup the DOM
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`Saved ${gazeDataRef.current.length} gaze points.`);
      }
    };
  }, []);

  if (!video) {
    return <div className="p-4 text-center text-destructive">Video data is unavailable</div>;
  }

  if (video.source_type === "REMOTE") {
    // Note: 'enablejsapi=1' is REQUIRED for onEnded detection
    const embedSrc = `${video.meta.embed_url}?rel=0&autoplay=1&fs=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black w-screen h-screen">
        <iframe
          src={embedSrc}
          title={video.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        />
      </div>
    );
  }

  if (video.source_type === "LOCAL") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black w-screen h-screen">
        <video
          controls
          autoPlay
          className="h-full w-full"
          onEnded={onEnded}
          poster={video.meta.thumbnail_url || undefined}
        >
          <source src={video.meta.cdn_url} type={video.meta.mime_type} />
          Your browser does not support the video tag
        </video>
      </div>
    );
  }

  return <div className="p-4 text-center text-red-500">Unsupported Video Type</div>;
}