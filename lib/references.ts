export interface SkeletonJoint {
  name: string;
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
}

export interface SkeletonBone {
  from: string;
  to: string;
}

export interface Pose {
  id: string;
  name: string;
  url: string;
  tags: string[];
  focus: string;
  notes: string[];
  skeleton: {
    joints: SkeletonJoint[];
    bones: SkeletonBone[];
  };
}

export const GESTURE_POSES: Pose[] = [
  {
    id: "pose-1",
    name: "Athletic Reach Study",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWWBoCiBW-yvWkEy8N7uXJaZJWTbLrC9ZKpNORH4N3G0TZn3L46mvl5DhB5rixz0e_5QAApMMdAWZ61TD4ElFaFnHJFNzsTraUz1W8EGa-OaJJ67uXv2NzJ_XnKt3uD-ZKrn9_pQtsPN1-EpWbGuqr3osh9eNbmNcCX6czqrhJOqmRejEvUQvD8S0qwObJFhtEh1RmyFj3VNFssP6ol8qFdwSLwj86lTKYGhV-jE1vlqBo6Iu-hnsBGdnu68uKTMW2YVMb9vzT_z0",
    tags: ["Dynamic", "Foreshortening", "Male", "Athletic"],
    focus: "Line of Action & Torso Twist",
    notes: [
      "Clavicle alignment: Angled down on reaching side.",
      "Sternal notch positioning: Centered over leading foot.",
      "Pelvic tilt: Angled steeply with trailing hip elevated."
    ],
    skeleton: {
      joints: [
        { name: "head", x: 61, y: 20 },
        { name: "neck", x: 57, y: 21 },
        { name: "l_shoulder", x: 50, y: 20 },
        { name: "r_shoulder", x: 59, y: 23 },
        { name: "l_elbow", x: 41, y: 14 },
        { name: "r_elbow", x: 60, y: 34 },
        { name: "l_wrist", x: 31, y: 19 },
        { name: "r_wrist", x: 66, y: 55 },
        { name: "mid_torso", x: 51, y: 27 },
        { name: "pelvis", x: 44, y: 38 },
        { name: "l_hip", x: 41, y: 39 },
        { name: "r_hip", x: 46, y: 40 },
        { name: "l_knee", x: 35, y: 51 },
        { name: "r_knee", x: 54, y: 53 },
        { name: "l_ankle", x: 31, y: 81 },
        { name: "r_ankle", x: 56, y: 83 }
      ],
      bones: [
        { from: "head", to: "neck" },
        { from: "neck", to: "l_shoulder" },
        { from: "neck", to: "r_shoulder" },
        { from: "l_shoulder", to: "l_elbow" },
        { from: "l_elbow", to: "l_wrist" },
        { from: "r_shoulder", to: "r_elbow" },
        { from: "r_elbow", to: "r_wrist" },
        { from: "neck", to: "mid_torso" },
        { from: "mid_torso", to: "pelvis" },
        { from: "pelvis", to: "l_hip" },
        { from: "pelvis", to: "r_hip" },
        { from: "l_hip", to: "l_knee" },
        { from: "l_knee", to: "l_ankle" },
        { from: "r_hip", to: "r_knee" },
        { from: "r_knee", to: "r_ankle" }
      ]
    }
  },
  {
    id: "pose-2",
    name: "Dancer's Extension",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200",
    tags: ["Graceful", "Leap", "Female", "Stretch"],
    focus: "Spine Arch & Kinetic Reach",
    notes: [
      "Head rotation: Gazing upward along the line of reach.",
      "Spine: Expansive backbend creating a fluid C-curve.",
      "Ankle extension: Full plantar flexion extending the line."
    ],
    skeleton: {
      joints: [
        { name: "head", x: 43, y: 28 },
        { name: "neck", x: 46, y: 33 },
        { name: "l_shoulder", x: 45, y: 37 },
        { name: "r_shoulder", x: 53, y: 34 },
        { name: "l_elbow", x: 36, y: 44 },
        { name: "r_elbow", x: 62, y: 28 },
        { name: "l_wrist", x: 28, y: 50 },
        { name: "r_wrist", x: 71, y: 20 },
        { name: "mid_torso", x: 51, y: 42 },
        { name: "pelvis", x: 57, y: 50 },
        { name: "l_hip", x: 55, y: 52 },
        { name: "r_hip", x: 59, y: 49 },
        { name: "l_knee", x: 52, y: 64 },
        { name: "r_knee", x: 70, y: 55 },
        { name: "l_ankle", x: 48, y: 77 },
        { name: "r_ankle", x: 82, y: 59 }
      ],
      bones: [
        { from: "head", to: "neck" },
        { from: "neck", to: "l_shoulder" },
        { from: "neck", to: "r_shoulder" },
        { from: "l_shoulder", to: "l_elbow" },
        { from: "l_elbow", to: "l_wrist" },
        { from: "r_shoulder", to: "r_elbow" },
        { from: "r_elbow", to: "r_wrist" },
        { from: "neck", to: "mid_torso" },
        { from: "mid_torso", to: "pelvis" },
        { from: "pelvis", to: "l_hip" },
        { from: "pelvis", to: "r_hip" },
        { from: "l_hip", to: "l_knee" },
        { from: "l_knee", to: "l_ankle" },
        { from: "r_hip", to: "r_knee" },
        { from: "r_knee", to: "r_ankle" }
      ]
    }
  },
  {
    id: "pose-3",
    name: "Yoga Balance Alignment",
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200",
    tags: ["Asymmetrical", "Flexibility", "Female", "Static"],
    focus: "Vertical Axis & Supporting Hip Lock",
    notes: [
      "Center of gravity: Perfectly vertical balance line.",
      "Shoulder girdle: Parallel to the supportive ground.",
      "Knee locked: Supporting knee displays clear stability."
    ],
    skeleton: {
      joints: [
        { name: "head", x: 50, y: 15 },
        { name: "neck", x: 50, y: 20 },
        { name: "l_shoulder", x: 43, y: 22 },
        { name: "r_shoulder", x: 57, y: 22 },
        { name: "l_elbow", x: 38, y: 27 },
        { name: "r_elbow", x: 62, y: 14 },
        { name: "l_wrist", x: 36, y: 34 },
        { name: "r_wrist", x: 65, y: 6 },
        { name: "mid_torso", x: 50, y: 32 },
        { name: "pelvis", x: 50, y: 44 },
        { name: "l_hip", x: 45, y: 45 },
        { name: "r_hip", x: 55, y: 45 },
        { name: "l_knee", x: 45, y: 60 },
        { name: "r_knee", x: 62, y: 40 },
        { name: "l_ankle", x: 45, y: 80 },
        { name: "r_ankle", x: 74, y: 35 }
      ],
      bones: [
        { from: "head", to: "neck" },
        { from: "neck", to: "l_shoulder" },
        { from: "neck", to: "r_shoulder" },
        { from: "l_shoulder", to: "l_elbow" },
        { from: "l_elbow", to: "l_wrist" },
        { from: "r_shoulder", to: "r_elbow" },
        { from: "r_elbow", to: "r_wrist" },
        { from: "neck", to: "mid_torso" },
        { from: "mid_torso", to: "pelvis" },
        { from: "pelvis", to: "l_hip" },
        { from: "pelvis", to: "r_hip" },
        { from: "l_hip", to: "l_knee" },
        { from: "l_knee", to: "l_ankle" },
        { from: "r_hip", to: "r_knee" },
        { from: "r_knee", to: "r_ankle" }
      ]
    }
  },
  {
    id: "pose-4",
    name: "Classic Seated Contrapposto",
    url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200",
    tags: ["Classical", "Seated", "Male", "Resting"],
    focus: "Weight Distribution & Compression",
    notes: [
      "Ribcage/Torso: Heavy compression on the leaning side.",
      "Shoulder vs Pelvis: Direct opposition of angles (contrapposto).",
      "Knee joints: Overlapping layers create immediate 3D depth."
    ],
    skeleton: {
      joints: [
        { name: "head", x: 48, y: 22 },
        { name: "neck", x: 48, y: 28 },
        { name: "l_shoulder", x: 41, y: 31 },
        { name: "r_shoulder", x: 55, y: 29 },
        { name: "l_elbow", x: 35, y: 43 },
        { name: "r_elbow", x: 60, y: 41 },
        { name: "l_wrist", x: 41, y: 52 },
        { name: "r_wrist", x: 55, y: 51 },
        { name: "mid_torso", x: 49, y: 39 },
        { name: "pelvis", x: 50, y: 54 },
        { name: "l_hip", x: 44, y: 56 },
        { name: "r_hip", x: 56, y: 56 },
        { name: "l_knee", x: 34, y: 65 },
        { name: "r_knee", x: 62, y: 64 },
        { name: "l_ankle", x: 38, y: 84 },
        { name: "r_ankle", x: 58, y: 85 }
      ],
      bones: [
        { from: "head", to: "neck" },
        { from: "neck", to: "l_shoulder" },
        { from: "neck", to: "r_shoulder" },
        { from: "l_shoulder", to: "l_elbow" },
        { from: "l_elbow", to: "l_wrist" },
        { from: "r_shoulder", to: "r_elbow" },
        { from: "r_elbow", to: "r_wrist" },
        { from: "neck", to: "mid_torso" },
        { from: "mid_torso", to: "pelvis" },
        { from: "pelvis", to: "l_hip" },
        { from: "pelvis", to: "r_hip" },
        { from: "l_hip", to: "l_knee" },
        { from: "l_knee", to: "l_ankle" },
        { from: "r_hip", to: "r_knee" },
        { from: "r_knee", to: "r_ankle" }
      ]
    }
  },
  {
    id: "pose-5",
    name: "Sprinter Sprint Acceleration",
    url: "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=1200",
    tags: ["Dynamic", "Sprint", "Male", "Action"],
    focus: "Forward Lean & Drive Angle",
    notes: [
      "Drive Line: Straight line from trailing ankle up to the shoulders.",
      "Knee Drive: Strong 90-degree bend forward of the leading hip.",
      "Arm Swing: Reciprocal high-velocity counter balance."
    ],
    skeleton: {
      joints: [
        { name: "head", x: 61, y: 28 },
        { name: "neck", x: 56, y: 31 },
        { name: "l_shoulder", x: 51, y: 27 },
        { name: "r_shoulder", x: 58, y: 35 },
        { name: "l_elbow", x: 42, y: 24 },
        { name: "r_elbow", x: 65, y: 44 },
        { name: "l_wrist", x: 36, y: 21 },
        { name: "r_wrist", x: 70, y: 53 },
        { name: "mid_torso", x: 48, y: 37 },
        { name: "pelvis", x: 40, y: 43 },
        { name: "l_hip", x: 38, y: 42 },
        { name: "r_hip", x: 42, y: 44 },
        { name: "l_knee", x: 47, y: 52 },
        { name: "r_knee", x: 28, y: 47 },
        { name: "l_ankle", x: 41, y: 69 },
        { name: "r_ankle", x: 16, y: 62 }
      ],
      bones: [
        { from: "head", to: "neck" },
        { from: "neck", to: "l_shoulder" },
        { from: "neck", to: "r_shoulder" },
        { from: "l_shoulder", to: "l_elbow" },
        { from: "l_elbow", to: "l_wrist" },
        { from: "r_shoulder", to: "r_elbow" },
        { from: "r_elbow", to: "r_wrist" },
        { from: "neck", to: "mid_torso" },
        { from: "mid_torso", to: "pelvis" },
        { from: "pelvis", to: "l_hip" },
        { from: "pelvis", to: "r_hip" },
        { from: "l_hip", to: "l_knee" },
        { from: "l_knee", to: "l_ankle" },
        { from: "r_hip", to: "r_knee" },
        { from: "r_knee", to: "r_ankle" }
      ]
    }
  }
];

export interface PracticeSession {
  id: string;
  poseId: string;
  poseName: string;
  poseUrl: string;
  sketchUrl: string; // Base64 png data
  date: string;
  duration: number; // in seconds
  critique?: {
    overallImpression: string;
    anatomicalChecklist: Array<{ focus: string; status: string; feedback: string }>;
    areasOfSuccess: string[];
    improvements: string[];
    instructorTip: string;
  };
}

export const DAILY_CHALLENGES = [
  {
    id: "challenge-1",
    title: "Dynamic Warmup Sprint",
    description: "3 rapid poses. 30 seconds each. Train your hand to capture pure action and loose gesture lines without overthinking.",
    poses: ["pose-1", "pose-5", "pose-2"],
    presetDuration: 30,
    xpReward: 150
  },
  {
    id: "challenge-2",
    title: "Classical Alignment Study",
    description: "2 deep-dive structural studies. 3 minutes each. Focus on landmarks like clavicles, pelvic tilts, and joint folds.",
    poses: ["pose-3", "pose-4"],
    presetDuration: 180,
    xpReward: 300
  },
  {
    id: "challenge-3",
    title: "Ultimate Figure Gauntlet",
    description: "All 5 poses sequentially with auto-advance. 60 seconds each. Test your pacing and silhouette accuracy.",
    poses: ["pose-1", "pose-2", "pose-3", "pose-4", "pose-5"],
    presetDuration: 60,
    xpReward: 500
  }
];
