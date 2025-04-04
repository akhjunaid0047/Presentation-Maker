import FirecrawlApp from "@mendable/firecrawl-js";
import { config } from "dotenv";
config();

const scrapper = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
export async function scrapeData(URL) {
  try {
    const scrapeResponse = await scrapper.scrapeUrl(URL, {
      formats: ["markdown"],
    });

    if (!scrapeResponse.success) {
      throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
    }

    // console.log(scrapeResponse);
    return scrapeResponse.markdown;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

