import OpenAI from "openai";
import { config } from "dotenv";

config();

const client = new OpenAI({
  apiKey: process.env.OpenAI_API,
});

let slideContent;

export async function summarizeData(scrapeData) {
  try {

    // Request the model to summarize the content into 5 paragraphs
    const response = await client.responses.create({
      model: "gpt-4o-mini", 
      input: `Summarize the following content into five paragraphs: ${scrapeData} no markdowns no headings just five paragraphs in plain text `,
    });

    slideContent = response.output_text;
    return slideContent
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  } catch (error) {
    console.error("Error:", error);
  }
}
