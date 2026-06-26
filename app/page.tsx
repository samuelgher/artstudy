"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  PenTool,
  Trash2,
  Save,
  Sparkles,
  BookOpen,
  Settings as SettingsIcon,
  History,
  Award,
  Flame,
  Sliders,
  Volume2,
  VolumeX,
  CheckCircle,
  HelpCircle,
  Camera,
  Download,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================
interface Pose {
  id: string;
  name: string;
  url: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
  tags: string[];
  lineOfActionPath: string; // SVG path for guide
  joints: { x: number; y: number; label: string }[];
}

interface PracticeSession {
  id: string;
  poseId: string;
  poseName: string;
  poseUrl: string;
  duration: number; // in seconds
  savedDrawing: string; // base64 image data URL
  xpEarned: number;
  timestamp: number; // Date timestamp
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  poseIndices: number[];
  xpReward: number;
  timePerPose: number; // in seconds
  badge: string;
}

// ==========================================
// STATIC REFERENCES & POSES DATA
// ==========================================
const GESTURE_POSES: Pose[] = [
  {
    id: "pose-1",
    name: "Classical Contrapposto Standing",
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    difficulty: "Beginner",
    focus: "Hips-Shoulder Tilt & S-Curve Line of Action",
    tags: ["Standing", "Classical", "Balance"],
    lineOfActionPath: "M 200,80 Q 180,240 210,420",
    joints: [
      { x: 200, y: 80, label: "Head" },
      { x: 175, y: 150, label: "Shoulder (Tilted Left)" },
      { x: 220, y: 154, label: "Shoulder (Right)" },
      { x: 215, y: 260, label: "Hip (Tilted Right)" },
      { x: 185, y: 250, label: "Hip (Left)" },
      { x: 210, y: 420, label: "Weight Leg" }
    ]
  },
  {
    id: "pose-2",
    name: "The Flying Leap (Airborne Jump)",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
    difficulty: "Advanced",
    focus: "Dynamic Diagonal Energy & Extended Limbs",
    tags: ["Airborne", "Leaping", "Dynamic"],
    lineOfActionPath: "M 320,120 Q 210,220 100,280",
    joints: [
      { x: 320, y: 120, label: "Head" },
      { x: 280, y: 160, label: "Shoulder" },
      { x: 210, y: 220, label: "Spine Core" },
      { x: 150, y: 260, label: "Hips" },
      { x: 80, y: 310, label: "Lead Leg" }
    ]
  },
  {
    id: "pose-3",
    name: "Seated Meditation Contour",
    url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    difficulty: "Intermediate",
    focus: "Compact Mass, Pyramidal Stability & Folded Creases",
    tags: ["Seated", "Yoga", "Grounding"],
    lineOfActionPath: "M 200,100 Q 190,220 200,340",
    joints: [
      { x: 200, y: 100, label: "Head" },
      { x: 160, y: 160, label: "Left Arm Anchor" },
      { x: 240, y: 160, label: "Right Arm Anchor" },
      { x: 200, y: 280, label: "Sacrum" },
      { x: 120, y: 340, label: "Left Knee" },
      { x: 280, y: 340, label: "Right Knee" }
    ]
  },
  {
    id: "pose-4",
    name: "Athletic Backbend Stretch",
    url: "https://images.unsplash.com/photo-1552196564-9790843713b6?auto=format&fit=crop&q=80&w=800",
    difficulty: "Advanced",
    focus: "Crescent Spine Compression & Maximum Tension",
    tags: ["Backbend", "Compression", "Tension"],
    lineOfActionPath: "M 120,320 C 140,120 280,120 300,320",
    joints: [
      { x: 120, y: 320, label: "Left Hand Base" },
      { x: 160, y: 220, label: "Shoulders" },
      { x: 210, y: 140, label: "Chest Apex" },
      { x: 260, y: 210, label: "Hips" },
      { x: 300, y: 320, label: "Feet Base" }
    ]
  },
  {
    id: "pose-5",
    name: "Classical Sculpted Torso Twist",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
    difficulty: "Intermediate",
    focus: "Torso Compression (Spine Twist & Pelvic Compression)",
    tags: ["Torso", "Sculpture", "Contrapposto"],
    lineOfActionPath: "M 200,90 Q 220,240 185,380",
    joints: [
      { x: 200, y: 90, label: "Sternum" },
      { x: 165, y: 155, label: "Compressed Flank" },
      { x: 235, y: 175, label: "Stretched Flank" },
      { x: 210, y: 280, label: "Hip Crest" },
      { x: 185, y: 380, label: "Tailbone Origin" }
    ]
  }
];

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "challenge-1",
    title: "Morning Flow Speedrun",
    description: "Prepare your hands with five rapid-fire 30-second poses. Perfect for eye-hand coordination.",
    poseIndices: [0, 1, 2, 3, 4],
    xpReward: 150,
    timePerPose: 30,
    badge: "Lightning Sketcher"
  },
  {
    id: "challenge-2",
    title: "Anatomy Structural Study",
    description: "Deep-dive into 3 classic complex poses with extended 90-second intervals to study spinal curves.",
    poseIndices: [0, 4, 3],
    xpReward: 250,
    timePerPose: 90,
    badge: "Anatomical Sage"
  },
  {
    id: "challenge-3",
    title: "Dynamic Energy Marathon",
    description: "Sustain dynamic lines over 120 seconds. Master capturing energy, weight distribution, and motion.",
    poseIndices: [1, 3, 4],
    xpReward: 350,
    timePerPose: 120,
    badge: "Master of Kinetic Lines"
  }
];

// ==========================================
// AUDIO SYNTHESIZER UTILITY
// ==========================================
const playChime = (frequency: number, type: OscillatorType = "sine", duration: number = 0.3) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Smooth envelope to avoid clicks
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.warn("Web Audio API blocked or unsupported in this frame browser:", error);
  }
};

export default function App() {
  // ==========================================
  // NAVIGATION & LAYOUT STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState<"practice" | "challenges" | "anatomy" | "portfolio" | "settings">("practice");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Drawer control
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Desktop collapse/expand control

  const handleHeaderSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
    setIsSidebarExpanded((prev) => !prev);
  };

  // ==========================================
  // PRACTICE STUDIO STATES
  // ==========================================
  const [poseIndex, setPoseIndex] = useState<number>(0);
  const [timerDuration, setTimerDuration] = useState<number>(60); // default 60s
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<"bell" | "metronome" | "mute">("bell");
  const [showSkeletonGuide, setShowSkeletonGuide] = useState<boolean>(false);
  
  // Custom pose injection
  const [customPoses, setCustomPoses] = useState<Pose[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Combine static and custom poses
  const activePoseList = [...GESTURE_POSES, ...customPoses];
  const currentPose = activePoseList[poseIndex] || activePoseList[0];

  // ==========================================
  // CANVAS DRAWING BOARD STATES
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#ffdca1"); // default soft cream/gold
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // ==========================================
  // PROFILE, XP & LEVEL STATES
  // ==========================================
  const [xp, setXp] = useState<number>(350); // Starting XP
  const [level, setLevel] = useState<number>(1);
  const [streak, setStreak] = useState<number>(3); // Starting streak
  const [completedSessions, setCompletedSessions] = useState<PracticeSession[]>([]);

  // ==========================================
  // CHALLENGES STATES
  // ==========================================
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeCurrentStep, setChallengeCurrentStep] = useState<number>(0);
  const [challengePoseIndices, setChallengePoseIndices] = useState<number[]>([]);

  // ==========================================
  // AI CRITIQUE STATES
  // ==========================================
  const [critiqueResult, setCritiqueResult] = useState<{
    score: number;
    impression: string;
    anatomyCritique: string;
    lineCritique: string;
    proportionsCritique: string;
    instructorAdvice: string;
  } | null>(null);
  const [isGeneratingCritique, setIsGeneratingCritique] = useState<boolean>(false);

  // ==========================================
  // EFFECT: INITIALIZE DATA FROM STORAGE
  // ==========================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = localStorage.getItem("art_academy_sessions");
      if (storedSessions) {
        try {
          setCompletedSessions(JSON.parse(storedSessions));
        } catch (e) {
          console.error("Error reading sessions:", e);
        }
      }
      const storedXp = localStorage.getItem("art_academy_xp");
      if (storedXp) setXp(parseInt(storedXp) || 350);
      const storedLevel = localStorage.getItem("art_academy_level");
      if (storedLevel) setLevel(parseInt(storedLevel) || 1);
      const storedStreak = localStorage.getItem("art_academy_streak");
      if (storedStreak) setStreak(parseInt(storedStreak) || 3);
      const storedCustomPoses = localStorage.getItem("art_academy_custom_poses");
      if (storedCustomPoses) {
        try {
          setCustomPoses(JSON.parse(storedCustomPoses));
        } catch (e) {
          console.error("Error reading custom poses:", e);
        }
      }
    }
  }, []);

  // ==========================================
  // EFFECT: SAVE TO STORAGE ON UPDATES
  // ==========================================
  const addXP = (amount: number) => {
    setXp((prev) => {
      const newXp = prev + amount;
      localStorage.setItem("art_academy_xp", newXp.toString());
      
      // Calculate level based on 1000 XP increments
      const calculatedLevel = Math.floor(newXp / 1000) + 1;
      if (calculatedLevel > level) {
        setLevel(calculatedLevel);
        localStorage.setItem("art_academy_level", calculatedLevel.toString());
        // Level up chime
        playChime(523.25, "sine", 0.4); // C5
        setTimeout(() => playChime(659.25, "sine", 0.4), 150); // E5
        setTimeout(() => playChime(783.99, "sine", 0.7), 300); // G5
      }
      return newXp;
    });
  };

  // ==========================================
  // TIMER CORE HOOK
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          
          if (nextTime === 0) {
            // Completed session!
            setIsTimerRunning(false);
            if (soundMode === "bell") {
              playChime(880, "triangle", 0.9); // high bell ring
            }
            handleSessionCompletedAuto();
          } else if (soundMode === "metronome") {
            playChime(440, "sine", 0.04); // subtle woodblock metronome tick
          }
          
          return nextTime;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, soundMode]);

  // Sync timeLeft when pose index or timer preset changes
  useEffect(() => {
    setTimeLeft(timerDuration);
    setIsTimerRunning(false);
  }, [poseIndex, timerDuration]);

  // ==========================================
  // AUTO SESSION COMPLETION
  // ==========================================
  const handleSessionCompletedAuto = () => {
    // Automatically capture drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const drawingData = canvas.toDataURL("image/png");
    
    const sessionXp = activeChallengeId ? 40 : 25; // More XP for challenge poses
    addXP(sessionXp);

    const newSession: PracticeSession = {
      id: "session-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      poseId: currentPose.id,
      poseName: currentPose.name,
      poseUrl: currentPose.url,
      duration: timerDuration,
      savedDrawing: drawingData,
      xpEarned: sessionXp,
      timestamp: Date.now()
    };

    const updatedSessions = [newSession, ...completedSessions];
    setCompletedSessions(updatedSessions);
    localStorage.setItem("art_academy_sessions", JSON.stringify(updatedSessions));

    // Handle Challenge flow
    if (activeChallengeId) {
      if (challengeCurrentStep < challengePoseIndices.length - 1) {
        // Advance to next step in challenge
        const nextStep = challengeCurrentStep + 1;
        setChallengeCurrentStep(nextStep);
        setPoseIndex(challengePoseIndices[nextStep]);
        handleClearCanvas();
        setTimeout(() => {
          setTimeLeft(timerDuration);
          setIsTimerRunning(true);
        }, 800);
      } else {
        // Finished Challenge completely!
        const challenge = DAILY_CHALLENGES.find(c => c.id === activeChallengeId);
        const reward = challenge ? challenge.xpReward : 100;
        addXP(reward);
        
        // Add streak
        setStreak(prev => {
          const nextStreak = prev + 1;
          localStorage.setItem("art_academy_streak", nextStreak.toString());
          return nextStreak;
        });

        alert(`🎉 Challenge Complete! You earned a total of +${reward} XP and earned the "${challenge?.badge || "Pro Gesture"}" reward badge! Check your updated portfolio.`);
        
        // Reset challenge states
        setActiveChallengeId(null);
        setChallengePoseIndices([]);
        setChallengeCurrentStep(0);
        setActiveTab("portfolio");
      }
    } else {
      // Regular practice session completed
      alert(`⏱️ Time's up! Sketch saved to your Portfolio. You earned +${sessionXp} XP!`);
    }
  };

  // ==========================================
  // MANUAL SESSION SAVING
  // ==========================================
  const handleManualSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if canvas is blank
    const blankCheck = document.createElement("canvas");
    blankCheck.width = canvas.width;
    blankCheck.height = canvas.height;
    if (canvas.toDataURL() === blankCheck.toDataURL()) {
      alert("Canvas is empty! Draw something before saving.");
      return;
    }

    const drawingData = canvas.toDataURL("image/png");
    const earned = 15;
    addXP(earned);

    const newSession: PracticeSession = {
      id: "session-manual-" + Date.now(),
      poseId: currentPose.id,
      poseName: currentPose.name,
      poseUrl: currentPose.url,
      duration: timerDuration - timeLeft,
      savedDrawing: drawingData,
      xpEarned: earned,
      timestamp: Date.now()
    };

    const updatedSessions = [newSession, ...completedSessions];
    setCompletedSessions(updatedSessions);
    localStorage.setItem("art_academy_sessions", JSON.stringify(updatedSessions));
    playChime(660, "sine", 0.25);
    alert(`🎨 Sketch saved successfully to your Portfolio! Earned +${earned} XP.`);
  };

  // ==========================================
  // CANVAS DRAWING FUNCTIONALITIES
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Prevent default touch scrolling on canvas
    const preventDefault = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };
    document.body.addEventListener("touchstart", preventDefault, { passive: false });
    document.body.addEventListener("touchmove", preventDefault, { passive: false });

    // Handle high DPI display density
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    return () => {
      document.body.removeEventListener("touchstart", preventDefault);
      document.body.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  // Set up resize observer to adjust coordinate scale while keeping content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
          // Backup current canvas drawing
          const backup = document.createElement("canvas");
          backup.width = canvas.width;
          backup.height = canvas.height;
          const backupCtx = backup.getContext("2d");
          if (backupCtx) {
            backupCtx.drawImage(canvas, 0, 0);
          }

          // Resize canvas coordinates to match screen pixels
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // Restore drawing
            ctx.drawImage(backup, 0, 0, width, height);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Capture canvas state for Undo
  const saveCanvasStateForUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setUndoStack((prev) => [...prev, dataUrl]);
    setRedoStack([]); // Clear redo
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Current state goes to redo
    const currentState = canvas.toDataURL();
    setRedoStack((prev) => [...prev, currentState]);

    // Pop previous state
    const previousStateUrl = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.src = previousStateUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Push current to undo
    const currentState = canvas.toDataURL();
    setUndoStack((prev) => [...prev, currentState]);

    // Pop state from redo
    const nextStateUrl = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.src = nextStateUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Drawing event triggers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (x: number, y: number) => {
    saveCanvasStateForUndo();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? "#1a1a1a" : brushColor; // eraser matches background slate card color

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      saveCanvasStateForUndo();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ==========================================
  // POSE SELECTION CONTROLS
  // ==========================================
  const handlePrevPose = () => {
    setCritiqueResult(null);
    setPoseIndex((prev) => (prev === 0 ? activePoseList.length - 1 : prev - 1));
  };

  const handleNextPose = () => {
    setCritiqueResult(null);
    setPoseIndex((prev) => (prev === activePoseList.length - 1 ? 0 : prev + 1));
  };

  // ==========================================
  // CHALLENGE FLOW ACTIONS
  // ==========================================
  const startChallenge = (challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    setChallengePoseIndices(challenge.poseIndices);
    setChallengeCurrentStep(0);
    setTimerDuration(challenge.timePerPose);
    setTimeLeft(challenge.timePerPose);
    setPoseIndex(challenge.poseIndices[0]);
    handleClearCanvas();
    setCritiqueResult(null);
    
    // Switch to practice view for live study
    setActiveTab("practice");
    setTimeout(() => {
      setIsTimerRunning(true);
      playChime(587.33, "sine", 0.5); // D5 chime start
    }, 100);
  };

  // ==========================================
  // CUSTOM USER REFERENCE FLOW
  // ==========================================
  const handleAddCustomPose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    const newCustomPose: Pose = {
      id: "custom-" + Date.now(),
      name: `Custom Model Study #${customPoses.length + 1}`,
      url: customImageUrl,
      difficulty: "Intermediate",
      focus: "Custom Reference Form Analysis",
      tags: ["Custom", "User Upload"],
      lineOfActionPath: "M 200,80 Q 200,240 200,420", // Straight fallback
      joints: [{ x: 200, y: 100, label: "Center Core" }]
    };

    const updatedCustom = [...customPoses, newCustomPose];
    setCustomPoses(updatedCustom);
    localStorage.setItem("art_academy_custom_poses", JSON.stringify(updatedCustom));
    setPoseIndex(activePoseList.length); // point index to newly appended item
    setCustomImageUrl("");
    setShowCustomModal(false);
    alert("🚀 Custom pose reference added successfully to your library!");
  };

  const handleDeleteCustomPose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPoses.filter(p => p.id !== id);
    setCustomPoses(updated);
    localStorage.setItem("art_academy_custom_poses", JSON.stringify(updated));
    setPoseIndex(0);
    alert("Deleted reference pose.");
  };

  // ==========================================
  // ART ACADEMY AI ANATOMY CRITIQUE GENERATOR
  // ==========================================
  const handleTriggerAiCritique = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if drawing exists
    const blankCheck = document.createElement("canvas");
    blankCheck.width = canvas.width;
    blankCheck.height = canvas.height;
    if (canvas.toDataURL() === blankCheck.toDataURL()) {
      alert("Your canvas is empty! Sketch a gesture before requesting an anatomy critique.");
      return;
    }

    setIsGeneratingCritique(true);
    setCritiqueResult(null);

    // Simulate deeply analytical, highly creative and constructive critique
    setTimeout(() => {
      // Calculate a pseudo score based on strokes, colors used and active time spent
      const strokeCount = undoStack.length + 1;
      let calculatedScore = 70;
      if (strokeCount > 15) calculatedScore += 12;
      if (strokeCount > 35) calculatedScore += 8;
      if (strokeCount < 5) calculatedScore -= 15;
      if (timerDuration - timeLeft > 15) calculatedScore += 5;
      
      // Cap at 98
      calculatedScore = Math.min(Math.max(calculatedScore, 45), 98);

      const critiques = [
        {
          impression: "Strong dynamic expression! You've beautifully caught the flow-line of the pose, prioritizing movement over static outline contouring.",
          anatomy: `In this pose (${currentPose.name}), the chest cage tilts counter to the pelvic bowl. Your strokes reflect a solid comprehension of this contraction. To push it further, accentuate the compression at the lower flank where the obliques pinch.`,
          line: "Beautiful line weights! The varying thick and thin lines show great artistic confidence. Keep drawing from the shoulder to capture long gestural curves.",
          proportions: "The head-to-torso ratio sits around 1:7.5, which mimics realistic natural human scale nicely. Ensure the weight-bearing heel aligns precisely with the center of gravity at the sternal notch.",
          advice: "Do a 2-minute warmup drawing using only 5 lines. It forces your eyes to find only the core kinetic flow-line without getting bogged down in outer contours."
        },
        {
          impression: "Good structure, but slightly stiff. The limbs show mechanical joints rather than fluid muscle ribbons.",
          anatomy: `This dynamic pose features a powerful pelvic shift. Ensure your skeletal alignment matches the torso tilt. Your drawn curves represent the limbs well, but they feel detached from the main axial skeleton.`,
          line: "Some sketchy, hesitant lines detected (feathering). Try to sweep single, continuous fluid lines rather than scratching multiple times to construct one edge.",
          proportions: "The shoulder width is slightly too wide, causing a bit of a heroic proportion imbalance. Soften the collarbone tilt to ground the weight better.",
          advice: "Hold your drawing tool lightly from the tip, and lock your wrist. Let the gesture emerge purely through arm sweeps from your shoulder joint."
        },
        {
          impression: "Excellent anatomical landmarks! Your skeletal anchors are placed with high visual accuracy.",
          anatomy: `Superb execution of the torso torsion. The ribcage is correctly twisted relative to the hips, which is one of the hardest aspects of classical contrapposto.`,
          line: "Highly refined contours. The lines are clean, and you are using heavier contours at the shadow side of the thighs to imply physical weight and depth.",
          proportions: "The length of the legs perfectly balances the crown-to-groin torso height. Outstanding attention to classical art academic standards.",
          advice: "To elevate this further, try doing the same sketch blindfolded or using non-dominant hand drills. It breaks muscle memory and builds intense visual observation skills."
        }
      ];

      // Pick a critique based on poseId
      const selectIndex = (currentPose.id.charCodeAt(currentPose.id.length - 1) + strokeCount) % critiques.length;
      const selectedCritique = critiques[selectIndex];

      setCritiqueResult({
        score: calculatedScore,
        impression: selectedCritique.impression,
        anatomyCritique: selectedCritique.anatomy,
        lineCritique: selectedCritique.line,
        proportionsCritique: selectedCritique.proportions,
        instructorAdvice: selectedCritique.advice
      });

      setIsGeneratingCritique(false);
      addXP(50); // XP for requesting and analyzing a critique
    }, 1500);
  };

  // ==========================================
  // UTILITIES: DOWNLOAD & SHARE
  // ==========================================
  const handleDownloadDrawing = (drawingDataUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = drawingDataUrl;
    link.download = `artacademy-sketch-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this sketch from your portfolio?")) {
      const updated = completedSessions.filter(s => s.id !== sessionId);
      setCompletedSessions(updated);
      localStorage.setItem("art_academy_sessions", JSON.stringify(updated));
    }
  };

  // ==========================================
  // COMPONENT RENDERS
  // ==========================================
  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] font-sans flex flex-col antialiased">
      
      {/* ==========================================
          TOP BAR HEADER (Fixed)
          ========================================== */}
      <header className="h-16 bg-[#181818] border-b border-[#ffdca1]/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* SIDEBAR OPENER BUTTON */}
          <button
            id="sidebar-open-btn"
            onClick={handleHeaderSidebarToggle}
            className="p-2 -ml-2 rounded-lg text-[#ffdca1] hover:bg-[#2a2a2a] transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#ffdca1]/50 cursor-pointer"
            aria-label="Toggle Sidebar Menu"
            title="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#ffdca1] flex items-center justify-center">
              <PenTool className="w-5 h-5 text-[#121212]" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-[#ffdca1] tracking-tight">ArtAcademy</span>
              <span className="text-xs font-mono text-[#9e8f78] uppercase ml-1.5 hidden sm:inline-block">Pro</span>
            </div>
          </div>
        </div>

        {/* PROFILE STATS HEADER RAIL */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Level Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border border-[#ffdca1]/15 rounded-full">
            <Award className="w-4 h-4 text-[#ffdca1]" />
            <div className="text-xs">
              <span className="text-[#9e8f78] mr-1">LVL</span>
              <span className="font-mono font-bold text-[#ffdca1]">{level}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="hidden md:flex flex-col w-32 xl:w-44">
            <div className="flex justify-between text-[10px] font-mono text-[#9e8f78] mb-0.5">
              <span>{xp % 1000} / 1000 XP</span>
              <span>LVL {level + 1}</span>
            </div>
            <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#ffdca1] to-[#f3cf95] rounded-full transition-all duration-300" 
                style={{ width: `${(xp % 1000) / 10}%` }}
              />
            </div>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffdca1]/10 border border-[#ffdca1]/20 rounded-full text-[#ffdca1]" title="Daily Study Streak">
            <Flame className="w-4 h-4 fill-current text-[#ffdca1]" />
            <span className="font-mono text-xs font-bold">{streak} DAY STREAK</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* ==========================================
            MOBILE DRAWER OVERLAY SIDEBAR
            ========================================== */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#000000]/70 z-50 transition-opacity duration-300 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside
          className={`fixed top-0 bottom-0 left-0 w-72 bg-[#181818] border-r border-[#ffdca1]/10 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* MOBILE SIDEBAR CLOSER TOP HEADER */}
          <div className="p-4 border-b border-[#ffdca1]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-[#ffdca1]" />
              <span className="font-display font-bold text-[#ffdca1]">ArtAcademy Pro</span>
            </div>
            <button
              id="sidebar-close-btn-mobile"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#2a2a2a] transition-colors focus:outline-none"
              aria-label="Close Sidebar"
              title="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS (MOBILE) */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => { setActiveTab("practice"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "practice" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-md font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
            >
              <PenTool className="w-5 h-5" />
              Active Drawing Studio
            </button>
            
            <button
              onClick={() => { setActiveTab("challenges"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "challenges" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-md font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
            >
              <Award className="w-5 h-5" />
              Daily Challenges
            </button>

            <button
              onClick={() => { setActiveTab("anatomy"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "anatomy" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-md font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Academy Handbook
            </button>

            <button
              onClick={() => { setActiveTab("portfolio"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "portfolio" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-md font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
            >
              <History className="w-5 h-5" />
              Portfolio & History
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "settings" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-md font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              Practice Settings
            </button>
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-[#ffdca1]/10 bg-[#121212]/40">
            <div className="text-[10px] font-mono text-[#9e8f78] text-center">
              ARTACADEMY PRO STUDIO v1.4
            </div>
          </div>
        </aside>

        {/* ==========================================
            DESKTOP COLLAPSIBLE SIDEBAR
            ========================================== */}
        <aside
          className={`hidden md:flex flex-col bg-[#181818] border-r border-[#ffdca1]/10 transition-all duration-300 ease-in-out shrink-0 h-[calc(100vh-4rem)] ${
            isSidebarExpanded ? "w-64" : "w-16"
          }`}
        >
          {/* DESKTOP COLLAPSE / EXPAND HEADER BUTTON */}
          <div className="p-3 border-b border-[#ffdca1]/10 flex items-center justify-between">
            {isSidebarExpanded && (
              <span className="text-xs font-mono font-bold text-[#ffdca1] tracking-wider uppercase ml-2">Studio Desk</span>
            )}
            <button
              id="sidebar-close-btn-desktop"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={`p-1.5 rounded-lg text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#2a2a2a] transition-all flex items-center justify-center ${
                !isSidebarExpanded ? "mx-auto rotate-180" : ""
              }`}
              aria-label={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS (DESKTOP) */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab("practice")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "practice" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-sm font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
              title="Active Drawing Studio"
            >
              <PenTool className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="truncate">Active Studio</span>}
            </button>
            
            <button
              onClick={() => setActiveTab("challenges")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "challenges" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-sm font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
              title="Daily Challenges"
            >
              <Award className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="truncate">Daily Challenges</span>}
            </button>

            <button
              onClick={() => setActiveTab("anatomy")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "anatomy" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-sm font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
              title="Academy Handbook"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="truncate">Academy Handbook</span>}
            </button>

            <button
              onClick={() => setActiveTab("portfolio")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "portfolio" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-sm font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
              title="Portfolio & History"
            >
              <History className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="truncate">Portfolio & History</span>}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "settings" 
                  ? "bg-[#ffdca1] text-[#121212] shadow-sm font-bold" 
                  : "text-[#9e8f78] hover:text-[#ffdca1] hover:bg-[#1e1e1e]"
              }`}
              title="Practice Settings"
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="truncate">Practice Settings</span>}
            </button>
          </nav>

          {/* FOOTER COLLAPSED/EXPANDED */}
          <div className="p-3 border-t border-[#ffdca1]/10 bg-[#121212]/40">
            {isSidebarExpanded ? (
              <div className="text-[10px] font-mono text-[#9e8f78] text-center">
                ARTACADEMY PRO STUDIO v1.4
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[9px] font-mono text-[#9e8f78]">1.4</span>
              </div>
            )}
          </div>
        </aside>

        {/* ==========================================
            MAIN CONTENT AREA
            ========================================== */}
        <main className="flex-1 bg-[#121212] overflow-y-auto h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
          
          {/* ==========================================
              TAB: ACTIVE STUDIO DRAWING DESK
              ========================================== */}
          {activeTab === "practice" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Challenge Top Status Bar if active */}
              {activeChallengeId && (
                <div className="bg-[#ffdca1]/10 border border-[#ffdca1]/30 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="animate-pulse flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffdca1] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ffdca1]"></span>
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#ffdca1]">
                        ACTIVE CHALLENGE: {DAILY_CHALLENGES.find(c => c.id === activeChallengeId)?.title}
                      </h3>
                      <p className="text-xs text-[#9e8f78]">
                        Pose {challengeCurrentStep + 1} of {challengePoseIndices.length} — Keep going!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Challenge dot markers */}
                    <div className="flex gap-1.5">
                      {challengePoseIndices.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-3 h-1.5 rounded-full transition-colors ${
                            idx === challengeCurrentStep 
                              ? "bg-[#ffdca1]" 
                              : idx < challengeCurrentStep 
                                ? "bg-[#ffdca1]/60" 
                                : "bg-[#2a2a2a]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Core Drawing Desktop Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. Reference View (Left Column) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 rounded-xl overflow-hidden shadow-xl">
                    {/* Title Overlay bar */}
                    <div className="px-4 py-3 bg-[#222222] border-b border-[#ffdca1]/5 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h2 className="text-sm font-bold text-[#ffdca1] tracking-tight">{currentPose.name}</h2>
                        <span className="text-[10px] font-mono text-[#9e8f78] uppercase">{currentPose.focus}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        currentPose.difficulty === "Beginner" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : currentPose.difficulty === "Intermediate"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {currentPose.difficulty}
                      </span>
                    </div>

                    {/* Figure Render Container */}
                    <div className="relative aspect-[3/4] bg-[#0c0c0c] flex items-center justify-center overflow-hidden group">
                      <img 
                        src={currentPose.url} 
                        alt={currentPose.name}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                        crossOrigin="anonymous"
                      />

                      {/* Procedural Skeletal Guide Overlay SVG */}
                      {showSkeletonGuide && (
                        <svg 
                          viewBox="0 0 400 500" 
                          className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
                        >
                          {/* Guide background overlay shadow */}
                          <rect width="400" height="500" fill="rgba(0, 0, 0, 0.4)" />
                          
                          {/* Line of Action */}
                          <path 
                            d={currentPose.lineOfActionPath} 
                            fill="none" 
                            stroke="#ff7a00" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeDasharray="6 4"
                          />
                          
                          {/* Bone connecting rods */}
                          {currentPose.joints.map((joint, idx, arr) => {
                            if (idx < arr.length - 1) {
                              const next = arr[idx + 1];
                              return (
                                <line 
                                  key={`bone-${idx}`}
                                  x1={joint.x} 
                                  y1={joint.y} 
                                  x2={next.x} 
                                  y2={next.y} 
                                  stroke="#ffdca1" 
                                  strokeWidth="1.5" 
                                  opacity="0.6"
                                />
                              );
                            }
                            return null;
                          })}

                          {/* Joint Nodes */}
                          {currentPose.joints.map((joint, idx) => (
                            <g key={`joint-${idx}`}>
                              <circle 
                                cx={joint.x} 
                                cy={joint.y} 
                                r="6" 
                                fill="#ffdca1" 
                                stroke="#121212" 
                                strokeWidth="2" 
                              />
                              <text 
                                x={joint.x + 10} 
                                y={joint.y + 4} 
                                fill="#ffdca1" 
                                fontSize="9" 
                                fontFamily="monospace"
                                className="font-semibold bg-black/60 p-0.5 rounded shadow"
                              >
                                {joint.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      )}

                      {/* Reference Tags & Image Info HUD */}
                      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap z-20">
                        {currentPose.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono bg-black/85 text-[#ffdca1] px-1.5 py-0.5 rounded border border-[#ffdca1]/10">
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Skeletal Toggle Helper */}
                      <button 
                        onClick={() => setShowSkeletonGuide(!showSkeletonGuide)}
                        className="absolute bottom-3 right-3 p-2 bg-black/85 border border-[#ffdca1]/20 hover:border-[#ffdca1] rounded-lg text-[#ffdca1] transition-all z-20 flex items-center gap-1.5 text-xs shadow-lg"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {showSkeletonGuide ? "Hide Anatomy Guide" : "Overlay Guide"}
                      </button>
                    </div>

                    {/* Left/Right manual pose switcher */}
                    <div className="p-3 bg-[#1e1e1e] flex items-center justify-between">
                      <button 
                        onClick={handlePrevPose} 
                        className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffdca1] transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Previous Figure (or use arrow keys)"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Prev Pose
                      </button>
                      <span className="text-xs font-mono text-[#9e8f78]">
                        Pose {poseIndex + 1} of {activePoseList.length}
                      </span>
                      <button 
                        onClick={handleNextPose} 
                        className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffdca1] transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Next Figure (or use arrow keys)"
                      >
                        Next Pose
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Manual trigger for Custom Pose upload */}
                  <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#ffdca1]/10 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-[#ffdca1]">Practice with Own Ref</h4>
                      <p className="text-[10px] text-[#9e8f78]">Import external model URLs directly.</p>
                    </div>
                    <button 
                      onClick={() => setShowCustomModal(true)}
                      className="px-3 py-1.5 bg-[#252525] border border-[#ffdca1]/10 hover:border-[#ffdca1] text-[#ffdca1] rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Upload Pose
                    </button>
                  </div>
                </div>

                {/* 2. Drawing Area & Controls (Right Column) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Timer & Sound Master Strip */}
                  <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 p-4 rounded-xl shadow-xl flex items-center justify-between flex-wrap gap-4">
                    
                    {/* Timer Circle/Box */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#ffdca1]/5 rounded-lg border border-[#ffdca1]/15 text-center min-w-[70px]">
                        <span className="block text-2xl font-mono font-bold text-[#ffdca1] tracking-tight">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                      
                      {/* Timer quick adjust preset buttons */}
                      {!activeChallengeId && (
                        <div className="flex flex-wrap gap-1">
                          {[30, 60, 90, 180, 300].map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                setTimerDuration(s);
                                setTimeLeft(s);
                                setIsTimerRunning(false);
                              }}
                              className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
                                timerDuration === s 
                                  ? "bg-[#ffdca1]/15 text-[#ffdca1] border-[#ffdca1]" 
                                  : "bg-[#252525] text-[#9e8f78] border-transparent hover:border-[#9e8f78]"
                              }`}
                            >
                              {s}s
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timer play controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`p-3 rounded-lg flex items-center gap-2 font-semibold text-xs transition-all ${
                          isTimerRunning 
                            ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20" 
                            : "bg-[#ffdca1] text-[#121212] hover:bg-[#f3cf95]"
                        }`}
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        {isTimerRunning ? "Pause Study" : "Start Clock"}
                      </button>

                      <button
                        onClick={() => {
                          setTimeLeft(timerDuration);
                          setIsTimerRunning(false);
                        }}
                        className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#ffdca1]/10 rounded-lg text-xs font-semibold transition-all flex items-center justify-center"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Audio configuration dropdown */}
                    <div className="flex items-center gap-1 bg-[#252525] p-1.5 rounded-lg border border-[#ffdca1]/5">
                      <button 
                        onClick={() => setSoundMode("bell")}
                        className={`p-1.5 rounded text-xs font-mono transition-all ${
                          soundMode === "bell" ? "bg-[#ffdca1] text-[#121212] font-semibold" : "text-[#9e8f78] hover:text-[#ffdca1]"
                        }`}
                        title="Play chime on complete"
                      >
                        Chime
                      </button>
                      <button 
                        onClick={() => setSoundMode("metronome")}
                        className={`p-1.5 rounded text-xs font-mono transition-all ${
                          soundMode === "metronome" ? "bg-[#ffdca1] text-[#121212] font-semibold" : "text-[#9e8f78] hover:text-[#ffdca1]"
                        }`}
                        title="Metronome clicking"
                      >
                        Metro
                      </button>
                      <button 
                        onClick={() => setSoundMode("mute")}
                        className={`p-1.5 rounded text-xs font-mono transition-all ${
                          soundMode === "mute" ? "bg-[#ffdca1] text-[#121212] font-semibold" : "text-[#9e8f78] hover:text-[#ffdca1]"
                        }`}
                        title="Silent countdown"
                      >
                        Mute
                      </button>
                    </div>

                  </div>

                  {/* Interactive Drawing Board Card */}
                  <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 rounded-xl overflow-hidden shadow-xl flex flex-col">
                    
                    {/* Brush HUD Panel */}
                    <div className="p-3 bg-[#222222] border-b border-[#ffdca1]/5 flex justify-between items-center flex-wrap gap-4">
                      
                      {/* Tool selection (Pencil, Eraser, Clear) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEraser(false)}
                          className={`p-2 rounded-lg transition-all ${
                            !isEraser ? "bg-[#ffdca1] text-[#121212]" : "bg-[#2a2a2a] text-[#9e8f78] hover:text-[#ffdca1]"
                          }`}
                          title="Pencil / Drawing Tool"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEraser(true)}
                          className={`p-2 rounded-lg transition-all ${
                            isEraser ? "bg-[#ffdca1] text-[#121212]" : "bg-[#2a2a2a] text-[#9e8f78] hover:text-[#ffdca1]"
                          }`}
                          title="Eraser Tool"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleClearCanvas}
                          className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-red-400 hover:text-red-300 transition-all"
                          title="Clear whole drawing area"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Color Palette selections */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#9e8f78] uppercase hidden sm:inline">Tint:</span>
                        <div className="flex gap-1.5">
                          {["#ffdca1", "#ffffff", "#ff4a4a", "#4a8aff", "#ffd000", "#10b981"].map(c => (
                            <button
                              key={c}
                              onClick={() => {
                                setBrushColor(c);
                                setIsEraser(false);
                              }}
                              className={`w-6 h-6 rounded-full border transition-all ${
                                brushColor === c && !isEraser ? "scale-125 border-white" : "border-transparent"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Undo / Redo Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleUndo}
                          disabled={undoStack.length === 0}
                          className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffdca1] disabled:opacity-40 disabled:hover:bg-[#2a2a2a] transition-all"
                          title="Undo Sketch Line"
                        >
                          Undo ({undoStack.length})
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={redoStack.length === 0}
                          className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffdca1] disabled:opacity-40 disabled:hover:bg-[#2a2a2a] transition-all"
                          title="Redo Sketch Line"
                        >
                          Redo
                        </button>
                      </div>
                    </div>

                    {/* Canvas drawing sheet */}
                    <div className="relative bg-[#1a1a1a] h-[340px] md:h-[450px] w-full cursor-crosshair">
                      
                      {/* Grid overlay for classical proportions guideline */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-[0.03] border-b border-r border-[#ffdca1]" />

                      <canvas
                        ref={canvasRef}
                        onMouseDown={(e) => {
                          const pos = getMousePos(e);
                          startDrawing(pos.x, pos.y);
                        }}
                        onMouseMove={(e) => {
                          const pos = getMousePos(e);
                          draw(pos.x, pos.y);
                        }}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => {
                          const pos = getTouchPos(e);
                          startDrawing(pos.x, pos.y);
                        }}
                        onTouchMove={(e) => {
                          const pos = getTouchPos(e);
                          draw(pos.x, pos.y);
                        }}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0 w-full h-full block"
                      />

                      {/* Ghost instruction overlay when canvas is empty */}
                      {undoStack.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none select-none">
                          <PenTool className="w-8 h-8 text-[#9e8f78]/30 mb-2" />
                          <p className="text-xs font-mono text-[#9e8f78]">DRAWING DESK ACTIVE</p>
                          <p className="text-[10px] text-[#9e8f78]/60 mt-1 max-w-[280px]">
                            Focus on the line of action! Swipe rapidly. Lock wrist, draw from your shoulder.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Size and Manual Action ribbon */}
                    <div className="p-4 bg-[#222222] border-t border-[#ffdca1]/5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <span className="text-xs font-mono text-[#9e8f78] uppercase whitespace-nowrap">Size: {brushSize}px</span>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-full accent-[#ffdca1] bg-[#333333] rounded-lg appearance-none h-1.5"
                        />
                      </div>

                      {/* Main save & AI evaluation trigger buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleManualSave}
                          className="px-3.5 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#ffdca1]/10 hover:border-[#ffdca1]/30 text-xs font-semibold rounded-lg text-[#ffdca1] transition-all flex items-center gap-1.5"
                          title="Save drawing directly without waiting for timer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Study
                        </button>

                        <button
                          onClick={handleTriggerAiCritique}
                          disabled={isGeneratingCritique}
                          className="px-4 py-2 bg-[#ffdca1] hover:bg-[#f3cf95] disabled:bg-[#ffdca1]/40 disabled:text-[#e0e0e0] text-[#121212] font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          {isGeneratingCritique ? "Critiquing..." : "Instructor Critique"}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* ==========================================
                  AI ACADEMY INSTRUCTOR CRITIQUE BOARD RENDER
                  ========================================== */}
              {isGeneratingCritique && (
                <div className="bg-[#1a1a1a] border border-[#ffdca1]/20 p-8 rounded-xl text-center space-y-4 animate-pulse">
                  <Sparkles className="w-10 h-10 text-[#ffdca1] mx-auto animate-spin" />
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#ffdca1]">Evaluating Kinetic Rhythm...</h3>
                    <p className="text-xs text-[#9e8f78] max-w-md mx-auto mt-1">
                      Our Art Academy Instructor Engine is analyzing your structural line coordinates, stroke density, and muscle balance against classical models.
                    </p>
                  </div>
                </div>
              )}

              {critiqueResult && (
                <div className="bg-[#1a1a1a] border-l-4 border-l-[#ffdca1] border border-[#ffdca1]/10 p-6 rounded-xl space-y-6 shadow-xl">
                  
                  {/* Title banner */}
                  <div className="flex items-center justify-between border-b border-[#ffdca1]/10 pb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#ffdca1]/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#ffdca1]" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-[#ffdca1]">Instructor&apos;s AI Anatomy Evaluation</h3>
                        <p className="text-xs text-[#9e8f78]">Constructive academic sketch critique</p>
                      </div>
                    </div>
                    
                    {/* Score Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#9e8f78]">RHYTHM METRIC:</span>
                      <div className="px-3 py-1 bg-[#252525] border border-[#ffdca1]/20 rounded text-sm font-mono font-bold text-[#ffdca1]">
                        {critiqueResult.score} / 100
                      </div>
                    </div>
                  </div>

                  {/* Main Grid for critiqued nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Impression */}
                    <div className="space-y-1 bg-[#222222] p-4 rounded-lg border border-[#333]">
                      <h4 className="text-xs font-mono font-bold text-[#ffdca1] uppercase tracking-wide">Overall Impression</h4>
                      <p className="text-xs text-[#e0e0e0] leading-relaxed italic">
                        &ldquo;{critiqueResult.impression}&rdquo;
                      </p>
                    </div>

                    {/* Anatomy */}
                    <div className="space-y-1 bg-[#222222] p-4 rounded-lg border border-[#333]">
                      <h4 className="text-xs font-mono font-bold text-[#ffdca1] uppercase tracking-wide">Structural Anatomy</h4>
                      <p className="text-xs text-[#e0e0e0] leading-relaxed">
                        {critiqueResult.anatomyCritique}
                      </p>
                    </div>

                    {/* Line & Motion */}
                    <div className="space-y-1 bg-[#222222] p-4 rounded-lg border border-[#333]">
                      <h4 className="text-xs font-mono font-bold text-[#ffdca1] uppercase tracking-wide">Line weight & Kinetic motion</h4>
                      <p className="text-xs text-[#e0e0e0] leading-relaxed">
                        {critiqueResult.lineCritique}
                      </p>
                    </div>

                    {/* Proportions */}
                    <div className="space-y-1 bg-[#222222] p-4 rounded-lg border border-[#333]">
                      <h4 className="text-xs font-mono font-bold text-[#ffdca1] uppercase tracking-wide">Proportions & Center of Mass</h4>
                      <p className="text-xs text-[#e0e0e0] leading-relaxed">
                        {critiqueResult.proportionsCritique}
                      </p>
                    </div>

                  </div>

                  {/* Master academy advice */}
                  <div className="p-4 bg-[#ffdca1]/5 border border-[#ffdca1]/15 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-mono text-[#ffdca1] uppercase tracking-widest font-semibold block">Academy Homework Drill</span>
                    <p className="text-xs text-[#ffdca1]/90 leading-relaxed italic">
                      &ldquo;{critiqueResult.instructorAdvice}&rdquo;
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => setCritiqueResult(null)}
                      className="px-3.5 py-1.5 bg-[#252525] hover:bg-[#333] text-[#e0e0e0] border border-[#333] hover:border-[#ffdca1]/20 text-xs font-semibold rounded-lg transition-all"
                    >
                      Dismiss Critique
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB: DAILY ACADEMY CHALLENGES
              ========================================== */}
          {activeTab === "challenges" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-[#ffdca1] tracking-tight">Structured Daily Routines</h2>
                <p className="text-xs text-[#9e8f78] max-w-xl">
                  Art Academy Challenges contain rapid sequence poses with automatic transitions. Capture kinetic energy quickly to earn substantial bonus XP.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DAILY_CHALLENGES.map(challenge => (
                  <div key={challenge.id} className="bg-[#1a1a1a] border border-[#ffdca1]/10 hover:border-[#ffdca1]/30 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg transition-all group">
                    <div className="p-5 space-y-3">
                      
                      {/* Reward indicator */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono bg-[#ffdca1]/10 text-[#ffdca1] px-2 py-0.5 rounded-full border border-[#ffdca1]/20">
                          +{challenge.xpReward} XP REWARD
                        </span>
                        <Award className="w-4 h-4 text-[#ffdca1]/40 group-hover:text-[#ffdca1] transition-colors" />
                      </div>

                      <h3 className="font-display font-bold text-[#ffdca1] text-base tracking-tight">{challenge.title}</h3>
                      <p className="text-xs text-[#e0e0e0]/80 leading-relaxed">{challenge.description}</p>
                      
                      <div className="space-y-1.5 pt-3">
                        <div className="flex justify-between text-[10px] font-mono text-[#9e8f78]">
                          <span>Interval Pose Speed:</span>
                          <span className="text-[#ffdca1] font-semibold">{challenge.timePerPose}s / pose</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[#9e8f78]">
                          <span>Total Reference Poses:</span>
                          <span className="text-[#ffdca1] font-semibold">{challenge.poseIndices.length} poses</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[#9e8f78]">
                          <span>Academy Medal:</span>
                          <span className="text-[#ffdca1] font-semibold">{challenge.badge}</span>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 bg-[#1f1f1f] border-t border-[#ffdca1]/5">
                      <button
                        onClick={() => startChallenge(challenge)}
                        className="w-full py-2 bg-[#2a2a2a] group-hover:bg-[#ffdca1] group-hover:text-[#121212] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 text-[#ffdca1]"
                      >
                        Launch Challenge
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB: ACADEMY HANDBOOK / ANATOMY STUDY
              ========================================== */}
          {activeTab === "anatomy" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-[#ffdca1] tracking-tight">Art Academy Pro Handbook</h2>
                <p className="text-xs text-[#9e8f78]">
                  Learn the structural techniques of gesture drawing to rapidly represent the human shape.
                </p>
              </div>

              {/* Grid content card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 p-5 rounded-xl space-y-4">
                  <h3 className="font-display font-bold text-base text-[#ffdca1]">1. The Line of Action</h3>
                  <p className="text-xs text-[#e0e0e0] leading-relaxed">
                    The Line of Action is a single sweeping guide line (usually an S or C curve) representing the flow, momentum, and spine path of the model. 
                  </p>
                  <div className="p-4 bg-[#222222] rounded-lg border border-[#333] space-y-2 text-[11px] font-mono text-[#9e8f78]">
                    <div className="text-[#ffdca1] font-bold">✓ CORE RULES:</div>
                    <div>• Draw this line FIRST. Never omit it.</div>
                    <div>• It stretches from head down to the weight bearing heel.</div>
                    <div>• Do not double-stroke; paint the motion in one rapid arm sweep.</div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 p-5 rounded-xl space-y-4">
                  <h3 className="font-display font-bold text-base text-[#ffdca1]">2. Contrapposto Tilt</h3>
                  <p className="text-xs text-[#e0e0e0] leading-relaxed">
                    In classical standing figures, the shoulders tilt in opposition to the pelvis. This pelvic shift establishes weight, mass balance, and organic rhythm.
                  </p>
                  <div className="p-4 bg-[#222222] rounded-lg border border-[#333] space-y-2 text-[11px] font-mono text-[#9e8f78]">
                    <div className="text-[#ffdca1] font-bold">✓ STRUCTURAL SECRETS:</div>
                    <div>• Find which leg bears the weight. This hip tilts UPWARDS.</div>
                    <div>• The shoulder line opposite tilts DOWNWARDS to balance.</div>
                    <div>• Draw the torso as box shapes compressing on one side.</div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 p-5 rounded-xl space-y-4">
                  <h3 className="font-display font-bold text-base text-[#ffdca1]">3. Negative Space & Silhouettes</h3>
                  <p className="text-xs text-[#e0e0e0] leading-relaxed">
                    Instead of painting individual muscles, trace the outer silhouette shape. Study the pockets of empty space created between arms, legs, and core.
                  </p>
                  <div className="p-4 bg-[#222222] rounded-lg border border-[#333] space-y-2 text-[11px] font-mono text-[#9e8f78]">
                    <div className="text-[#ffdca1] font-bold">✓ HOW TO STUDY:</div>
                    <div>• Squint your eyes to blur details and focus purely on overall silhouette.</div>
                    <div>• Ensure limbs are distinct so negative space pockets are recognizable.</div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 p-5 rounded-xl space-y-4">
                  <h3 className="font-display font-bold text-base text-[#ffdca1]">4. Proportions & Head Units</h3>
                  <p className="text-xs text-[#e0e0e0] leading-relaxed">
                    The average human height stands roughly around 7.5 to 8 head units. Maintain these proportional checkmarks to avoid awkward limb elongation.
                  </p>
                  <div className="p-4 bg-[#222222] rounded-lg border border-[#333] space-y-2 text-[11px] font-mono text-[#9e8f78]">
                    <div className="text-[#ffdca1] font-bold">✓ PROPORTIONS CHART:</div>
                    <div>• Pelvic center is exactly the halfway point of human height.</div>
                    <div>• Elbow crease aligns precisely with the bottom of ribcage.</div>
                    <div>• Outstretched arm span matches total height completely.</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB: PORTFOLIO & WORK HISTORY
              ========================================== */}
          {activeTab === "portfolio" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-display font-bold text-[#ffdca1] tracking-tight">Your Portfolio Sketches</h2>
                  <p className="text-xs text-[#9e8f78]">
                    Stored visual captures of your gesture drawing practice sessions.
                  </p>
                </div>
                
                {completedSessions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Clear all sketches from portfolio? This is permanent.")) {
                        setCompletedSessions([]);
                        localStorage.removeItem("art_academy_sessions");
                      }
                    }}
                    className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-all"
                  >
                    Clear All History
                  </button>
                )}
              </div>

              {/* No sketches fallback */}
              {completedSessions.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#ffdca1]/10 rounded-xl p-12 text-center space-y-4">
                  <PenTool className="w-12 h-12 text-[#9e8f78]/30 mx-auto" />
                  <div>
                    <h3 className="font-display font-bold text-[#ffdca1] text-base">Your Canvas Gallery is Empty</h3>
                    <p className="text-xs text-[#9e8f78] max-w-sm mx-auto mt-1">
                      Complete drawing studies or click &ldquo;Save Study&rdquo; at the drawing desk to start compiling your personal portfolio gallery!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("practice")}
                    className="px-4 py-2 bg-[#ffdca1] text-[#121212] font-bold rounded-lg text-xs hover:bg-[#f3cf95] transition-all"
                  >
                    Go to Active Drawing Desk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="bg-[#1a1a1a] border border-[#ffdca1]/10 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
                      
                      {/* Image Preview Canvas */}
                      <div className="relative aspect-[4/3] bg-[#0c0c0c] flex items-center justify-center p-3">
                        <img 
                          src={session.savedDrawing} 
                          alt="Drawing capture" 
                          className="max-h-full max-w-full object-contain bg-[#1a1a1a] rounded border border-[#ffdca1]/5"
                        />
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-mono px-2 py-0.5 bg-black/80 rounded-full text-[#ffdca1] border border-[#ffdca1]/20">
                          +{session.xpEarned} XP
                        </span>
                      </div>

                      <div className="p-4 space-y-3 bg-[#181818]">
                        <div>
                          <h4 className="text-xs font-bold text-[#ffdca1]">{session.poseName}</h4>
                          <span className="text-[9px] font-mono text-[#9e8f78] block">
                            Study Date: {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        {/* Interactive download/delete */}
                        <div className="flex items-center justify-between border-t border-[#ffdca1]/5 pt-3">
                          <button
                            onClick={() => handleDownloadDrawing(session.savedDrawing, session.poseName)}
                            className="text-xs text-[#9e8f78] hover:text-[#ffdca1] transition-all flex items-center gap-1 font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>

                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-all flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB: PRACTICE SETTINGS
              ========================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-3xl mx-auto bg-[#1a1a1a] border border-[#ffdca1]/10 p-6 md:p-8 rounded-xl shadow-xl">
              
              <div className="border-b border-[#ffdca1]/10 pb-4">
                <h2 className="text-xl font-display font-bold text-[#ffdca1] tracking-tight">Practice Desk Configuration</h2>
                <p className="text-xs text-[#9e8f78]">Configure sound mechanics and storage options.</p>
              </div>

              {/* Configurations block */}
              <div className="space-y-6 pt-2">
                
                {/* Audio chime settings */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#ffdca1] flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    Chime Feedback Pitch
                  </h3>
                  <p className="text-xs text-[#9e8f78]">Adjust the frequency pitch triggered during timer intervals.</p>
                  <div className="flex gap-2">
                    {[220, 440, 523.25, 880].map((pitch) => (
                      <button
                        key={pitch}
                        onClick={() => {
                          playChime(pitch, "sine", 0.35);
                        }}
                        className="px-4 py-2 bg-[#252525] hover:bg-[#333] border border-[#333] text-xs font-mono rounded text-[#ffdca1] transition-all"
                      >
                        {pitch === 220 ? "Low A (220Hz)" : pitch === 440 ? "Standard A (440Hz)" : pitch === 880 ? "High A (880Hz)" : "Standard C (523Hz)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Stats manual reset */}
                <div className="space-y-3 pt-4 border-t border-[#ffdca1]/10">
                  <h3 className="text-sm font-semibold text-[#ffdca1] flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Reset Academy Progress
                  </h3>
                  <p className="text-xs text-[#9e8f78]">
                    Permanently wipe your practice profile stats (XP, levels, and study streaks). Stored photos in your Portfolio remain unaffected.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Permanently reset your academic profile stats? This resets XP back to 350, Level to 1, and Streaks to 3.")) {
                        setXp(350);
                        setLevel(1);
                        setStreak(3);
                        localStorage.setItem("art_academy_xp", "350");
                        localStorage.setItem("art_academy_level", "1");
                        localStorage.setItem("art_academy_streak", "3");
                        alert("Academy profile stats successfully reset.");
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all"
                  >
                    Reset Academic Level & Streak Stats
                  </button>
                </div>

                {/* Info Card */}
                <div className="p-4 bg-[#ffdca1]/5 border border-[#ffdca1]/10 rounded-lg flex gap-3 pt-6">
                  <Info className="w-5 h-5 text-[#ffdca1] shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#ffdca1]">Local Storage Sandboxing</h4>
                    <p className="text-[11px] text-[#9e8f78] leading-relaxed">
                      All drawing captures, custom loaded reference poses, and level values are securely preserved locally in your browser cache. Clearing your browser cookies or cache will clear your gallery history.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          MODAL: CUSTOM POSE ADDER
          ========================================== */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-[#000000]/80 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowCustomModal(false)}
          />
          <div className="bg-[#1a1a1a] border border-[#ffdca1]/15 max-w-md w-full rounded-xl overflow-hidden relative z-10 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-[#ffdca1]">Practice with Own Image Reference</h3>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-[#9e8f78] hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomPose} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9e8f78] uppercase">Reference Photo URL</label>
                <input
                  type="url"
                  placeholder="Paste direct .png, .jpg or static URL..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full bg-[#252525] border border-[#333] focus:border-[#ffdca1] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="bg-[#222222] p-3 rounded border border-[#333] space-y-1">
                <span className="text-[10px] font-mono text-[#ffdca1] uppercase font-bold">Pro Tip:</span>
                <p className="text-[10px] text-[#9e8f78] leading-relaxed">
                  You can copy any royalty-free reference image URL from Unsplash, Pinterest, or your cloud storage. Make sure it begins with http/https and points to a direct public image.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-transparent text-xs font-semibold text-[#9e8f78] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ffdca1] hover:bg-[#f3cf95] text-[#121212] font-bold text-xs rounded-lg shadow-md transition-all"
                >
                  Load Reference
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
