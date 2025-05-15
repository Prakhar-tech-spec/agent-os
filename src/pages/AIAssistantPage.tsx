import Header from "@/components/Header";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Send, Volume2, Copy as CopyIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const quickPrompts = [
  { label: "Property Description", value: "Generate a property description for..." },
  { label: "Email", value: "Draft an email to..." },
  { label: "Ad", value: "Write an ad for..." },
  { label: "Social Post", value: "Create a social post about..." },
  { label: "Summarize", value: "Summarize these notes: ..." },
  { label: "Rewrite", value: "Rewrite this text: ..." },
  { label: "Tool Recommendation", value: "Recommend a tool for..." },
  { label: "Real Estate Q&A", value: "Best way to describe a 2BHK in NYC" },
];

async function fetchAIResponse(message) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCWz_NH6lsaiych8Mz0adyC4_JCWg6NE-0',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      }),
    }
  );
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand.";
}

const GeminiLoading = () => (
  <div className="flex flex-col gap-2 py-8 px-4 max-w-lg w-full animate-gemini-fade-in">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-4 rounded-full animate-gemini-shimmer"
        style={{
          width: `${70 + i * 10}%`,
          minWidth: 120,
          background: 'linear-gradient(90deg, #e0e3f3 0%, #d1d6e2 40%, #e0e3f3 80%)',
        }}
      />
    ))}
  </div>
);

// Helper to get a title for a chat session
function getChatTitle(messages) {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg && firstUserMsg.content.trim()) {
    return firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
  }
  return 'Untitled Chat';
}

const AIAssistantPage = () => {
  const [selectedPrompt, setSelectedPrompt] = useState('AI Assistant');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to AI Assistant! Ask anything!" },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("default"); // 'default' or 'real-estate-qa'
  const chatEndRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterRef = useRef(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "..." }, // Loading indicator
    ]);
    setInput("");
    const aiResponse = await fetchAIResponse(msg);
    setMessages((prev) => {
      const updated = [
        ...prev.slice(0, -1), // Remove the loading indicator
        { role: "assistant", content: aiResponse },
      ];
      return updated;
    });
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 min-h-screen bg-transparent px-6 py-4">
        <Header activeTab="AI Assistant" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-left">
            AI Assistant
            <span className="text-base font-normal text-gray-500 ml-2 align-middle">(8k Chats/Month)</span>
            <span className="text-xs font-normal text-gray-400 ml-2 align-middle italic">*Powered by Gemini 2.0 flash</span>
          </h1>
          <p className="text-gray-500 text-left">Generate property descriptions, emails, ads, posts, summarize notes, get tool recommendations, or ask real estate questions.</p>
          <p className="text-xs text-yellow-600 font-semibold mt-1">Chats are not saved here. Refreshing or switching tabs will clear your chat, so copy anything important.</p>
        </div>
        <div className="w-full mx-auto bg-[#e1e0e6] rounded-[2.5rem] p-4 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-start w-full h-full overflow-hidden">
            {/* Sidebar with quick prompts */}
            <div className="md:w-1/3 w-full flex-shrink-0 h-[60vh]">
              <Card className="p-4 bg-white rounded-2xl shadow-md h-full flex flex-col justify-between">
                <div className="font-semibold text-gray-700 mb-2">Quick Prompts</div>
                <div className="flex flex-col gap-3">
                  {quickPrompts.filter(p => p.label !== 'Tool Recommendation').map((p) => (
                    <button
                      key={p.label}
                      className="text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-700 transition"
                      onClick={() => {
                        setSelectedPrompt(p.label);
                        setInput(p.value);
                        if (p.label === 'Real Estate Q&A') {
                          setMode('real-estate-qa');
                          setInput("");
                        } else {
                          setMode('default');
                        }
                        setMessages([
                          { role: "assistant", content: `Welcome to ${p.label}! Ask anything!` }
                        ]);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 w-full">
                  {quickPrompts.filter(p => p.label === 'Tool Recommendation').map((p) => (
                    <button
                      key={p.label}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-700 transition text-left"
                      onClick={() => {
                        setSelectedPrompt(p.label);
                        setInput(p.value);
                        setMode('default');
                        setMessages([
                          { role: "assistant", content: `Welcome to ${p.label}! Ask anything!` }
                        ]);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            {/* Chat area */}
            <div className="flex-1 flex flex-col h-[60vh] w-full bg-white rounded-2xl shadow-md p-4 overflow-auto">
              <div className="flex-1 overflow-y-auto pr-2 mb-4 w-full">
                {messages.map((msg, i) => {
                  // Special style for the very first assistant welcome message
                  const isWelcome = i === 0 && msg.role === "assistant";
                  const isLoading = msg.role === "assistant" && msg.content === "...";
                  return (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2 w-full`}
                    >
                      {isLoading ? (
                        <GeminiLoading />
                      ) : (
                        <div
                          className={`px-5 py-3 text-base font-medium relative mt-2 ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg ml-auto max-w-[60%] text-left"
                              : isWelcome
                                ? "text-gray-800 mr-auto max-w-md"
                                : "text-gray-800 mr-auto w-full"
                          }`}
                          style={msg.role === "user"
                            ? { boxSizing: 'border-box', wordBreak: 'break-word' }
                            : isWelcome
                              ? { boxSizing: 'border-box', width: 'auto' }
                              : { boxSizing: 'border-box', width: '100%' }
                          }
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({node, ...props}) => (
                                <div className="w-full my-2">
                                  <div className="overflow-x-auto w-full">
                                    <table className="w-full border border-gray-300 rounded-xl overflow-hidden bg-white">
                                      {props.children}
                                    </table>
                                  </div>
                                </div>
                              ),
                              thead: ({node, ...props}) => (
                                <thead className="bg-gray-100 text-gray-700 text-left text-sm font-semibold">
                                  {props.children}
                                </thead>
                              ),
                              tbody: ({node, ...props}) => (
                                <tbody className="divide-y divide-gray-200">
                                  {props.children}
                                </tbody>
                              ),
                              tr: ({node, ...props}) => (
                                <tr className="hover:bg-blue-50 transition-colors">
                                  {props.children}
                                </tr>
                              ),
                              th: ({node, ...props}) => (
                                <th className="px-4 py-2 border-b border-gray-200 font-medium text-sm text-gray-700">
                                  {props.children}
                                </th>
                              ),
                              td: ({node, ...props}) => (
                                <td className="px-4 py-2 border-b border-gray-100 text-sm text-gray-600">
                                  {props.children}
                                </td>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {/* Read Aloud and Copy options for assistant messages - strictly after the output, centered */}
                          {msg.role === "assistant" && msg.content && !(isWelcome) && (
                            <div className="flex justify-center gap-4 mt-4">
                              <button
                                title="Read Aloud"
                                className="p-1 rounded-full hover:bg-blue-100 transition"
                                onClick={() => {
                                  if ('speechSynthesis' in window) {
                                    if (window.speechSynthesis.speaking) {
                                      window.speechSynthesis.cancel();
                                      setIsSpeaking(false);
                                    } else {
                                      const utter = new window.SpeechSynthesisUtterance(msg.content.replace(/\n/g, ' '));
                                      utter.lang = 'en-US';
                                      utter.onend = () => setIsSpeaking(false);
                                      utter.onerror = () => setIsSpeaking(false);
                                      utterRef.current = utter;
                                      setIsSpeaking(true);
                                      window.speechSynthesis.speak(utter);
                                    }
                                  }
                                }}
                              >
                                <Volume2 size={18} className={isSpeaking ? "text-blue-500" : "text-gray-500"} />
                              </button>
                              <button
                                title="Copy"
                                className="p-1 rounded-full hover:bg-blue-100 transition"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(msg.content);
                                    showToast('success', 'Copied');
                                  } catch (e) {
                                    // fallback for older browsers
                                    try {
                                      const textarea = document.createElement('textarea');
                                      textarea.value = msg.content;
                                      document.body.appendChild(textarea);
                                      textarea.select();
                                      document.execCommand('copy');
                                      document.body.removeChild(textarea);
                                      showToast('success', 'Copied');
                                    } catch {
                                      showToast('error', 'Copy Failed');
                                    }
                                  }
                                }}
                              >
                                <CopyIcon size={18} className="text-gray-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form
                className="flex items-center gap-2 mt-auto"
                onSubmit={e => {
                  e.preventDefault();
                  sendMessage(input);
                }}
              >
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={mode === 'real-estate-qa' ? 'Ask anything about real estate...' : 'Type your message...'}
                  className="flex-1 bg-gray-50"
                  autoFocus
                />
                <Button type="submit" className="rounded-full px-4 py-2" disabled={!input.trim()}>
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
        {/* Toast notification for copy */}
        {toast && (
          <div
            className={`fixed bottom-6 left-6 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300
              ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
              animate-fade-in-out
            `}
            style={{ minWidth: 90, pointerEvents: 'none', opacity: toast ? 1 : 0 }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;