import axios from "axios";
import { CONSTANTS } from "../utils/constants";

export const sendMessageToBot = async (message, context) => {
  try {
    const response = await axios.post(CONSTANTS.API_URL, {
      message,
      context
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};


