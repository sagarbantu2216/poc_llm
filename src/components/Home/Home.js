import React, { useState, useEffect, useRef } from "react";
import Loader from "../Loader/Loader";
import "../Loader/Loader.css";
import Modal from "../Modal/Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png"; // Adjust the import based on your project structure
import { Ask, BaseURL, GetFileContent, Upload, Analyze } from "../../Network/Endpoints";
import { doSignOut } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [activeTab, setActiveTab] = useState("chat"); // Active tab state
  const [summarizationResponse, setSummarizationResponse] = useState(null);
  const [chronologicalResponse, setChronologicalResponse] = useState(null);
  const [deduplicationResponse, setDeduplicationResponse] = useState(null);
  const [nlpResponse, setnlpResponse] = useState(null);
  const messagesEndRef = useRef(null);
  const [fileContent, setFileContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploadedFiles, setLocalUploadedFiles] = useState([]);
  const [doc, setdoc] = useState();

  const navigate = useNavigate();

  const predefinedQuestions = [
    { key: "deduplication", label: "Analyze Regulations" },
    { key: "chronological_order", label: "Chronological Order" },
    { key: "summarization", label: "Generate Product Update" },
    { key: "nlp", label: "NLP" },
  ];

  // const showAlert = () => {
  //   toast.error("Please upload a file first!", {
  //     className: "toastify",
  //   });
  // };

  // const handlelogout = () => {
  //   doSignOut().then(() => { navigate('/') }) }
  // };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    // Prepare form data to send with the files
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true); // Start loading
      const response = await fetch(`${Upload}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      console.log("Files uploaded successfully:", data);

      // Update the state with the uploaded files
      setLocalUploadedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(files),
      ]);

      // Show success toast notification
      toast.success("File uploaded successfully!", {
        className: "toastify",
      });

      // Handle success or update UI accordingly
      setLoading(false); // Stop loading
    } catch (error) {
      console.error("Error uploading files:", error.message);
      // Handle error or show error message to user
      toast.error("Error uploading files!", {
        className: "toastify",
      });
      setLoading(false); // Stop loading
    }
  };

  const sendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "query", text: inputValue, source: "user" },
      ]);
      fetchResponse(inputValue, "user");
      setInputValue("");
    }
  };

  const fetchResponse = async (question, source) => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(`${Ask}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: question }), // Wrap question in an object with key 'query'
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const answer = data.response; // Use 'answer' from the response JSON

      // Process and format the response
      const formattedMessage = formatResponse(answer);

      // Add the formatted message to the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "answer", text: formattedMessage, source },
      ]);
      setLoading(false); // Stop loading
    } catch (error) {
      console.error("Error fetching response:", error);
      setLoading(false); // Stop loading
    }
  };

  const fetchPredefinedResponse = async (endpoint, setter) => {
    setLoading(true); // Start loading
    if (endpoint === "summarize") {
      try {
        const response = await fetch(GetFileContent, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();

        const answer = response.data.summary.answer
        const formattedMessage = formatResponse(answer);
        setter(formattedMessage);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching response:", error);
        setLoading(false); // Stop loading
      }
    } else if (endpoint === "deduplicate") {
      try {
        const response = await fetch(Analyze, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();

        const answer = response.data.summary.answer
        const formattedMessage = formatResponse(answer);
        setter(formattedMessage);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching response:", error);
        setLoading(false); // Stop loading
      }
    }
     else if (endpoint === "chronological_order") {
      try {
        const response = await fetch(`${BaseURL}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();

        const renderResponses = () => {
          const result = data.result;

          return Object.entries(result).map(([key, value], index) => {
            const { answer, source_document } = value;
            if (!answer) return null; // Skip items without an answer

            const formattedAnswer = answer
              .split("\n")
              .map((line, lineIndex) => (
                <div
                  key={`${index}-${lineIndex}`}
                  style={{ marginBottom: "5px" }}
                >
                  {line}
                </div>
              ));

            return (
              <div key={index} className="response-line">
                <strong>{key}</strong>
                <div>{formattedAnswer}</div>
                {source_document && (
                  <a
                    href="#"
                    className="link-button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDocumentClick(source_document);
                    }}
                    style={{
                      marginTop: "10px",
                      display: "block",
                      color: "blue",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    View Source Document
                  </a>
                )}
              </div>
            );
          });
        };

        setChronologicalResponse(renderResponses);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching response:", error);
        setLoading(false); // Stop loading
      }
    } else if (endpoint === "nlp") {
      try {
        const response = await fetch(`${BaseURL}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: "none" }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();

        setnlpResponse(data.response);
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching response:", error);
        setLoading(false); // Stop loading
      }
    }
  };
  

  const handleDocumentClick = async (source) => {
    console.log("Document clicked:", source);
    const filename = source.split("/").pop();
    try {
      const filedata = await fetch(`${GetFileContent}${filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!filedata.ok) {
        throw new Error("Failed to fetch file content");
      }
      const data = await filedata.json();
      setdoc(source);
      const formatttedtext = formatResponse(data.text);
      setFileContent(formatttedtext);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
    if (key === "summarization") {
      fetchPredefinedResponse("summarize", setSummarizationResponse);
    } else if (key === "chronological_order") {
      fetchPredefinedResponse("chronological_order", setChronologicalResponse);
    } else if (key === "deduplication") {
      fetchPredefinedResponse("deduplicate", setDeduplicationResponse);
    } else if (key === "nlp") {
      fetchPredefinedResponse("nlp", setnlpResponse);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatResponse = (response) => {
    // Split the response into lines
    const lines = response.split("\n");
    const formattedLines = lines.map((line, index) => {
      return <p key={index}>{line.trim()}</p>;
    });

    return <div className="response">{formattedLines}</div>;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-800 text-white flex flex-col items-center p-4">
        <img src={logo} alt="logo" className="mb-4" />
        <h2 className="mb-4">AI Assistant</h2>
        <h2 className="mb-4">Please Upload only (pdf and txt)</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          multiple
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer mb-4"
        >
          Upload Files
        </label>
        <div className="flex flex-col space-y-2 overflow-y-auto">
          {uploadedFiles.length > 0 && (
            <>
              <h3 className="mb-2">Uploaded Files:</h3>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded">
                  {file.name}
                </div>
              ))}
            </>
          )}
        </div>
        <button
          className="mt-auto bg-red-500 text-white py-2 px-4 rounded"
          onClick={() => {
            doSignOut().then(() => {
              navigate("/");
            });
          }}
        >
          Logout
        </button>
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="bg-gray-200 p-4 flex justify-between">
          <div className="flex space-x-4">
            <button
              className={`tab ${
                activeTab === "chat" ? "bg-blue-500 text-white" : "bg-gray-300"
              } py-2 px-4 rounded`}
              onClick={() => handleTabClick("chat")}
              disabled={uploadedFiles.length === 0}
            >
              Chat with Documents
            </button>
            {predefinedQuestions.map(({ key, label }) => (
              <button
                key={key}
                className={`tab ${
                  activeTab === key ? "bg-blue-500 text-white" : "bg-gray-300"
                } py-2 px-4 rounded`}
                onClick={() => handleTabClick(key)}
                disabled={uploadedFiles.length === 0}
              >
                {label}
              </button>
            ))}
          </div>
          <ToastContainer toastClassName="toastify" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {loading && <Loader />} {/* Show loader when loading */}
          {activeTab === "chat" && (
            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="chat-lines">
                  {message.type === "query" && message.source === "user" && (
                    <div className="bg-blue-100 p-2 rounded">
                      {message.text}
                    </div>
                  )}
                  {message.type === "answer" && (
                    <div className="bg-green-100 p-2 rounded">
                      {message.text}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {activeTab === "summarization" && summarizationResponse}
          {activeTab === "chronological_order" && chronologicalResponse}
          {activeTab === "deduplication" && deduplicationResponse}
          {activeTab === "nlp" && nlpResponse && (
        <div>
          <h2>NLP Response</h2>
          <pre>{JSON.stringify(nlpResponse, null, 2)}</pre>
        </div>
      )}


        </div>
        {showModal && (
          <Modal content={fileContent} onClose={closeModal} filename={doc} />
        )}
        {activeTab === "chat" && (
          <div className="p-4 bg-gray-200">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 p-2 rounded border border-gray-300"
                placeholder="Type your question here. Press Enter to send."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
              >
                <span>&#9654;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
