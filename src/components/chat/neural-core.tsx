

import { useState, useCallback, useEffect } from "react"
import { ConversationStream, Message } from "./conversation-stream"
import { CommandDock } from "./command-dock"
import { LatentSidebar, Conversation } from "./latent-sidebar"
import { Layers } from "lucide-react"

import { useAuth } from "../../hooks/useAuth"
import { supabase } from "../../lib/supabase"
import { useNavigate } from "react-router-dom"
import { generateAiResponse, generateSimulatedResponse } from "../../lib/gemini.js"

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'synapse_neural_conversations';

export function NeuralCore() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [useSimulator, setUseSimulator] = useState(
    () => localStorage.getItem('synapse_use_simulator') === 'true'
  )
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const generateTimestamp = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    })
  }

  // Load conversations from localStorage first, then optionally sync from Supabase
  useEffect(() => {
    // 1. Initial load from local storage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveConversation(parsed[0]);
          setMessages(parsed[0].messages || []);
        }
      }
    } catch (e) {
      console.warn("Could not load local conversations:", e);
    }

    // 2. Background attempt to load from Supabase if connected
    if (user?.uid) {
      const syncFromSupabase = async () => {
        try {
          const { data: convs, error: convError } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', user.uid)
            .order('updated_at', { ascending: false });
            
          if (convError || !convs || convs.length === 0) return;
          
          const { data: msgs } = await supabase
            .from('ai_messages')
            .select('*')
            .order('created_at', { ascending: true });

          const loadedConversations: Conversation[] = convs.map(c => ({
            id: c.id,
            title: c.title,
            preview: c.preview || "",
            date: new Date(c.updated_at).toLocaleDateString(),
            messages: (msgs || [])
              .filter(m => m.conversation_id === c.id)
              .map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
              }))
          }));

          if (loadedConversations.length > 0) {
            setConversations(loadedConversations);
            setActiveConversation(prev => prev || loadedConversations[0]);
            setMessages(prev => prev.length > 0 ? prev : (loadedConversations[0]?.messages || []));
            localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(loadedConversations));
          }
        } catch (err) {
          // Gracefully fallback to localStorage without breaking UI
          console.debug("[NeuralCore] Supabase sync omitted:", err);
        }
      };

      syncFromSupabase();
    }
  }, [user]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation)
    setMessages(conversation.messages || [])
  }, [])
  
  const handleNewConversation = useCallback(() => {
    setActiveConversation(null)
    setMessages([])
    setSidebarOpen(false)
  }, [])
  
  const handleSubmit = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isThinking) return;

    // Immediately clear input field
    setInputValue("");

    const currentConvId = activeConversation?.id || `conv-${Date.now()}`;
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: generateTimestamp()
    };

    // Update messages in state
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    // Update conversation record
    let updatedActiveConv: Conversation;
    let updatedConversations: Conversation[];

    if (!activeConversation) {
      updatedActiveConv = {
        id: currentConvId,
        title: trimmedInput.substring(0, 32) + (trimmedInput.length > 32 ? '...' : ''),
        preview: trimmedInput.substring(0, 50),
        date: new Date().toLocaleDateString(),
        messages: currentMessages
      };
      setActiveConversation(updatedActiveConv);
      updatedConversations = [updatedActiveConv, ...conversations];
    } else {
      updatedActiveConv = {
        ...activeConversation,
        preview: trimmedInput.substring(0, 50),
        messages: currentMessages
      };
      setActiveConversation(updatedActiveConv);
      updatedConversations = conversations.map(c => 
        c.id === currentConvId ? updatedActiveConv : c
      );
    }

    setConversations(updatedConversations);
    localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(updatedConversations));

    // Optional background Supabase persist
    const userId = user?.uid || 'guest-user';
    (async () => {
      try {
        if (!activeConversation) {
          await supabase.from('ai_conversations').insert({
            id: currentConvId,
            user_id: userId,
            title: updatedActiveConv.title,
            preview: updatedActiveConv.preview
          });
        } else {
          await supabase.from('ai_conversations').update({
            updated_at: new Date().toISOString(),
            preview: updatedActiveConv.preview
          }).eq('id', currentConvId);
        }
        await supabase.from('ai_messages').insert({
          conversation_id: currentConvId,
          role: 'user',
          content: trimmedInput
        });
      } catch {
        // Silently ignore Supabase errors in background
      }
    })();

    // 1. If Simulator Mode is active, generate instant simulated intelligence
    if (useSimulator) {
      setIsThinking(true);
      await new Promise(r => setTimeout(r, 650));
      const simulatedText = generateSimulatedResponse(trimmedInput);
      const assistantMessage: Message = {
        id: `assistant-sim-${Date.now()}`,
        role: "assistant",
        content: simulatedText,
        timestamp: generateTimestamp()
      };

      const finalMessages = [...currentMessages, assistantMessage];
      setMessages(finalMessages);
      const finalizedConv = { ...updatedActiveConv, messages: finalMessages };
      setActiveConversation(finalizedConv);
      const finalizedConvs = updatedConversations.map(c => c.id === currentConvId ? finalizedConv : c);
      setConversations(finalizedConvs);
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(finalizedConvs));
      setIsThinking(false);
      return;
    }

    // 2. Check for Gemini API key
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey || !apiKey.trim()) {
      const missingKeyMessage: Message = {
        id: `assistant-key-required-${Date.now()}`,
        role: "assistant",
        content: `### ⚠️ Google Gemini API Key Required\n\nTo interact with the Live Neural Core, please configure your **Google Gemini API Key** in Settings:\n\n1. Open **Settings** (⚙️ on the left navigation bar).\n2. Scroll to **API Configuration**.\n3. Paste your Google Gemini API key and click **Save**.\n\n*Alternatively, you can switch to **Simulator Mode** using the button in the top right to test without an API key!*`,
        timestamp: generateTimestamp()
      };

      const finalMessages = [...currentMessages, missingKeyMessage];
      setMessages(finalMessages);
      const convWithWarning = { ...updatedActiveConv, messages: finalMessages };
      setActiveConversation(convWithWarning);
      const convsWithWarning = updatedConversations.map(c => c.id === currentConvId ? convWithWarning : c);
      setConversations(convsWithWarning);
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(convsWithWarning));
      return;
    }

    // 3. Call Live Gemini API
    setIsThinking(true);

    try {
      const aiResponse = await generateAiResponse(trimmedInput, apiKey, currentMessages);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse,
        timestamp: generateTimestamp()
      };

      const finalMessages = [...currentMessages, assistantMessage];
      setMessages(finalMessages);
      const finalizedConv = { ...updatedActiveConv, messages: finalMessages };
      setActiveConversation(finalizedConv);
      const finalizedConvs = updatedConversations.map(c => c.id === currentConvId ? finalizedConv : c);
      setConversations(finalizedConvs);
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(finalizedConvs));

      // Background Supabase log
      try {
        await supabase.from('ai_messages').insert({
          conversation_id: currentConvId,
          role: 'assistant',
          content: aiResponse
        });
      } catch {
        // Ignore background sync errors
      }
    } catch (err: any) {
      console.error("[NeuralCore] Gemini generation error:", err);
      const simulatedFallback = generateSimulatedResponse(trimmedInput);
      const errorContent = `${err?.message || "Failed to call Gemini API."}\n\n---\n\n${simulatedFallback}`;

      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: errorContent,
        timestamp: generateTimestamp()
      };

      const finalMessages = [...currentMessages, errorMessage];
      setMessages(finalMessages);
      const errorConv = { ...updatedActiveConv, messages: finalMessages };
      setActiveConversation(errorConv);
      const errorConvs = updatedConversations.map(c => c.id === currentConvId ? errorConv : c);
      setConversations(errorConvs);
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(errorConvs));
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, isThinking, messages, activeConversation, conversations, user, useSimulator])
  
  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-transparent text-foreground">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-foreground uppercase">
            Neural_Core
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50">
            //
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50 uppercase truncate max-w-[200px]">
            {activeConversation ? activeConversation.title : "New Conversation"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <button
            onClick={() => {
              const next = !useSimulator;
              setUseSimulator(next);
              localStorage.setItem('synapse_use_simulator', String(next));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider transition-all border ${
              useSimulator 
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20' 
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
            }`}
            title="Click to toggle between Live Gemini API and Local Neural Simulator"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${useSimulator ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            {useSimulator ? 'SIMULATOR MODE' : 'LIVE GEMINI'}
          </button>

          {/* History button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors magnetic-hover"
            aria-label="Open history sidebar"
          >
            <Layers className="w-4 h-4" />
            <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">
              History
            </span>
            {conversations.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 font-mono text-[9px]">
                {conversations.length}
              </span>
            )}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <ConversationStream 
        messages={messages} 
        isThinking={isThinking} 
      />
      
      {/* Command dock */}
      <CommandDock
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isThinking={isThinking}
        disabled={isThinking}
      />
      
      {/* History sidebar */}
      <LatentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversation?.id ?? null}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
    </div>
  )
}
