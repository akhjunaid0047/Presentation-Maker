import { config } from "dotenv";
import { generateId } from "./generateid.js";
import axios from "axios";
import WebSocket from "ws";
config();

const ALAI_BASE_URL = "https://alai-standalone-backend.getalai.com";
const bearerToken = process.env.bearerToken;
let slideId;
async function createPresentation() {
  const getUUID = generateId();
  console.log(getUUID);

  try {
    const response = await axios.post(
      `${ALAI_BASE_URL}/create-new-presentation`,
      {
        presentation_id: getUUID,
        presentation_title: "Untitled Presentation",
        create_first_slide: true,
        theme_id: "a6bff6e5-3afc-4336-830b-fbc710081012",
        default_color_set_id: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating presentation:",
      error.response ? error.response.data : error.message
    );
  }
}

async function getCalibrationSampleText(presentation_id, rawContext) {
  try {
    const response = await axios.post(
      `${ALAI_BASE_URL}/get-calibration-sample-text`,
      {
        presentation_id,
        raw_context: rawContext,
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    console.log("Calibration Sample Text:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching calibration sample text:",
      error.response ? error.response.data : error.message
    );
  }
}

function streamSlideVariants(
  presentation_id,
  slide_id,
  slide_specific_context
) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `${ALAI_BASE_URL.replace(
        "https",
        "wss"
      )}/ws/create-and-stream-slide-variants`
    );

    const receivedVariants = [];

    ws.on("open", () => {
      const message = {
        auth_token: `${bearerToken}`,
        presentation_id,
        slide_id,
        slide_specific_context,
        images_on_slide: [],
        additional_instructions: "",
        layout_type: "AI_GENERATED_LAYOUT",
        update_tone_verbosity_calibration_status: true,
      };
      ws.send(JSON.stringify(message));
      console.log("WebSocket message sent to create slide variants.");
    });

    ws.on("message", (data) => {
      try {
        const messageString = data.toString("utf-8");
        const parsedMessage = JSON.parse(messageString);

        if (parsedMessage.element_slide) {
          receivedVariants.push(parsedMessage);
        }
        if (receivedVariants.length >= 4) {
          ws.close();
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      resolve(receivedVariants); 
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      reject(error); 
    });
  });
}

async function pickSlideVariant(slideId, variantId) {
  try {
    const response = await axios.post(
      `${ALAI_BASE_URL}/pick-slide-variant`,
      {
        slide_id: slideId,
        variant_id: variantId,
      },
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error picking slide variant:",
      error.response?.data || error.message
    );
  }
}

async function createNewSlide(presentationId, slideOrder) {
  try {
    const response = await axios.post(
      `${ALAI_BASE_URL}/create-new-slide`,
      {
        slide_id: generateId(),
        presentation_id: presentationId,
        product_type: "PRESENTATION_CREATOR",
        slide_order: slideOrder,
        color_set_id: 0,
      },
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );
    console.log("New Slide Created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating new slide:",
      error.response?.data || error.message
    );
  }
}

async function getSharableLink(presentationId) {
  try {
    const response = await axios.post(
      `${ALAI_BASE_URL}/upsert-presentation-share`,
      { presentation_id: presentationId },
      {// Assuming your summarizeData function is in summariser.js
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error getting sharable link:",
      error.response?.data || error.message
    );
  }
}

export async function executePresentationFlow(paragraphsArray) {
  try {
    const presentationResponse = await createPresentation();
    console.log("Presentation Created:", presentationResponse);

    const presentationId = presentationResponse.id;
    const firstSlideId = presentationResponse.slides[0].id;

    const calibrationSample = await getCalibrationSampleText(
      presentationId,
      paragraphsArray[0]
    );
    console.log("Calibration Sample Text:", calibrationSample);

    const slideVariants = await streamSlideVariants(
      presentationId,
      firstSlideId,
      calibrationSample.sample_text
    );
    console.log("Slide Variants Received:", slideVariants);

    const selectedVariantId = slideVariants[0].id;
    const pickVariantResponse = await pickSlideVariant(
      firstSlideId,
      selectedVariantId
    );
    console.log("Slide Variant Picked:", pickVariantResponse);
    for (let i = 0; i < 4; i++) {
      slideId = await createNewSlide(presentationId, i + 1); 
      console.log(`New Slide Created with ID: ${slideId.slides[i].id}`);
    }

    const slides = slideId.slides;

    for (const slide of slides) {
        if (slide.slide_order === 0) continue; // Skip slide with order 0 ( the first slide )
  
        const slideId = slide.id;
  
        const slideVariants = await streamSlideVariants(
          presentationId,
          slideId,
          paragraphsArray[slide.slide_order]
        );
        console.log(`Slide Variants Received for slide order ${slide.slide_order}:`, slideVariants);
  
        if (slideVariants.length > 0) {
          const selectedVariantId = slideVariants[0].id;
          const pickVariantResponse = await pickSlideVariant(slideId, selectedVariantId);
          console.log(`Slide Variant Picked for slide order ${slide.slide_order}:`, pickVariantResponse);
        }
      }

    const sharableLink = await getSharableLink(presentationId);
    console.log(
      "Sharable Link:",
      `https://app.getalai.com/view/${sharableLink}`
    );
  } catch (error) {
    console.error("Error in execution flow:", error);
  }
}

