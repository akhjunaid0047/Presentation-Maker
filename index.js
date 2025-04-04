import { executePresentationFlow } from "./app.js";
import { summarizeData } from "./summariser.js";
import { scrapeData } from "./scrapper.js";

const URL =
  "https://www.millenniumpost.in/bengal/mayor-blames-tvc-for-failing-to-tame-errant-hawkers-605274";

async function main() {
  try {
    // Step 1: Scrape the data from the URL
    const scrapedData = await scrapeData(URL);

    // Step 2: Summarize the data into 5 paragraphs
    const paragraphsArray = await summarizeData(scrapedData);

    console.log(paragraphsArray);

    // Step 3: Execute the presentation flow
    await executePresentationFlow(paragraphsArray);

  } catch (error) {
    console.error("Error in the entire flow:", error);
  }
}

main(); 
