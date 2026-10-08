

import { cn } from "../../lib/utils.js"
import { ArrowUp, Mic, Paperclip, Sparkles } from "lucide-react"
import { useRef, useEffect, KeyboardEvent, useState } from "react"

interface CommandDockProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isThinking?: boolean
  disabled?: boolean
}

export function CommandDock({ 
  value, 
  onChange, 
  onSubmit, 
  isThinking = false,
  disabled = false 
}: CommandDockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSubmit()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (text && typeof text === 'string') {
        onChange(value + `\n\n[Attached File: ${file.name}]\n${text}\n`);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsRecording(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(value + (value ? ' ' : '') + transcript);
      setIsRecording(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };
  
  return (
    <div className="px-6 md:px-16 lg:px-24 pb-6 pt-4">
      <div 
        className={cn(
          "relative obsidian-glass focus-glow transition-all duration-300",
          isThinking && "racing-border"
        )}
      >
        {/* Main input container */}
        <div className="flex items-end gap-3 p-4">
          {/* Left action icons */}
          <div className="flex items-center gap-1 pb-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.js,.jsx,.ts,.tsx,.json,.md,.csv,.py" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors magnetic-hover"
              title="Add text attachment"
              aria-label="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button 
              onClick={handleVoice}
              className={cn(
                "p-2 transition-colors magnetic-hover",
                isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground"
              )}
              title="Voice input"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Command the Neural Core..."
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 bg-transparent resize-none",
              "text-[15px] text-foreground placeholder:text-muted-foreground",
              "focus:outline-none caret-foreground",
              "min-h-[24px] max-h-[200px] py-1"
            )}
          />
          
          {/* Right action icons */}
          <div className="flex items-center gap-1 pb-1">
            <button 
              className="p-2 text-muted-foreground hover:text-foreground transition-colors magnetic-hover"
              aria-label="AI suggestions"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            
            {/* Submit button */}
            <button
              onClick={onSubmit}
              disabled={!value.trim() || disabled}
              className={cn(
                "p-2 transition-all magnetic-hover",
                value.trim() && !disabled
                  ? "text-foreground bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                  : "text-muted-foreground/30"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Bottom hint */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
            Enter to send / Shift+Enter for new line
          </span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
            v2.0.1
          </span>
        </div>
      </div>
    </div>
  )
}
