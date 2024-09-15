import { createContext, useState } from "react";
import runChat from "../config/Gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 10 * index);
  };

  // Define the newChat function
  const newChat = () => {
    setLoading(false);
    setShowResults(false);
    setResultData(""); // Optionally clear previous results if desired
  };

  const onSent = async (prompt, imageBase64 = null) => {
    setResultData("");
    setLoading(true);
    setShowResults(true);
    let response;

    try {
      // If an image is provided, send it as part of the request
      if (imageBase64) {
        setRecentPrompt("Image Analysis");
        response = await runChat(`Analyze this image: ${imageBase64}`);
      } else if (prompt) {
        response = await runChat(prompt);
        setRecentPrompt(prompt);
      } else {
        setPrevPrompts((prev) => [...prev, input]);
        setRecentPrompt(input);
        response = await runChat(input);
      }

      // Handle response as before
      if (response && response.answer) {
        let responseText = response.answer;
        let responseArray = responseText.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
          if (i === 0 || i % 2 !== 1) {
            newResponse += responseArray[i];
          } else {
            newResponse += "<b>" + responseArray[i] + "</b>";
          }
        }
        let newResponse2 = newResponse.split("*").join("<br/>");
        let newResponseArray = newResponse2.split("");
        for (let i = 0; i < newResponseArray.length; i++) {
          const nextWord = newResponseArray[i];
          delayPara(i, nextWord + "");
        }
        setResultData(responseText);
      } else {
        console.error("No valid answer received from runChat");
      }
    } catch (error) {
      console.error("Error while running chat:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    input,
    setInput,
    showResults,
    loading,
    resultData,
    newChat, // Make sure newChat is included in contextValue
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
