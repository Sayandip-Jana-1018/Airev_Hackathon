import imageCompression from "browser-image-compression";
import { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResults,
    loading,
    resultData,
    setInput,
    input,
    setResultData,
  } = useContext(Context);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  
  const iframeRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800 };
        const compressedFile = await imageCompression(file, options);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          setUploadedImage(base64Image);
          await onSent(null, base64Image);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image: ", error);
        alert("Failed to upload image. Please try a different one.");
      }
    } else {
      alert("Please upload a valid JPG or PNG image.");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!uploadedImage) {
        onSent(input);  // Send the input
        setInput("");    // Reset the input field
      }
    }
  };

  const handleCardClick = (promptText) => {
    setInput(promptText);
  };

  const toggleIframe = () => {
    setShowIframe(!showIframe);
  };

  const handleClickOutside = (event) => {
    if (iframeRef.current && !iframeRef.current.contains(event.target)) {
      setShowIframe(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
      try {
        const decodedQuery = decodeURIComponent(query);
        setInput(decodedQuery);
      } catch (error) {
        console.error("Error decoding URI component: ", error);
        alert("Invalid query parameter in URL."); // Inform the user
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="main">
      <div className="nav">
        <p>Hygieia - AI Assistant</p>
        <img src={assets.user} alt="User Avatar" />
      </div>
      <div className="main-container">
        {!showResults ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Sayandip</span>
              </p>
              <p>How Can I Help You Today?</p>
            </div>
            <div className="cards">
              <div className="card" onClick={() => handleCardClick("What is Ayurveda?")}>
                <p>What is Ayurveda?</p>
                <img src={assets.compass_icon} alt="Ayurveda" />
              </div>
              <div className="card" onClick={() => handleCardClick("Symptoms of Covid-19")}>
                <p>Symptoms of Covid-19</p>
                <img src={assets.message_icon} alt="Covid Symptoms" />
              </div>
              <div className="card" onClick={() => handleCardClick("How to Create a Gyroscope using Disc?")}>
                <p>How to Create a Gyroscope using Disc?</p>
                <img src={assets.bulb_icon} alt="Gyroscope" />
              </div>
              <div className="card" onClick={() => handleCardClick("Detail about a healthy lifestyle")}>
                <p>Detail about a healthy lifestyle</p>
                <img src={assets.code_icon} alt="Healthy Lifestyle" />
              </div>
            </div>
          </>
        ) : (
          <div className="result">
            <div className="result-title">
              <img src={assets.user} alt="User Avatar" />
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              {uploadedImage && (
                <div className="uploaded-image-preview">
                  <img src={uploadedImage} alt="Uploaded Preview" />
                </div>
              )}
              <img src={assets.gemini_icon} alt="Gemini Icon" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
              )}
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <input
              onChange={(e) => {
                setInput(e.target.value);
              }}
              value={input}
              type="text"
              placeholder="Enter the Prompt Here"
              onKeyPress={handleKeyPress}
            />
            <div>
              <label htmlFor="image-upload">
                <img src={assets.gallery_icon} alt="Upload Image" onClick={toggleIframe} />
              </label>
              {/* <input
                id="image-upload"
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              /> */}
              <img src={assets.mic_icon} alt="Voice Input" />
              <img
                src={assets.send_icon}
                alt="Send"
                onClick={() => {
                  if (!uploadedImage) {
                    onSent(input);  // Send the input
                    setInput("");    // Reset the input field
                  }
                }}
              />
            </div>
          </div>

          <div className="bottom-info">
            <p>
              Hygieia may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>

        {showIframe && (
          <div className="iframe-container" ref={iframeRef}>
            <iframe
              src="http://localhost:8502"
              title="Embedded App"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
