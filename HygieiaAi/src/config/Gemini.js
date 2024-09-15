import axios from 'axios';

const API_KEY = 'G42ad4lxj23BhqTEl7NRnvMNWCw07LHb'; // Replace with your actual API key
const EXTERNAL_USER_ID = '<replace_external_user_id>'; // Replace with your external user ID

// Function to create chat session
async function createChatSession() {
  try {
    const response = await axios.post(
      'https://api.on-demand.io/chat/v1/sessions',
      {
        pluginIds: [], // Add any plugin IDs you need
        externalUserId: EXTERNAL_USER_ID,
      },
      {
        headers: {
          apikey: API_KEY,
        },
      }
    );
    return response.data.data.id; // Extract session ID
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error; // Rethrow to handle in the calling function
  }
}

// Function to submit query, now includes image data
async function submitQuery(sessionId, query, imageData) {
  try {
      const requestBody = {
          endpointId: 'predefined-openai-gpt4o',
          query: query,
          pluginIds: [
              'plugin-1712327325',
              'plugin-1713962163',
              'plugin-1716645826',
              'plugin-1717418141',
              'plugin-1717464304',
              'plugin-1726286736',
              'plugin-1726287427',
              'plugin-1722285968',
          ],
          responseMode: 'sync',
      };

      // Include image data if available
      if (imageData) {
          requestBody.image = imageData;
      }

      console.log('Request Body:', requestBody); // Log request body for debugging

      const response = await axios.post(
          `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
          requestBody,
          {
              headers: {
                  apikey: API_KEY,
              },
          }
      );

      if (response.data && response.data.data) {
          return response.data.data;
      } else {
          console.error('No valid response data:', response.data);
          return null;
      }
  } catch (error) {
      console.error('Error submitting query:', error);
      if (error.response) {
          console.error('Error response:', error.response.data); // Log the server response
      }
      throw error;
  }
}

// Main function to run chat
async function runChat(prompt, imageData = null) {
  try {
    const sessionId = await createChatSession(); // Create chat session
    const result = await submitQuery(sessionId, prompt, imageData); // Submit query with optional image data

    if (!result) {
      throw new Error('No response received from submitQuery');
    }
    
    console.log('Query result:', result); // Log the result
    return result; // Return the result to the caller
  } catch (error) {
    console.error('Error in runChat:', error);
    throw error; // Rethrow for further handling
  }
}

export default runChat;
