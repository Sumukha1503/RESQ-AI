import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { sendChatMessage, testConnection } from "../../services/api";
import { toast } from "sonner";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm the ResQ AI assistant. How can I help you rescue food today? 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'

  // Test connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log('Testing API connection...');
      const result = await testConnection();
      if (result.success) {
        console.log('✅ API Connected:', result.message);
        setConnectionStatus('connected');
      } else {
        console.error('❌ API Connection Failed:', result.error);
        setConnectionStatus('disconnected');
        toast.error('Backend server is offline. Please start the backend server.');
      }
    };
    checkConnection();
  }, []);

  const predefinedQuestions = [
    "How does ResQ AI work?",
    "What can I do as a donor?",
    "How do I claim food donations?",
    "What are the user roles?",
    "Tell me about the dashboard features",
  ];

  const handleSend = async (questionText = null) => {
    const question = questionText || input;
    if (!question.trim()) return;

    // Check connection status first
    if (connectionStatus === 'disconnected') {
      toast.error('Cannot send message - backend server is offline');
      return;
    }

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput(""); // Only clear if user typed
    setIsLoading(true);

    try {
      console.log('Sending question:', question);
      const response = await sendChatMessage(question);
      console.log('Received response:', response);

      let assistantMessage;

      // Check if this is a JSON response
      if (response.isJsonResponse) {
        // Parse and format JSON response
        try {
          const jsonData = JSON.parse(response.response);

          // Format based on response type
          if (jsonData.verdict) {
            // Fraud detection response
            const color = jsonData.verdict === 'safe' ? 'text-green-600' :
              jsonData.verdict === 'suspicious' ? 'text-orange-600' : 'text-red-600';

            assistantMessage = {
              role: "assistant",
              content: `🛡️ **Fraud Detection Result**

**Verdict**: ${jsonData.verdict.charAt(0).toUpperCase() + jsonData.verdict.slice(1)}
**Confidence**: ${jsonData.confidence}%
**Reason**: ${jsonData.reason}

"Saving one meal means saving one story."`,
              isFormatted: true
            };
          } else if (jsonData.forecast) {
            // Predictive insights response
            const impactColor = jsonData.impact_level === 'high' ? 'text-red-600' :
              jsonData.impact_level === 'medium' ? 'text-orange-600' : 'text-green-600';

            assistantMessage = {
              role: "assistant",
              content: `🔮 **Predictive Insights**

**Forecast**: ${jsonData.forecast}
**Impact Level**: ${jsonData.impact_level.charAt(0).toUpperCase() + jsonData.impact_level.slice(1)}
**Suggestion**: ${jsonData.suggestion}

"Every saved kilogram of food nourishes a soul."`,
              isFormatted: true
            };
          } else {
            // Generic JSON response
            assistantMessage = {
              role: "assistant",
              content: `\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``
            };
          }
        } catch (parseError) {
          // If JSON parsing fails, show raw response
          assistantMessage = { role: "assistant", content: response.response };
        }
      } else {
        // Regular text response
        assistantMessage = { role: "assistant", content: response.response };
      }

      setMessages((prev) => [...prev, assistantMessage]);

      // Update connection status to connected on success
      if (connectionStatus !== 'connected') {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Chatbot error:', error);

      let errorMsg = "I apologize, but I'm having trouble connecting right now. ";

      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMsg = "Please log in to use the chatbot.";
          toast.error("Authentication required");
        } else if (error.response.status === 500) {
          errorMsg = "The AI service is experiencing issues. Please try again later.";
          toast.error("Server error");
        } else {
          errorMsg = error.response.data?.message || errorMsg + "Please try again.";
          toast.error("Failed to get response");
        }
      } else if (error.request) {
        // Request made but no response
        errorMsg = "Cannot connect to the server. Please ensure the backend is running on http://localhost:5001";
        toast.error("Connection failed - Backend server may be offline");
        setConnectionStatus('disconnected');
      } else {
        // Other errors
        errorMsg = "An unexpected error occurred. Please try again.";
        toast.error("Something went wrong");
      }

      const errorMessage = { role: "assistant", content: errorMsg };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent onClose={() => setIsOpen(false)}>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>⚡ ResQ AI Assistant</span>
              <div className="flex items-center gap-2 text-xs">
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Connected</span>
                  </>
                )}
                {connectionStatus === 'disconnected' && (
                  <>
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Offline</span>
                  </>
                )}
                {connectionStatus === 'checking' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                    <span className="text-yellow-500">Connecting...</span>
                  </>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-8rem)] mt-6">
            {/* Predefined Questions */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSend(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}