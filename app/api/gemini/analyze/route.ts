import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userSketch, referenceUrl, poseName, anatomyFocus } = await req.json();

    if (!userSketch) {
      return NextResponse.json(
        { error: "User sketch is required for analysis." },
        { status: 400 }
      );
    }

    if (!referenceUrl) {
      return NextResponse.json(
        { error: "Reference image URL/data is required." },
        { status: 400 }
      );
    }

    // 1. Initialize Gemini client safely
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in the workspace settings." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // 2. Process user sketch base64
    let sketchBase64 = userSketch;
    if (sketchBase64.startsWith("data:")) {
      sketchBase64 = sketchBase64.split(",")[1];
    }

    // 3. Process reference image base64 (fetching if it is a remote URL)
    let refBase64 = "";
    let refMimeType = "image/jpeg";

    try {
      if (referenceUrl.startsWith("data:")) {
        const parts = referenceUrl.split(",");
        refBase64 = parts[1];
        const match = parts[0].match(/data:(.*?);/);
        if (match) {
          refMimeType = match[1];
        }
      } else {
        // Fetch the remote image
        const fetchRes = await fetch(referenceUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        
        if (!fetchRes.ok) {
          throw new Error(`Failed to fetch remote reference image: ${fetchRes.statusText}`);
        }
        
        const contentType = fetchRes.headers.get("content-type");
        if (contentType) {
          refMimeType = contentType;
        }
        
        const arrayBuffer = await fetchRes.arrayBuffer();
        refBase64 = Buffer.from(arrayBuffer).toString("base64");
      }
    } catch (fetchErr: any) {
      console.error("Error loading reference image on server:", fetchErr);
      return NextResponse.json(
        { error: `Could not load reference image for comparison: ${fetchErr.message}` },
        { status: 422 }
      );
    }

    // 4. Set up parts for multimodal call
    const referenceImagePart = {
      inlineData: {
        mimeType: refMimeType,
        data: refBase64,
      },
    };

    const userSketchPart = {
      inlineData: {
        mimeType: "image/png",
        data: sketchBase64,
      },
    };

    const promptText = `
You are a highly supportive, encouraging, and expert figure-drawing instructor.
Compare the user's sketch (marked as the user drawing) against the professional gesture/anatomy reference image (marked as reference).

Details of the reference pose:
- Name/Type: ${poseName || "Athletic Gesture Pose"}
- Anatomy focus bullet points: ${anatomyFocus || "Proportions, Line of Action, Weight distribution, and joint placements"}

Please provide a highly polished, helpful, and structured art critique in JSON format.
Your critique must contain the following keys exactly:
- "overallImpression": A warm, encouraging paragraph (3-4 sentences) evaluating the user's grasp of gesture, energy, line of action, and weight of the pose. Mention specific things they captured well.
- "anatomicalChecklist": An array of objects, where each object has:
    * "focus": string (e.g. "Clavicle Alignment", "Sternal Notch Position", "Pelvic Tilt", or "Center of Gravity")
    * "status": "excellent" | "good" | "needs_adjustment"
    * "feedback": string (brief, constructive 1-sentence guide on how their sketch compares to the reference for this specific anatomical feature)
- "areasOfSuccess": An array of 2-3 specific bullet points highlighting what they did exceptionally well (e.g., "Dynamic stretch in the left arm is beautifully exaggerated", "The head-to-heel balance line is spot on").
- "improvements": An array of 2-3 actionable, step-by-step suggestions on how they can improve this specific drawing or their future gesture practices.
- "instructorTip": A brief, inspiring, professional drawing wisdom or quote (1-2 sentences) about learning to draw figures (e.g. focusing on 3D volume, drawing from the shoulder, or capturing the 'force' first).

Make sure the response is strict JSON. Do not include markdown code block syntax (like \`\`\`json) inside the JSON string itself. Avoid jargon that a beginner wouldn't understand, but keep it highly educational and professional.
`;

    const systemInstruction = "You are a professional, encouraging art academy figure drawing professor who evaluates student gesture sketches relative to reference figures.";

    // 5. Query Gemini 3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        referenceImagePart,
        userSketchPart,
        { text: promptText },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            overallImpression: {
              type: "STRING",
              description: "A constructive, warm overview of the sketch's gesture, flow, and capture of weight.",
            },
            anatomicalChecklist: {
              type: "ARRAY",
              description: "Comparison check on key landmarks.",
              items: {
                type: "OBJECT",
                properties: {
                  focus: { type: "STRING" },
                  status: { type: "STRING", enum: ["excellent", "good", "needs_adjustment"] },
                  feedback: { type: "STRING" },
                },
                required: ["focus", "status", "feedback"],
              },
            },
            areasOfSuccess: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "2-3 highly positive callouts of what worked beautifully.",
            },
            improvements: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "2-3 actionable guidelines or adjustments.",
            },
            instructorTip: {
              type: "STRING",
              description: "An inspiring closing thought about figure study.",
            },
          },
          required: ["overallImpression", "anatomicalChecklist", "areasOfSuccess", "improvements", "instructorTip"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from the Gemini AI model.");
    }

    // 6. Return parsed JSON or raw string
    try {
      const parsedData = JSON.parse(text);
      return NextResponse.json(parsedData);
    } catch {
      // If parsing fails, try to return it as text under a fallback key
      return NextResponse.json({
        overallImpression: text,
        anatomicalChecklist: [
          { focus: "General Pose", status: "good", feedback: "The AI was unable to structure the landmark details, but has provided a general review." }
        ],
        areasOfSuccess: ["Captured the general silhouette and weight distribution."],
        improvements: ["Focus on finding the dynamic line of action in your first 10 seconds."],
        instructorTip: "Keep practicing! Every sketch builds muscle memory."
      });
    }
  } catch (error: any) {
    console.error("Gemini Analyze Route Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during AI analysis." },
      { status: 500 }
    );
  }
}
