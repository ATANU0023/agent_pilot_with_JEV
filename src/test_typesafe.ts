import "dotenv/config";

const apiKey = process.env.JEV_API_KEY;

if (!apiKey) {
  throw new Error("JEV_API_KEY is missing");
}

const response = await fetch("https://api.typesafe.ai/v1/models", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

console.log("Status:", response.status);

const data = await response.json();

console.log(JSON.stringify(data, null, 2));