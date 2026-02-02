"use client"

import Script from "next/script"
import ContentDashboard from "@/components/content-dashboard"

export default function Home() {
  const handleWebgazerInit = () => {
    const webgazer = (window as any).webgazer;
    
    if (webgazer) {
      webgazer
        .setGazeListener((data: any, clock: any) => {
           // console.log(data); // Uncomment to see data stream
        })
        .saveDataAcrossSessions(false)
        .begin();
        
      // Optional: Hide the video feed and prediction points if you want it invisible
      webgazer.showVideo(false);
      // webgazer.showFaceOverlay(false);
    }
  };

  return (
    <>
      <Script src="/webgazer.js" async onLoad={handleWebgazerInit} />
      <ContentDashboard />
    </>
  );
}
