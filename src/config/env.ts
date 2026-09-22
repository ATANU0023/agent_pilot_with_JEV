import "dotenv/config";

const apiKey = process.env.JEV_API_KEY || process.env.TYPESAFE_API_KEY;

if (!apiKey) {
  throw new Error(
    "Neither JEV_API_KEY nor TYPESAFE_API_KEY was found in environment. Please add it to your .env file."
  );
}

// Ensure TYPESAFE_API_KEY is populated for the official SDK default lookup
if (!process.env.TYPESAFE_API_KEY) {
  process.env.TYPESAFE_API_KEY = apiKey;
}

export const env = {
  apiKey,
  typesafeApiKey: apiKey,
  groqApiKey: process.env.GROQ_API_KEY || "",
};