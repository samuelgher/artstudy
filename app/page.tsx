"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Palette, 
  Calendar, 
  Activity, 
  BookOpen, 
  Briefcase, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Sparkles, 
  Camera, 
  Undo, 
  Trash2, 
  Settings, 
  HelpCircle, 
  Grid, 
  FlipHorizontal, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronDown, 
  Flame, 
  Award, 
  Download, 
  Layers, 
  Maximize2, 
  Volume2, 
  VolumeX,
  X,
  Plus
} from "lucide-react";
import { GESTURE_POSES, DAILY_CHALLENGES, GESTURE_POSES as posesList, Pose, PracticeSession } from "@/lib/references";

// Helper functions for dynamic ID generation to maintain purity in component body
function generateSessionId() {
  return "session-" + Date.now();
}

function generateCustomPoseId() {
  return "pose-custom-" + Date.now();
}

export default function Page() {
  // Navigation & Core View
  const [activeTab, setActiveTab] = useState<"practice" | "challenges" | "anatomy" | "portfolio" | "settings" | "support">("practice");
  const [poseIndex, setPoseIndex] = useState<number>(0);
  const selectedPose = GESTURE_POSES[poseIndex] || GESTURE_POSES[0];

  // Timer States
  const [timerDuration, setTimerDuration] = useState<number>(180); // Default 3m (180s)
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<"off" | "metronome" | "bell">("bell");

  // Display & Canvas States
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(true); // default grayscale
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showSkeletalOverlay, setShowSkeletalOverlay] = useState<boolean>(false);
  const [canvasSplit, setCanvasSplit] = useState<boolean>(true); // Split-screen sketchpad
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [anatomyNotesExpanded, setAnatomyNotesExpanded] = useState<boolean>(true);

  // Drawing Pad States
  const [strokeColor, setStrokeColor] = useState<string>("#ffb800"); // Standard Amber default
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [strokeOpacity, setStrokeOpacity] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawHistory, setDrawHistory] = useState<string[]>([]);
  const drawingRef = useRef<boolean>(false);
  const [canvasCleared, setCanvasCleared] = useState<number>(0);

  // Web Camera Capture
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Challenge Session Tracker
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengePoseIndices, setChallengePoseIndices] = useState<number[]>([]);
  const [challengeCurrentStep, setChallengeCurrentStep] = useState<number>(0);

  // Gamification (Stored in LocalStorage)
  const [level, setLevel] = useState<number>(12);
  const [xp, setXp] = useState<number>(450);
  const [completedSessions, setCompletedSessions] = useState<PracticeSession[]>([]);
  const [streak, setStreak] = useState<number>(5); // 5 days default

  // AI Critique States
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [critiqueResult, setCritiqueResult] = useState<any | null>(null);
  const [showCritiqueModal, setShowCritiqueModal] = useState<boolean>(false);

  // Settings & Customization
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0.5);
  const [customImageUrl, setCustomImageUrl] = useState<string>("");

  // Refs for dynamic pan
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web Audio Context for Metronome / Ticks
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. Load data from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = localStorage.getItem("artstudy_sessions");
      const storedXp = localStorage.getItem("artstudy_xp");
      const storedLevel = localStorage.getItem("artstudy_level");
      const storedStreak = localStorage.getItem("artstudy_streak");

      const timer = setTimeout(() => {
        if (storedSessions) {
          setCompletedSessions(JSON.parse(storedSessions));
        }
        if (storedXp) {
          setXp(parseInt(storedXp));
        }
        if (storedLevel) {
          setLevel(parseInt(storedLevel));
        }
        if (storedStreak) {
          setStreak(parseInt(storedStreak));
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);



  // Audio trigger helper
  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(metronomeVolume * 0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context block:", e);
    }
  };

  // Award XP & Level calculation
  function addXP(amount: number) {
    setXp((prevXp) => {
      const totalXp = prevXp + amount;
      const nextLevel = Math.floor(totalXp / 1000) + 12; // Base 12 Level
      if (nextLevel > level) {
        setLevel(nextLevel);
        playSound(523.25, "sine", 0.5); // level up chord (C)
        setTimeout(() => playSound(659.25, "sine", 0.5), 150); // E
        setTimeout(() => playSound(783.99, "sine", 0.8), 300); // G
      }
      localStorage.setItem("artstudy_xp", totalXp.toString());
      localStorage.setItem("artstudy_level", nextLevel.toString());
      return totalXp;
    });
  }

  // Finish challenge
  function completeChallengeAward() {
    const challenge = DAILY_CHALLENGES.find((c) => c.id === activeChallengeId);
    if (challenge) {
      addXP(challenge.xpReward);
      alert(`🎉 Challenge Completed! You earned +${challenge.xpReward} XP!`);
    }
    setActiveChallengeId(null);
    setChallengePoseIndices([]);
    setChallengeCurrentStep(0);
    setActiveTab("portfolio");
  }



  // Start/Restart general timer
  const handleStartTimer = () => {
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
  };

  // Skip to next pose
  function handleNextPose() {
    setCritiqueResult(null);
    if (activeChallengeId) {
      // If doing challenge
      if (challengeCurrentStep < challengePoseIndices.length - 1) {
        const nextStep = challengeCurrentStep + 1;
        setChallengeCurrentStep(nextStep);
        setPoseIndex(challengePoseIndices[nextStep]);
        setTimeLeft(timerDuration);
        setIsTimerRunning(true);
      } else {
        // Completed Challenge!
        completeChallengeAward();
      }
    } else {
      // General loop
      const nextIndex = (poseIndex + 1) % GESTURE_POSES.length;
      setPoseIndex(nextIndex);
      setTimeLeft(timerDuration);
      setIsTimerRunning(isTimerRunning); // keep running state
    }
  }

  function handlePrevPose() {
    setCritiqueResult(null);
    if (activeChallengeId) {
      if (challengeCurrentStep > 0) {
        const prevStep = challengeCurrentStep - 1;
        setChallengeCurrentStep(prevStep);
        setPoseIndex(challengePoseIndices[prevStep]);
        setTimeLeft(timerDuration);
      }
    } else {
      const prevIndex = (poseIndex - 1 + GESTURE_POSES.length) % GESTURE_POSES.length;
      setPoseIndex(prevIndex);
      setTimeLeft(timerDuration);
    }
  }

  // Custom presets
  const handlePresetSelect = (seconds: number) => {
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setIsTimerRunning(false);
  };

  // Drawing Canvas setup & events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset size based on offset dimensions
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = canvas.parentElement?.clientHeight || 450;

    // Canvas background
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [canvasSplit, canvasCleared, activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawingRef.current = true;
    const pos = getEventPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.globalAlpha = strokeOpacity;
    
    // Trigger tick sound on starting a line (extremely responsive tactile feedback)
    if (soundMode === "metronome") {
      playSound(600, "sine", 0.02);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getEventPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    
    // Save drawing to history for Undo
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawHistory((prev) => [...prev, canvas.toDataURL()]);
    }
  };

  const getEventPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Undo stroke
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const history = [...drawHistory];
    history.pop(); // remove current state
    setDrawHistory(history);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (history.length > 0) {
      const img = new Image();
      img.src = history[history.length - 1];
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
    setCanvasCleared((p) => p + 1);
  };

  // Active Challenge Selection
  const startChallenge = (challenge: any) => {
    setActiveChallengeId(challenge.id);
    const poseIds = challenge.poses;
    // Map string pose IDs to index in array
    const indices = poseIds.map((id: string) => 
      GESTURE_POSES.findIndex((p) => p.id === id)
    ).filter((idx: number) => idx !== -1);
    
    setChallengePoseIndices(indices);
    setChallengeCurrentStep(0);
    setPoseIndex(indices[0]);
    setTimerDuration(challenge.presetDuration);
    setTimeLeft(challenge.presetDuration);
    setIsTimerRunning(true);
    setActiveTab("practice");
    setCanvasSplit(true);
    handleClearCanvas();
  };



  // Complete session via drawing save
  function handleSaveDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    
    const newSession: PracticeSession = {
      id: generateSessionId(),
      poseId: selectedPose.id,
      poseName: selectedPose.name,
      poseUrl: selectedPose.url,
      sketchUrl: dataUrl,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      duration: timerDuration - timeLeft,
      critique: critiqueResult || undefined
    };

    const updated = [newSession, ...completedSessions];
    setCompletedSessions(updated);
    localStorage.setItem("artstudy_sessions", JSON.stringify(updated));

    // Gamification
    addXP(100); // 100 XP per completed drawing
    handleClearCanvas();

    // Notify user with soft sound
    playSound(660, "sine", 0.2);
  }

  // Auto handle timer completion
  function handleSessionCompletedAuto() {
    if (activeChallengeId) {
      // Save draw and proceed
      handleSaveDrawing();
      setTimeout(() => {
        handleNextPose();
      }, 1000);
    } else {
      // General alert
      playSound(523.25, "triangle", 0.5);
    }
  }

  // Timer Core logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          
          // Play tick or alert sounds
          if (nextTime === 0) {
            if (soundMode === "bell") {
              playSound(880, "triangle", 1.2); // Bell chime
            }
            setIsTimerRunning(false);
            handleSessionCompletedAuto();
          } else if (soundMode === "metronome") {
            playSound(440, "sine", 0.05); // Metronome click
          }
          
          return nextTime;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timeLeft, soundMode]);





  // AI Critique Submission
  const handleTriggerAiCritique = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAiLoading(true);
    setCritiqueResult(null);

    const dataUrl = canvas.toDataURL("image/png");

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSketch: dataUrl,
          referenceUrl: selectedPose.url,
          poseName: selectedPose.name,
          anatomyFocus: selectedPose.focus
        })
      });

      const result = await response.json();

      if (response.ok) {
        setCritiqueResult(result);
        setShowCritiqueModal(true);
        addXP(150); // Extra XP for getting a lesson critique!
      } else {
        alert("Critique Error: " + (result.error || "Something went wrong"));
      }
    } catch (err: any) {
      alert("Network or connection error. Please ensure GEMINI_API_KEY is configured in the Secrets Panel. Error: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Camera Sketchpad Capture
  const handleStartCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Unable to open device camera. Make sure frame permissions are enabled and camera is connected.");
      setIsCameraActive(false);
    }
  };

  const handleCaptureCamera = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw camera frame into sketch canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Save state
    setDrawHistory((prev) => [...prev, canvas.toDataURL()]);

    // Close camera stream
    handleStopCamera();
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setIsCameraActive(false);
  };

  // Add custom user reference link
  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    const customPose: Pose = {
      id: generateCustomPoseId(),
      name: "Custom Reference Figure",
      url: customImageUrl,
      tags: ["Custom", "User Upload"],
      focus: "General Silhouette & Proportion Study",
      notes: [
        "Align head, shoulder grid, and pelvic girdle relative to base support.",
        "Ensure weight distribution aligns with leading limbs.",
        "Check negative space between limbs for perfect balance."
      ],
      skeleton: { joints: [], bones: [] }
    };

    // Add to list and set active
    GESTURE_POSES.push(customPose);
    setPoseIndex(GESTURE_POSES.length - 1);
    setCustomImageUrl("");
  };

  // Zoom Helpers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.5, 3.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.5, 1.0));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  // Pan Mouse Handlers
  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomLevel === 1) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    setPanX(newX);
    setPanY(newY);
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans antialiased selection:bg-[#ffb800]/30 select-none">
      
      {/* 1. LEFT SIDEBAR: Pinned Navigation (280px) */}
      <nav className="w-sidebar-width h-full bg-[#1c1b1b] border-r border-[#514532]/40 flex flex-col py-6 px-4 z-40 shrink-0">
        
        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#514532]/60 flex items-center justify-center overflow-hidden">
            <Palette className="text-[#ffdca1] w-5 h-5 fill-[#ffdca1]/20" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[#ffdca1] tracking-tight leading-none">ArtStudy</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/20 rounded">
                Level {level}
              </span>
              <span className="text-[10px] font-mono text-[#d5c4ab]">{xp % 1000} / 1000 XP</span>
            </div>
          </div>
        </div>

        {/* Gamified Stat Bar */}
        <div className="mb-6 p-3 bg-[#201f1f] rounded border border-[#514532]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#d5c4ab] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]/20" /> Daily Streak
            </span>
            <span className="text-[#ffdca1] font-bold">{streak} Days</span>
          </div>
          <div className="w-full bg-[#131313] h-1 rounded overflow-hidden">
            <div className="bg-[#ffb800] h-full transition-all duration-300" style={{ width: `${(xp % 1000) / 10}%` }}></div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab("practice"); setActiveChallengeId(null); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left ${
              activeTab === "practice" 
                ? "bg-[#353534]/50 border-r-2 border-[#ffb800] text-[#ffdca1] font-medium" 
                : "text-[#d5c4ab] hover:bg-[#201f1f] hover:text-[#e5e2e1]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="font-display text-sm">Gesture Practice</span>
          </button>

          <button 
            onClick={() => setActiveTab("challenges")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left ${
              activeTab === "challenges" 
                ? "bg-[#353534]/50 border-r-2 border-[#ffb800] text-[#ffdca1] font-medium" 
                : "text-[#d5c4ab] hover:bg-[#201f1f] hover:text-[#e5e2e1]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="font-display text-sm">Daily Challenges</span>
          </button>

          <button 
            onClick={() => setActiveTab("anatomy")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left ${
              activeTab === "anatomy" 
                ? "bg-[#353534]/50 border-r-2 border-[#ffb800] text-[#ffdca1] font-medium" 
                : "text-[#d5c4ab] hover:bg-[#201f1f] hover:text-[#e5e2e1]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-display text-sm">Anatomy Modules</span>
          </button>

          <button 
            onClick={() => setActiveTab("portfolio")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left ${
              activeTab === "portfolio" 
                ? "bg-[#353534]/50 border-r-2 border-[#ffb800] text-[#ffdca1] font-medium" 
                : "text-[#d5c4ab] hover:bg-[#201f1f] hover:text-[#e5e2e1]"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="font-display text-sm">Student Portfolio</span>
          </button>
        </div>

        {/* Primary CTA Bottom Anchor */}
        <div className="mt-auto pt-4 border-t border-[#514532]/30 space-y-3">
          <button 
            onClick={handleStartTimer}
            className="w-full bg-[#ffb800] text-[#412d00] font-display text-sm font-semibold py-2 rounded hover:bg-[#ffdca1] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Session
          </button>

          {/* Quick links */}
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-3 px-3 py-1.5 rounded text-xs text-[#d5c4ab] hover:bg-[#201f1f]"
            >
              <Settings className="w-3.5 h-3.5 text-[#9e8f78]" />
              Settings
            </button>
            <button 
              onClick={() => setActiveTab("support")}
              className="flex items-center gap-3 px-3 py-1.5 rounded text-xs text-[#d5c4ab] hover:bg-[#201f1f]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#9e8f78]" />
              Support & Shortcuts
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN CENTER AREA: Focal Workspace (Flexible aspect viewport) */}
      <main className="flex-1 h-full flex flex-col min-w-0 bg-[#0e0e0e] relative">
        
        {/* Top Controls Bar */}
        <header className="h-14 border-b border-[#514532]/30 px-6 flex items-center justify-between z-30 bg-[#131313]/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-display font-semibold text-[#ffdca1]">
              {activeTab === "practice" && (activeChallengeId ? `Challenge Active Step ${challengeCurrentStep + 1}` : "Gesture Practice Frame")}
              {activeTab === "challenges" && "Art Challenges Portal"}
              {activeTab === "anatomy" && "Dynamic Anatomy Training"}
              {activeTab === "portfolio" && "Completed Student Portfolio"}
              {activeTab === "settings" && "Custom workspace settings"}
              {activeTab === "support" && "Knowledge base & Guide"}
            </h2>
          </div>

          {/* Timer Display over Frame */}
          {activeTab === "practice" && (
            <div className="flex items-center gap-3 bg-[#1c1b1b]/80 border border-[#514532]/60 rounded-full py-1.5 px-4">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" fill="none" r="10" stroke="#2a2a2a" strokeWidth="2"></circle>
                  <circle 
                    className="transition-all duration-1000" 
                    cx="12" 
                    cy="12" 
                    fill="none" 
                    r="10" 
                    stroke="#FFB800" 
                    strokeWidth="2"
                    strokeDasharray="62.8"
                    strokeDashoffset={62.8 - (62.8 * (timeLeft / timerDuration))}
                  ></circle>
                </svg>
              </div>
              <span className="font-mono text-sm text-[#ffb800] tracking-wider font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Practice view controls */}
          {activeTab === "practice" && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUndo} 
                disabled={drawHistory.length === 0}
                className="p-1.5 bg-[#201f1f] border border-[#514532]/40 rounded hover:text-[#ffdca1] disabled:opacity-40 transition-all text-[#d5c4ab]"
                title="Undo Stroke"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={handleClearCanvas}
                className="p-1.5 bg-[#201f1f] border border-[#514532]/40 rounded hover:text-red-400 transition-all text-[#d5c4ab]"
                title="Clear Sketchpad"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-[#514532]/40 mx-1"></div>
              <button 
                onClick={handleZoomIn}
                className="p-1.5 bg-[#201f1f] border border-[#514532]/40 rounded hover:text-[#ffdca1] transition-all text-[#d5c4ab]"
                title="Zoom In"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                className="text-xs px-2 py-1 bg-[#201f1f] border border-[#514532]/40 rounded text-[#d5c4ab] hover:text-[#ffdca1]"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          )}
        </header>

        {/* View switching logic */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* TAB: Practice Workspace */}
            {activeTab === "practice" && (
              <motion.div 
                key="practice-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex overflow-hidden p-6 gap-6"
              >
                
                {/* Image Reference Frame Panel */}
                <div 
                  className={`relative flex flex-col justify-between bg-[#131313] border border-[#514532]/40 rounded-lg overflow-hidden flex-1 select-none`}
                  onMouseDown={handlePanStart}
                  onMouseMove={handlePanMove}
                  onMouseUp={handlePanEnd}
                  onMouseLeave={handlePanEnd}
                >
                  <div className="p-3 border-b border-[#514532]/30 flex justify-between items-center bg-[#1c1b1b] z-20">
                    <span className="text-xs font-mono text-[#d5c4ab]">{selectedPose.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/20 rounded px-1.5 py-0.5">
                        {selectedPose.focus}
                      </span>
                    </div>
                  </div>

                  {/* Absolute image container */}
                  <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
                    <div 
                      className="relative w-full h-full max-w-4xl max-h-[90%] transition-transform duration-100"
                      style={{ 
                        transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                        cursor: zoomLevel > 1 ? "grab" : "default"
                      }}
                    >
                      <img 
                        src={selectedPose.url} 
                        alt={selectedPose.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                          isFlipped ? "scale-x-[-1]" : ""
                        } ${isGrayscale ? "grayscale contrast-[1.1]" : "contrast-[1.02]"}`}
                      />

                      {/* Rule of Thirds Grid Overlay */}
                      {showGrid && (
                        <div className="absolute inset-0 grid-overlay z-10 pointer-events-none"></div>
                      )}

                      {/* Skeletal Anatomy Overlays */}
                      {showSkeletalOverlay && selectedPose.skeleton.joints.length > 0 && (
                        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                          {selectedPose.skeleton.bones.map((bone, idx) => {
                            const fromJ = selectedPose.skeleton.joints.find((j) => j.name === bone.from);
                            const toJ = selectedPose.skeleton.joints.find((j) => j.name === bone.to);
                            if (!fromJ || !toJ) return null;
                            
                            // Map coordinates to percentage layout
                            const fromX = isFlipped ? (100 - fromJ.x) : fromJ.x;
                            const toX = isFlipped ? (100 - toJ.x) : toJ.x;
                            
                            return (
                              <line 
                                key={idx}
                                x1={`${fromX}%`} 
                                y1={`${fromJ.y}%`} 
                                x2={`${toX}%`} 
                                y2={`${toJ.y}%`} 
                                stroke="#ffb800"
                                strokeWidth="3"
                                strokeOpacity="0.75"
                                strokeDasharray="4 2"
                              />
                            );
                          })}
                          {selectedPose.skeleton.joints.map((joint, idx) => {
                            const jX = isFlipped ? (100 - joint.x) : joint.x;
                            return (
                              <circle 
                                key={idx}
                                cx={`${jX}%`} 
                                cy={`${joint.y}%`} 
                                r="4" 
                                fill="#ffffff" 
                                stroke="#ffb800" 
                                strokeWidth="2.5" 
                              />
                            );
                          })}
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Left-panel base overlay controls */}
                  <div className="p-3 border-t border-[#514532]/30 flex justify-between bg-[#1c1b1b] z-20">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setShowGrid(!showGrid)}
                        className={`text-[10px] font-mono px-2 py-1 border rounded transition-all flex items-center gap-1 ${
                          showGrid 
                            ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]" 
                            : "bg-[#201f1f] border-[#514532]/40 text-[#d5c4ab]"
                        }`}
                      >
                        <Grid className="w-3 h-3" /> Rule of Thirds
                      </button>
                      <button 
                        onClick={() => setShowSkeletalOverlay(!showSkeletalOverlay)}
                        className={`text-[10px] font-mono px-2 py-1 border rounded transition-all flex items-center gap-1 ${
                          showSkeletalOverlay 
                            ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]" 
                            : "bg-[#201f1f] border-[#514532]/40 text-[#d5c4ab]"
                        }`}
                      >
                        <Layers className="w-3 h-3" /> Skeleton Guide
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-[#9e8f78] hidden sm:block">Hover and drag to pan when zoomed</span>
                  </div>
                </div>

                {/* TAB SPLIT: Split Screen sketchpad */}
                {canvasSplit && (
                  <div className="w-[50%] h-full flex flex-col bg-[#131313] border border-[#514532]/40 rounded-lg overflow-hidden relative">
                    <div className="p-3 border-b border-[#514532]/30 flex justify-between items-center bg-[#1c1b1b]">
                      <span className="text-xs font-mono text-[#d5c4ab]">Sketch Drawing Canvas</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleStartCamera}
                          className="text-[10px] bg-[#2a2a2a] hover:bg-[#393939] border border-[#514532]/40 text-[#e5e2e1] px-2.5 py-1 rounded flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" /> Paper Drawing Camera
                        </button>
                        <button 
                          onClick={handleClearCanvas}
                          className="text-[10px] border border-[#514532]/40 text-red-400 px-2.5 py-1 rounded hover:bg-[#201f1f]"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 w-full bg-[#1c1b1b] relative overflow-hidden">
                      <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                      />

                      {/* Camera capture viewport overlay */}
                      {isCameraActive && (
                        <div className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center p-4">
                          <div className="w-full max-w-sm aspect-video rounded border border-[#ffb800] overflow-hidden bg-zinc-900 relative">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-4 border border-dashed border-white/40 pointer-events-none rounded"></div>
                          </div>
                          <p className="text-xs text-[#d5c4ab] font-mono mt-3 text-center px-4">
                            Hold your traditional sketchbook in front of the camera and line it up inside the frame.
                          </p>
                          <div className="flex gap-3 mt-4">
                            <button 
                              onClick={handleCaptureCamera}
                              className="bg-[#ffb800] hover:bg-[#ffdca1] text-black text-xs font-display font-semibold py-1.5 px-4 rounded"
                            >
                              Capture Sketch
                            </button>
                            <button 
                              onClick={handleStopCamera}
                              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono py-1.5 px-4 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Canvas Controls base panel */}
                    <div className="p-3 border-t border-[#514532]/30 flex flex-col gap-3 bg-[#1c1b1b]">
                      <div className="flex items-center justify-between gap-4">
                        
                        {/* Stroke thickness */}
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <span className="text-[10px] font-mono text-[#9e8f78] uppercase shrink-0">Weight</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-[10px] font-mono text-[#ffdca1] w-4 text-right">{strokeWidth}px</span>
                        </div>

                        {/* Colors */}
                        <div className="flex items-center gap-1.5">
                          {["#ffb800", "#ffdca1", "#ffffff", "#8ccdff", "#ffb4ab"].map((color) => (
                            <button 
                              key={color}
                              onClick={() => setStrokeColor(color)}
                              className="w-5 h-5 rounded-full relative border transition-transform hover:scale-110 active:scale-95"
                              style={{ 
                                backgroundColor: color, 
                                borderColor: strokeColor === color ? "#ffffff" : "transparent" 
                              }}
                            >
                              {strokeColor === color && (
                                <Check className="w-3 h-3 text-[#131313] stroke-[3px] absolute inset-0 m-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#514532]/20 pt-2">
                        {/* Save, Upload, and Critique triggers */}
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={handleSaveDrawing}
                            disabled={drawHistory.length === 0}
                            className="flex-1 bg-[#201f1f] hover:bg-[#2a2a2a] disabled:opacity-40 text-[#ffdca1] border border-[#ffb800]/20 font-display text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Save Drawing
                          </button>
                          <button 
                            onClick={handleTriggerAiCritique}
                            disabled={drawHistory.length === 0 || isAiLoading}
                            className="flex-1 bg-[#ffb800] hover:bg-[#ffdca1] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:opacity-60 text-black font-display font-semibold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all"
                          >
                            {isAiLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 fill-current" />
                            )}
                            Analyze with AI
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: Daily Challenges */}
            {activeTab === "challenges" && (
              <motion.div 
                key="challenges-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full overflow-y-auto p-8"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-bold text-[#ffdca1] tracking-tight">Active Drawing Challenges</h3>
                    <p className="text-sm text-[#d5c4ab] max-w-2xl">
                      Complete daily workouts to gain level XP and build muscle memory. Exercises combine automatic slide advances with specialized anatomical requirements.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {DAILY_CHALLENGES.map((challenge) => (
                      <div 
                        key={challenge.id}
                        className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg p-5 flex flex-col justify-between hover:border-[#ffb800]/50 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/20 rounded px-2 py-0.5">
                              {challenge.poses.length} Poses
                            </span>
                            <span className="text-xs font-mono font-bold text-[#ffdca1] flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> +{challenge.xpReward} XP
                            </span>
                          </div>
                          <h4 className="font-display text-lg font-bold text-white group-hover:text-[#ffdca1] transition-colors">
                            {challenge.title}
                          </h4>
                          <p className="text-xs text-[#d5c4ab] leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => startChallenge(challenge)}
                          className="mt-6 w-full bg-[#ffb800] hover:bg-[#ffdca1] text-[#412d00] font-display text-xs font-semibold py-2 rounded transition-all"
                        >
                          Launch Challenge ({challenge.presetDuration}s interval)
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Daily practice quotes banner */}
                  <div className="p-6 bg-[#201f1f] rounded-lg border border-[#514532]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-display font-semibold text-[#ffdca1]">Traditional Wisdom for Sketching</h4>
                      <p className="text-xs text-[#d5c4ab]">A gesture study is not about perfect lines; it is about perfect kinetic energy. Draw from your shoulder, not your wrist.</p>
                    </div>
                    <span className="text-xs font-mono text-[#9e8f78] uppercase">— Art Academy Pro Tip</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: Anatomy Modules */}
            {activeTab === "anatomy" && (
              <motion.div 
                key="anatomy-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full overflow-y-auto p-8"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-bold text-[#ffdca1] tracking-tight">Interactive Anatomy Reference Modules</h3>
                    <p className="text-sm text-[#d5c4ab] max-w-2xl">
                      Master key human landmarks and skeletal structures. Check our digital overlays and interactive lessons to upgrade your proportions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Torso module */}
                    <div className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg p-6 space-y-4">
                      <div className="w-full h-40 bg-[#131313] rounded border border-[#514532]/20 flex items-center justify-center overflow-hidden relative">
                        <svg className="w-32 h-32 text-[#ffb800]" viewBox="0 0 100 100">
                          {/* Torso SVG wireframe */}
                          <ellipse cx="50" cy="35" rx="18" ry="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                          <ellipse cx="50" cy="72" rx="15" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
                          <line x1="50" y1="10" x2="50" y2="85" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="50" cy="10" r="3" fill="#ffffff" />
                        </svg>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[#ffb800] uppercase tracking-wider font-semibold">Anatomy Guide 01</span>
                        <h4 className="font-display text-lg font-bold text-white">The Torso & Contrapposto Tilt</h4>
                        <p className="text-xs text-[#d5c4ab] leading-relaxed">
                          Learn the opposing tilt of the shoulders (clavicle line) relative to the hip bone (pelvic girdle). In active balance, these lines almost always angle toward each other on the supportive leg side.
                        </p>
                      </div>
                    </div>

                    {/* Foreshortening module */}
                    <div className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg p-6 space-y-4">
                      <div className="w-full h-40 bg-[#131313] rounded border border-[#514532]/20 flex items-center justify-center overflow-hidden relative">
                        <svg className="w-32 h-32 text-[#ffdca1]" viewBox="0 0 100 100">
                          {/* Foreshortening tube projection */}
                          <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                          <circle cx="50" cy="50" r="36" fill="none" stroke="#ffffff" strokeWidth="1" />
                          <line x1="14" y1="14" x2="86" y2="86" stroke="#514532" strokeWidth="1" />
                          <line x1="86" y1="14" x2="14" y2="86" stroke="#514532" strokeWidth="1" />
                        </svg>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[#ffb800] uppercase tracking-wider font-semibold">Anatomy Guide 02</span>
                        <h4 className="font-display text-lg font-bold text-white">Foreshortening Projection Cylinder</h4>
                        <p className="text-xs text-[#d5c4ab] leading-relaxed">
                          When limbs project directly towards the viewer, avoid outlining standard profiles. Use overlapping cylindrical shapes stacked on top of each other to convey 3D space depth.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: Student Portfolio & Completed drawings */}
            {activeTab === "portfolio" && (
              <motion.div 
                key="portfolio-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full overflow-y-auto p-8"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <h3 className="font-display text-3xl font-bold text-[#ffdca1] tracking-tight">Student Practice Portfolio</h3>
                      <p className="text-sm text-[#d5c4ab]">
                        Review your saved sketches, streak timeline logs, and structural critiques compiled from practice sessions.
                      </p>
                    </div>
                    {completedSessions.length > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your entire drawing history portfolio?")) {
                            setCompletedSessions([]);
                            localStorage.removeItem("artstudy_sessions");
                          }
                        }}
                        className="text-xs border border-red-500/30 text-red-400 py-2 px-3 rounded hover:bg-red-500/10 transition-all font-mono"
                      >
                        Reset History
                      </button>
                    )}
                  </div>

                  {completedSessions.length === 0 ? (
                    <div className="p-12 border border-dashed border-[#514532]/30 rounded-lg text-center space-y-4">
                      <Briefcase className="w-10 h-10 text-[#ffdca1] mx-auto opacity-50" />
                      <div className="space-y-1">
                        <p className="text-[#e5e2e1] text-sm font-semibold">Your portfolio is currently empty</p>
                        <p className="text-[#d5c4ab] text-xs">Practice sketching gesture frames, then save your sketches to populate this gallery.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("practice")}
                        className="bg-[#ffb800] text-black text-xs font-display font-semibold py-1.5 px-4 rounded hover:bg-[#ffdca1]"
                      >
                        Go to Sketchpad
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {completedSessions.map((session) => (
                        <div 
                          key={session.id}
                          className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg overflow-hidden group hover:border-[#ffb800]/40 transition-all flex flex-col justify-between"
                        >
                          <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center p-2 border-b border-[#514532]/20">
                            {/* Sketch rendering */}
                            <img 
                              src={session.sketchUrl} 
                              alt="Sketch" 
                              className="w-full h-full object-contain filter invert opacity-90 group-hover:scale-102 transition-transform duration-200"
                            />
                            {session.critique && (
                              <div className="absolute top-2 right-2 p-1 bg-[#ffb800] text-black rounded-full" title="Critiqued by AI">
                                <Sparkles className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono text-[#9e8f78]">{session.date}</span>
                              <span className="text-[10px] font-mono text-[#ffdca1]">{session.poseName}</span>
                            </div>

                            {session.critique && (
                              <button 
                                onClick={() => {
                                  setCritiqueResult(session.critique);
                                  setShowCritiqueModal(true);
                                }}
                                className="w-full text-[11px] font-mono border border-[#ffb800]/30 hover:bg-[#ffb800]/10 text-[#ffdca1] py-1 rounded transition-colors text-center block"
                              >
                                View Instructor Critique
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: Settings */}
            {activeTab === "settings" && (
              <motion.div 
                key="settings-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full overflow-y-auto p-8"
              >
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-bold text-[#ffdca1] tracking-tight">Workspace Preferences</h3>
                    <p className="text-sm text-[#d5c4ab]">Configure metronomes, feedback audio, custom gesture folders, or external pose loaders.</p>
                  </div>

                  <div className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg p-6 space-y-6">
                    
                    {/* Metronome sound toggle */}
                    <div className="space-y-3">
                      <label className="text-xs font-mono text-[#ffdca1] uppercase tracking-wider block">Ticks & Alert Audio</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["off", "metronome", "bell"] as const).map((mode) => (
                          <button 
                            key={mode}
                            onClick={() => {
                              setSoundMode(mode);
                              if (mode !== "off") playSound(440, "sine", 0.1);
                            }}
                            className={`py-2 border text-xs font-mono rounded capitalize transition-all ${
                              soundMode === mode 
                                ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]" 
                                : "bg-[#131313] border-[#514532]/40 text-[#d5c4ab] hover:border-zinc-700"
                            }`}
                          >
                            {mode === "metronome" ? "Soft Ticks" : mode === "bell" ? "Timer Chime" : "Muted"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metronome volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[#d5c4ab]">Sound Volume</span>
                        <span className="text-[#ffdca1]">{Math.round(metronomeVolume * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={metronomeVolume}
                        onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Add Custom Pose form */}
                    <form onSubmit={handleAddCustomImage} className="space-y-3 border-t border-[#514532]/20 pt-4">
                      <label className="text-xs font-mono text-[#ffdca1] uppercase tracking-wider block">Add Custom Pose URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="Paste an external image URL from Unsplash/Pinterest..." 
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          className="flex-1 bg-[#131313] border border-[#514532]/40 rounded text-sm px-3 py-2 text-white focus:outline-none focus:border-[#ffb800]"
                        />
                        <button 
                          type="submit"
                          className="bg-[#ffb800] hover:bg-[#ffdca1] text-black text-xs font-display font-semibold px-4 py-2 rounded shrink-0"
                        >
                          Add Pose
                        </button>
                      </div>
                      <p className="text-[10px] text-[#9e8f78] leading-normal font-mono">
                        Requires a direct image hotlink (must end with .jpg, .png, etc., or accept standard CORS queries).
                      </p>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: Support and shortcuts */}
            {activeTab === "support" && (
              <motion.div 
                key="support-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full overflow-y-auto p-8"
              >
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="space-y-2">
                    <h3 className="font-display text-3xl font-bold text-[#ffdca1] tracking-tight">ArtStudy Knowledge Base</h3>
                    <p className="text-sm text-[#d5c4ab]">Tips on getting started, anatomy definitions, and hotkey shortcuts.</p>
                  </div>

                  <div className="bg-[#1c1b1b] border border-[#514532]/40 rounded-lg p-6 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-display font-semibold text-[#ffdca1]">What is Gesture Drawing?</h4>
                      <p className="text-xs text-[#d5c4ab] leading-relaxed">
                        Gesture drawing focuses on capturing the primary rhythm, posture, line-of-action, and physical mass of a model within a very short timeframe (usually 30 to 180 seconds). It trains the brain&apos;s ocular tracking and hand motor synchronization to draw fluidly without becoming bogged down in fine rendering details.
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-[#514532]/20 pt-4">
                      <h4 className="text-sm font-display font-semibold text-[#ffdca1]">Workspace Hotkeys Guide</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="flex justify-between border-b border-[#514532]/10 pb-1.5">
                          <span className="text-[#9e8f78]">Spacebar</span>
                          <span className="text-[#ffdca1]">Play / Pause Timer</span>
                        </div>
                        <div className="flex justify-between border-b border-[#514532]/10 pb-1.5">
                          <span className="text-[#9e8f78]">Left Arrow</span>
                          <span className="text-[#ffdca1]">Previous Reference</span>
                        </div>
                        <div className="flex justify-between border-b border-[#514532]/10 pb-1.5">
                          <span className="text-[#9e8f78]">Right Arrow</span>
                          <span className="text-[#ffdca1]">Next Reference</span>
                        </div>
                        <div className="flex justify-between border-b border-[#514532]/10 pb-1.5">
                          <span className="text-[#9e8f78]">F key</span>
                          <span className="text-[#ffdca1]">Horizontal Flip</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Dynamic bottom controls navigation overlay (Visible only in Gesture Practice tab) */}
        {activeTab === "practice" && (
          <footer className="h-16 border-t border-[#514532]/30 px-6 flex items-center justify-between bg-[#131313] z-30 shrink-0">
            
            {/* Split Screen Toggle */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCanvasSplit(!canvasSplit)}
                className={`text-xs font-mono px-3 py-1.5 border rounded transition-all flex items-center gap-1.5 ${
                  canvasSplit 
                    ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]" 
                    : "bg-[#1c1b1b] border-[#514532]/40 text-[#d5c4ab] hover:border-zinc-700"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> 
                {canvasSplit ? "Hide Sketchpad" : "Show Sketchpad"}
              </button>
            </div>

            {/* Previous, Pause, Next controls */}
            <div className="flex items-center gap-2 bg-[#1c1b1b] border border-[#514532]/40 rounded-full p-1 shadow-md">
              <button 
                onClick={handlePrevPose}
                className="w-8 h-8 rounded-full hover:bg-[#201f1f] text-[#d5c4ab] hover:text-[#ffdca1] flex items-center justify-center transition-all"
                title="Previous Pose"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-10 h-10 rounded-full bg-[#ffb800] hover:bg-[#ffdca1] text-[#412d00] flex items-center justify-center transition-all shadow"
                title={isTimerRunning ? "Pause timer" : "Play timer"}
              >
                {isTimerRunning ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button 
                onClick={handleNextPose}
                className="w-8 h-8 rounded-full hover:bg-[#201f1f] text-[#d5c4ab] hover:text-[#ffdca1] flex items-center justify-center transition-all"
                title="Next Pose"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Grid display settings status */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsGrayscale(!isGrayscale)}
                className={`text-xs font-mono px-2.5 py-1.5 border rounded transition-all ${
                  isGrayscale 
                    ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]" 
                    : "bg-[#1c1b1b] border-[#514532]/40 text-[#d5c4ab]"
                }`}
              >
                {isGrayscale ? "Grayscale Study" : "Color Study"}
              </button>
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`p-1.5 border border-[#514532]/40 bg-[#1c1b1b] rounded text-[#d5c4ab] hover:text-[#ffdca1] ${isFlipped ? "border-[#ffb800] text-[#ffb800]" : ""}`}
                title="Mirror Horizontal"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* 3. RIGHT PANEL: Interactive Study Tools Widget (320px) */}
      {activeTab === "practice" && (
        <aside className="w-[320px] h-full bg-[#1c1b1b] border-l border-[#514532]/40 flex flex-col z-20 shrink-0">
          
          {/* Panel Header */}
          <div className="p-4 border-b border-[#514532]/30 flex items-center justify-between bg-[#201f1f]">
            <h3 className="font-display text-sm font-bold text-[#e5e2e1] uppercase tracking-wider">Study Tools</h3>
            <Sparkles className="w-4 h-4 text-[#ffb800]" />
          </div>

          {/* Tools Scrollable panel */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            
            {/* Interval presets duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#9e8f78] uppercase tracking-wider">Timer Duration</span>
                <span className="text-[#ffb800] font-bold">
                  {Math.floor(timerDuration / 60)}m {timerDuration % 60 > 0 ? `${timerDuration % 60}s` : ""}
                </span>
              </div>

              {/* Preset selectors */}
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 60, 180, 600].map((sec) => (
                  <button 
                    key={sec}
                    onClick={() => handlePresetSelect(sec)}
                    className={`py-1.5 border rounded font-mono text-[11px] transition-all ${
                      timerDuration === sec 
                        ? "bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800] font-bold" 
                        : "bg-[#131313] border-[#514532]/40 text-[#d5c4ab] hover:border-zinc-700"
                    }`}
                  >
                    {sec === 30 && "30s"}
                    {sec === 60 && "1m"}
                    {sec === 180 && "3m"}
                    {sec === 600 && "10m"}
                  </button>
                ))}
              </div>

              {/* Slider customizer */}
              <div className="pt-2">
                <input 
                  type="range" 
                  min="10" 
                  max="1200" 
                  step="10"
                  value={timerDuration}
                  onChange={(e) => handlePresetSelect(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Display Options accordion checklist */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#9e8f78] uppercase tracking-wider block">Canvas Configs</span>
              <div className="bg-[#131313] rounded border border-[#514532]/40 p-1 divide-y divide-[#514532]/20">
                
                {/* Mirror toggle */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex justify-between items-center p-2.5 hover:bg-[#201f1f]/50 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#d5c4ab]">
                    <FlipHorizontal className="w-4 h-4 text-[#9e8f78]" />
                    <span>Horizontal Mirror</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${isFlipped ? "bg-[#ffb800]" : "bg-zinc-800"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${isFlipped ? "translate-x-4" : ""}`}></div>
                  </div>
                </div>

                {/* Grayscale study */}
                <div 
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  className="flex justify-between items-center p-2.5 hover:bg-[#201f1f]/50 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#d5c4ab]">
                    <Sparkles className="w-4 h-4 text-[#9e8f78]" />
                    <span>Zero Color Bias</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${isGrayscale ? "bg-[#ffb800]" : "bg-zinc-800"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${isGrayscale ? "translate-x-4" : ""}`}></div>
                  </div>
                </div>

                {/* Rules grids */}
                <div 
                  onClick={() => setShowGrid(!showGrid)}
                  className="flex justify-between items-center p-2.5 hover:bg-[#201f1f]/50 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#d5c4ab]">
                    <Grid className="w-4 h-4 text-[#9e8f78]" />
                    <span>Align thirds grid</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${showGrid ? "bg-[#ffb800]" : "bg-zinc-800"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${showGrid ? "translate-x-4" : ""}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Accordion: Anatomy landmarks notes */}
            <div className="space-y-2 border-t border-[#514532]/20 pt-4">
              <button 
                onClick={() => setAnatomyNotesExpanded(!anatomyNotesExpanded)}
                className="w-full flex items-center justify-between p-2.5 bg-[#131313] border border-[#514532]/40 rounded hover:bg-[#201f1f] transition-all"
              >
                <div className="flex items-center gap-2 text-[#ffdca1] text-xs font-display font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>Anatomic Guide Landmarks</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#9e8f78] transition-transform ${anatomyNotesExpanded ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {anatomyNotesExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div className="p-3 bg-[#131313] rounded border border-[#514532]/30 space-y-2.5 text-xs text-[#d5c4ab]">
                      {selectedPose.notes.map((note, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb800] mt-1.5 shrink-0" />
                          <p className="leading-relaxed">{note}</p>
                        </div>
                      ))}
                      
                      <div className="border-t border-[#514532]/20 pt-2.5 mt-2">
                        <button 
                          onClick={() => setShowSkeletalOverlay(!showSkeletalOverlay)}
                          className="text-[#ffb800] hover:text-[#ffdca1] text-[11px] font-mono flex items-center gap-1.5"
                        >
                          {showSkeletalOverlay ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Hide skeletal overlay
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Display skeletal overlay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Categorization chips */}
            <div className="space-y-2 border-t border-[#514532]/20 pt-4 mt-auto">
              <span className="text-xs font-mono text-[#9e8f78] uppercase tracking-wider block">Pose Tags</span>
              <div className="flex flex-wrap gap-1">
                {selectedPose.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-[#201f1f] border border-[#514532]/30 rounded font-mono text-[10px] text-[#d5c4ab]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* AI CRITIQUE OVERLAY DIALOG */}
      {showCritiqueModal && critiqueResult && (
        <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1c1b1b] border border-[#ffb800]/40 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#514532]/40 bg-[#201f1f] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffb800] fill-[#ffb800]/10" />
                <h3 className="font-display text-lg font-bold text-[#ffdca1]">Instructor&apos;s AI Anatomy Critique</h3>
              </div>
              <button 
                onClick={() => setShowCritiqueModal(false)}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Overall opinion */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-[#ffb800] uppercase tracking-wider font-semibold">Gesture & Energy Evaluation</h4>
                <p className="text-sm text-[#e5e2e1] leading-relaxed italic bg-[#131313] p-4 rounded border border-[#514532]/20">
                  &ldquo;{critiqueResult.overallImpression}&rdquo;
                </p>
              </div>

              {/* Landmark Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-[#ffb800] uppercase tracking-wider font-semibold">Anatomical landmark comparison checklist</h4>
                <div className="space-y-2">
                  {critiqueResult.anatomicalChecklist.map((landmark: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-3 bg-[#131313] rounded border border-[#514532]/20 flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        {landmark.status === "excellent" && (
                          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 rounded px-1.5 py-0.5 uppercase font-mono">Perfect</span>
                        )}
                        {landmark.status === "good" && (
                          <span className="text-[10px] bg-[#ffb800]/10 text-[#ffdca1] border border-[#ffb800]/30 rounded px-1.5 py-0.5 uppercase font-mono">Good</span>
                        )}
                        {landmark.status === "needs_adjustment" && (
                          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5 uppercase font-mono">Adjust</span>
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <span className="text-xs font-display font-semibold text-white">{landmark.focus}</span>
                        <p className="text-xs text-[#d5c4ab] leading-relaxed">{landmark.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 2 Column Success vs Areas for improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-950/20 border border-green-500/20 rounded-lg space-y-2">
                  <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Areas of Success</span>
                  <ul className="text-xs text-[#d5c4ab] space-y-1.5 list-disc list-inside">
                    {critiqueResult.areasOfSuccess.map((success: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{success}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-lg space-y-2">
                  <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Suggested Actions</span>
                  <ul className="text-xs text-[#d5c4ab] space-y-1.5 list-disc list-inside">
                    {critiqueResult.improvements.map((improvement: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Master closing tip */}
              <div className="p-4 bg-[#201f1f] rounded-lg border border-[#514532]/40 space-y-1">
                <span className="text-[10px] font-mono text-[#ffb800] uppercase">Instructor&apos;s Anatomy Wisdom</span>
                <p className="text-xs text-[#d5c4ab] italic leading-relaxed">
                  &ldquo;{critiqueResult.instructorTip}&rdquo;
                </p>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="p-4 bg-[#201f1f] border-t border-[#514532]/40 flex gap-3">
              <button 
                onClick={() => {
                  handleSaveDrawing();
                  setShowCritiqueModal(false);
                }}
                className="flex-1 bg-[#ffb800] hover:bg-[#ffdca1] text-black text-xs font-display font-semibold py-2 rounded shadow transition-colors text-center"
              >
                Log Drawing to Portfolio (+150 XP)
              </button>
              <button 
                onClick={() => setShowCritiqueModal(false)}
                className="px-6 border border-[#514532]/40 text-[#d5c4ab] hover:text-white text-xs font-mono py-2 rounded hover:bg-zinc-800 transition-colors"
              >
                Close Critique
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
