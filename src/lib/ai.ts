import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

// Cache structure
type CachedModel = {
    modelName: string;
    expiresAt: number;
};

// Global cache variable (in-memory)
let validModelCache: CachedModel | null = null;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// NEW PRIORITY LIST: Prioritize Flash (Higher Quotas) and newer models
const MODEL_PRIORITY = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-1.5-pro",
    "gemini-pro-latest"
];

// Helper to check available models
// Now accepts exclude list to skip failed models
async function discoverBestModel(excludedModels: string[] = []): Promise<string> {
    if (!API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        if (!response.ok) {
            console.error(`Failed to list models: ${response.statusText}`);
            return "gemini-1.5-flash"; // Fallback default
        }

        const data = await response.json();
        let availableModels = (data.models || []).map((m: any) => m.name.replace('models/', ''));

        // Filter out excluded models
        if (excludedModels.length > 0) {
            console.log(`Excluding failed models: ${excludedModels.join(', ')}`);
            availableModels = availableModels.filter((m: string) => !excludedModels.includes(m));
        }

        console.log("Candidate Gemini Models:", availableModels);

        // Find the first model in our priority list that exists in available models
        for (const preferred of MODEL_PRIORITY) {
            const match = availableModels.find((m: string) => m.includes(preferred));
            if (match) {
                console.log(`Selected Best Model: ${match}`);
                return match;
            }
        }

        // If no priority match, find any 'generateContent' supported model (Flash preferred fallback)
        const fallback = availableModels.find((m: string) => m.includes('flash')) ||
            availableModels.find((m: string) => m.includes('gemini'));

        if (fallback) return fallback;

        return "gemini-1.5-flash"; // Ultimate fallback

    } catch (e) {
        console.error("Error discovering models:", e);
        return "gemini-1.5-flash";
    }
}

// Updated getGeminiModel to accept exclusions
export const getGeminiModel = async (forceRefresh = false, excludedModels: string[] = []) => {
    if (!API_KEY) {
        console.warn("GEMINI_API_KEY is not set.");
        return null;
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }

    // Check Cache (only if not forcing refresh)
    const now = Date.now();
    if (!forceRefresh && validModelCache && validModelCache.expiresAt > now) {
        return genAI.getGenerativeModel({ model: validModelCache.modelName });
    }

    // Refresh Cache with logic to pick best model (avoiding excluded ones)
    const bestModelName = await discoverBestModel(excludedModels);
    validModelCache = {
        modelName: bestModelName,
        expiresAt: now + CACHE_TTL
    };

    return genAI.getGenerativeModel({ model: bestModelName });
};

export const generateContent = async (prompt: string) => {
    let currentModelName = validModelCache?.modelName || "unknown";

    try {
        const aiModel = await getGeminiModel();
        if (!aiModel) throw new Error("AI Model initialization failed.");

        currentModelName = (aiModel as any).model || validModelCache?.modelName;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.warn(`AI Generation Failed with model ${currentModelName}. Attempting retry with alternative model...`, error.message);

        // Invalidate cache and retry, EXCLUDING the current failed model
        try {
            const failedModel = currentModelName;
            const aiModel = await getGeminiModel(true, [failedModel]); // Force refresh & Exclude failed
            if (!aiModel) throw new Error("AI Model initialization failed after refresh.");

            const result = await aiModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (retryError) {
            console.error("Retry failed:", retryError);
            throw retryError;
        }
    }
};
