import "dotenv/config";
import OpenAI from "openai";

async function checkOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const client = new OpenAI({ apiKey });

  try {
    const models = await client.models.list();

    console.log("API key authentication successful.");
    console.log(`Models returned: ${models.data.length}`);
  } catch (error) {
    console.error("OpenAI API request failed:");

    if (error instanceof OpenAI.APIError) {
      console.error("Status:", error.status);
      console.error("Code:", error.code);
      console.error("Message:", error.message);
    } else {
      console.error(error);
    }
  }
}

checkOpenAIConnection();
