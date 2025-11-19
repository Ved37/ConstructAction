import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { askQa } from "../lib/api";

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      content:
        "Hello! I'm your construction project copilot. I can help you find information across all your project data sources. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const currentProjectId = 1; // Default project
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        alert(
          "Speech recognition not supported in this browser. Try Chrome or Edge."
        );
      }
    } else {
      alert(
        "Speech recognition not supported in this browser. Try Chrome or Edge."
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // NEW: Handle new chat
  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        role: "ai",
        content:
          "Hello! I'm your construction project copilot. I can help you find information across all your project data sources. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
    setInputText("");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const question = inputText.trim();
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await askQa(question);

      const hasAnswer =
        response.answer !== null &&
        typeof response.answer === "string" &&
        response.answer.trim() !== "";
      const aiMessage = {
        id: Date.now() + 1,
        role: "ai",
        content: hasAnswer
          ? response.answer
          : "I couldn't find a confident answer, but here are relevant snippets.",
        timestamp: new Date(),
        // Map score to confidence (existing UI expects fraction 0-1)
        confidence: typeof response.score === "number" ? response.score : null,
        // Provide retrieved chunks separately
        retrieved: Array.isArray(response.retrieved) ? response.retrieved : [],
        source: response.source || null,
        page_number: response.page_number || null,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("QA ask error", error);
      const friendly = error.userMessage || "Unexpected error. Try again.";
      const errorMessage = {
        id: Date.now() + 1,
        role: "ai",
        content: friendly,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar onNewChat={handleNewChat} currentProjectId={currentProjectId} />

      {/* Main Chat Section - Fixed positioning */}
      <div className="flex-1 flex flex-col bg-gray-50 ml-80">
        {" "}
        {/* Added ml-80 to account for sidebar */}
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <h1 className="text-xl font-semibold text-gray-800">Project Chat</h1>
          <p className="text-sm text-gray-600">
            Ask questions about your construction documents
          </p>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.role === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
                  message.role === "user" ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                {message.role === "user" ? "You" : "AI"}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-2xl p-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>

                {/* Metadata (AI only) */}
                {message.role === "ai" &&
                  (message.confidence || message.source) && (
                    <div className="mt-3 pt-3 border-t border-opacity-20">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {typeof message.confidence === "number" && (
                          <span className="px-2 py-1 rounded bg-green-50 text-green-600 border border-green-100">
                            Confidence: {(message.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                        {message.source && (
                          <span className="px-2 py-1 rounded bg-purple-50 text-purple-600 border border-purple-100">
                            Source: {message.source}
                            {message.page_number !== null &&
                              message.page_number !== undefined && (
                                <span className="ml-1">
                                  (p. {message.page_number})
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* References */}
                {message.retrieved && message.retrieved.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-opacity-20">
                    <p className="text-xs font-medium mb-2 opacity-80">
                      Retrieved snippets:
                    </p>
                    <div className="space-y-2">
                      {message.retrieved.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-2 rounded bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          <div className="font-semibold flex flex-wrap gap-2">
                            {chunk.source && <span>📄 {chunk.source}</span>}
                            {typeof chunk.page_number === "number" && (
                              <span className="opacity-70">
                                p. {chunk.page_number}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 leading-relaxed whitespace-pre-wrap">
                            {chunk.snippet}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                AI
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-3xl">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        {/* Chat Input (fixed at bottom) */}
        <div className="border-t bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your construction documents or use voice..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                  rows={1}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Voice Button */}
                <button
                  onClick={toggleListening}
                  disabled={
                    isLoading ||
                    !(
                      "webkitSpeechRecognition" in window ||
                      "SpeechRecognition" in window
                    )
                  }
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-green-500 hover:bg-green-600"
                  } ${
                    !(
                      "webkitSpeechRecognition" in window ||
                      "SpeechRecognition" in window
                    ) || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : ""
                  } text-white`}
                  title={
                    !(
                      "webkitSpeechRecognition" in window ||
                      "SpeechRecognition" in window
                    )
                      ? "Voice input not supported in this browser"
                      : isListening
                      ? "Stop listening"
                      : "Start voice input"
                  }
                >
                  {isListening ? (
                    // Stop icon
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      />
                    </svg>
                  ) : (
                    // Microphone icon
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  )}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                >
                  <span>{isLoading ? "Sending..." : "Send"}</span>
                  {!isLoading && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Voice status indicator */}
            {isListening && (
              <div className="text-center mt-3">
                <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span>Listening... Speak now</span>
                </div>
              </div>
            )}

            {/* Browser support message */}
            {!(
              "webkitSpeechRecognition" in window ||
              "SpeechRecognition" in window
            ) && (
              <div className="text-center mt-2 text-xs text-gray-500">
                🎤 Voice input works best in Chrome, Edge, or Safari
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
