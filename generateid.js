import { v4 as uuidv4 } from "uuid";

// Generate a unique presentation ID
export const generateId = () => {
  return uuidv4();
};

