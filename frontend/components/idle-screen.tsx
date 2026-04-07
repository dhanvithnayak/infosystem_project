"use client"

import { Maximize, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const LUMA_THRESHOLD = 100   // out of 255 — below this is considered too dark
const POLL_INTERVAL_MS = 500

/** Offscreen canvas so we do not race WebGazer's internal preview canvas. */
let eyePatchScratch: HTMLCanvasElement | null = null

/**
 * Mirror WebGazer's face-feedback logic: green box = both eyes' patch bounds
 * lie inside the centered square (see faceFeedbackBoxRatio). We cannot use
 * getCurrentPrediction() — it returns null until regression has a valid prediction,
 * even when the mesh sees the face and the on-screen box is green.
 */
async function isFaceInGuidanceBox(): Promise<boolean> {
  const video = document.getElementById("webgazerVideoFeed") as HTMLVideoElement | null
  if (!video || video.readyState < 2 || video.videoWidth === 0) return false

  const tracker = webgazer.getTracker?.()
  if (!tracker?.getEyePatches) return false

  const w = video.videoWidth
  const h = video.videoHeight
  if (!eyePatchScratch) eyePatchScratch = document.createElement("canvas")
  if (eyePatchScratch.width !== w || eyePatchScratch.height !== h) {
    eyePatchScratch.width = w
    eyePatchScratch.height = h
  }
  const ctx = eyePatchScratch.getContext("2d", { willReadFrequently: true })
  if (!ctx) return false
  ctx.drawImage(video, 0, 0, w, h)

  const patches = await tracker.getEyePatches(video, eyePatchScratch, eyePatchScratch.width, eyePatchScratch.height)
  if (!patches?.left || !patches.right) return false

  const ratio = typeof webgazer.params?.faceFeedbackBoxRatio === "number"
    ? webgazer.params.faceFeedbackBoxRatio
    : 0.66
  const e = w
  const t = h
  const n = Math.min(e, t) * ratio
  const r = (t - n) / 2
  const s = (e - n) / 2
  const a = s + n
  const i = r + n
  const o = patches.left.imagex
  const u = patches.left.imagey
  const l = patches.right.imagex
  const c = patches.right.imagey

  const horiz =
    o > s &&
    o + patches.left.width < a &&
    l > s &&
    l + patches.right.width < a
  const vert =
    u > r &&
    u + patches.left.height < i &&
    c > r &&
    c + patches.right.height < i
  return horiz && vert
}

type Props = {
  onStart: () => void
  slotRef: React.RefObject<HTMLDivElement | null>
}

function sampleLuma(): number | null {
  const video = document.getElementById("webgazerVideoFeed") as HTMLVideoElement | null
  if (!video || video.readyState < 2) return null

  const W = 80, H = 60
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, W, H)
  const { data } = ctx.getImageData(0, 0, W, H)

  let total = 0
  const pixels = W * H
  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    total += 0.299 * r + 0.587 * g + 0.114 * b
  }
  return total / pixels
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {ok
        ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
        : <XCircle className="w-4 h-4 text-destructive shrink-0" />
      }
      <span className={cn(ok ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  )
}

export default function IdleScreen({ onStart, slotRef }: Props) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [faceDetected, setFaceDetected] = useState(false)
  const [lightingOk, setLightingOk] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Attach dummy listener to force WebGazer to continuously generate predictions
    // without this, WebGazer pauses prediction logic if there is no active listener.
    const dummyListener = () => {}
    webgazer.setGazeListener(dummyListener)

    const poll = async () => {
      try {
        setFaceDetected(await isFaceInGuidanceBox())
      } catch {
        setFaceDetected(false)
      }

      const luma = sampleLuma()
      setLightingOk(luma !== null && luma >= LUMA_THRESHOLD)
    }

    void poll()
    intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS)
    return () => {
      webgazer.clearGazeListener()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const onToggleOverlay = () => {
    webgazer.showFaceOverlay(!showOverlay).showFaceFeedbackBox(!showOverlay)
    setShowOverlay(!showOverlay)
  }

  const allChecksPassed = faceDetected && lightingOk

  return (
    <div className="flex-1 grid grid-cols-2 h-[calc(100vh-3.6rem)] mx-64">
      <div className="flex flex-col items-center justify-center gap-6">
        <div ref={slotRef} id="video-preview-slot" className="flex items-center justify-center" />
        <Button variant="outline" onClick={onToggleOverlay} className="gap-2 font-semibold cursor-pointer">
          Toggle Face Overlay
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 p-12">
        <h1 className="text-3xl font-extrabold">Ready to Start?</h1>
        <p className="text-muted-foreground max-w-md text-center font-medium">
          This session requires fullscreen mode for accurate eye tracking.
          Please sit comfortably and ensure your face is well-lit.
        </p>

        {/* Pre-calibration status panel */}
        <Card className="w-full max-w-xs py-4 gap-3">
          <div className="px-4 space-y-1">
            <CardTitle className="text-sm">Camera checks</CardTitle>
          </div>
          <div className="px-4 space-y-2">
            <CheckRow ok={faceDetected} label="Face detected" />
            <CheckRow ok={lightingOk} label="Adequate lighting" />
          </div>
        </Card>

        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={onStart}
            disabled={!allChecksPassed}
            className="gap-2 font-bold px-10 py-5 cursor-pointer"
          >
            <Maximize className="w-5 h-5" />
            Enter Fullscreen & Start
          </Button>
          {!allChecksPassed && (
            <p className="text-muted-foreground text-sm font-medium text-center">
              {!faceDetected && !lightingOk
                ? "Position your face in frame and improve lighting to continue"
                : !faceDetected
                  ? "Position your face in the camera frame to continue"
                  : "Improve room lighting to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}