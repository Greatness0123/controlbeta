import React, { useState, useEffect, useRef } from 'react';

interface Action {
  text: string;
  duration: number;
}

interface Timings {
  typingInput: number;
  sendingDelay: number;
  aiResponse?: number;
  finalMessage?: number;
}

interface WorkflowStep {
  user: string;
  ai?: string;
  actions?: Action[];
  file: string | null;
  timings: Timings;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  file: string | null;
  immediate: boolean;
  isAction: boolean;
  isLoading: boolean;
  actionId: string | null;
  visible: boolean;
}

interface AIAssistantProps {
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className = "" }) => {
  const [currentMode, setCurrentMode] = useState<'ask' | 'act'>('ask');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Refs for stable state access in timeouts
  const currentStepRef = useRef(0);
  const currentModeRef = useRef<'ask' | 'act'>('ask');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [statusText, setStatusText] = useState('Ready to assist');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  // Ask mode workflow
  const askWorkflow: WorkflowStep[] = [
    {
      user: "Can you work with my custom CAD software on Linux?",
      ai: "Yes. I see the screen exactly as you do. I can drive any software interface—whether it's Photoshop on Mac, a terminal on Ubuntu, or custom legacy apps on Windows. No APIs or servers required.",
      file: null,
      timings: { typingInput: 1800, sendingDelay: 600, aiResponse: 3000 }
    },
    {
      user: "Summarize this 50-page rental agreement for me",
      ai: "I've analyzed the lease. Key points:\n\n1. Rent is $2,400/mo, due on the 1st.\n2. No pets allowed without prior approval.\n3. Security deposit is one month's rent.\n\n⚠️ Clause 14.2 is unusual: it requires professional carpet cleaning every 6 months. Want me to flag this?",
      file: "rental_lease_final.pdf",
      timings: { typingInput: 2000, sendingDelay: 800, aiResponse: 3500 }
    },
    {
      user: "Debug this circular dependency error",
      ai: "I see the issue in `auth-provider.tsx`. You're invalidating the context inside its own consumer. I can refactor this to use a separate `useSession` hook to break the cycle. Shall I apply the fix?",
      file: "auth-provider.tsx",
      timings: { typingInput: 1600, sendingDelay: 800, aiResponse: 3200 }
    },
    {
      user: "Find that invoice from 'Acme Corp' I saved last month",
      ai: "Found it. `Invoice_Acme_Oct24.pdf` was in your Downloads folder. I also found a duplicate in Documents/Financials. Would you like me to open the one in Documents?",
      file: null,
      timings: { typingInput: 1800, sendingDelay: 600, aiResponse: 2500 }
    }
  ];

  // Act mode workflow
  const actWorkflow: WorkflowStep[] = [
    {
      user: "Deploy the latest build to the staging server",
      actions: [
        { text: "Opening Terminal (Ubuntu)...", duration: 1000 },
        { text: "SSHing into user@192.168.1.55...", duration: 1500 },
        { text: "Pulling latest docker images...", duration: 2200 },
        { text: "Restarting NGINX service...", duration: 1200 },
        { text: "Verifying endpoint health check...", duration: 1400 },
        { text: "Deployment successful. Closing connection.", duration: 1000 }
      ],
      file: null,
      timings: { typingInput: 2000, sendingDelay: 600, finalMessage: 1200 }
    },
    {
      user: "Export Q3 reports from 'OldBooks 95' legacy app",
      actions: [
        { text: "Launching 'OldBooks 95'...", duration: 1500 },
        { text: "Navigating archaic menu structure...", duration: 1800 },
        { text: "Locating 'Reports' > 'Quarterly'...", duration: 1200 },
        { text: "Setting date range: July 1 - Sept 30...", duration: 1500 },
        { text: "Clicking tiny 'Export CSV' button...", duration: 1000 },
        { text: "Handling 'Out of Memory' popup...", duration: 1200 },
        { text: "Retrying export...", duration: 1000 },
        { text: "Success. Saved to Desktop.", duration: 800 }
      ],
      file: null,
      timings: { typingInput: 2400, sendingDelay: 800, finalMessage: 1500 }
    },
    {
      user: "Organize my messy Desktop into folders by file type",
      actions: [
        { text: "Scanning Desktop items...", duration: 1200 },
        { text: "Identified 43 images, 12 documents, 5 installers...", duration: 1500 },
        { text: "Creating folder: 'Desktop/Images'...", duration: 1000 },
        { text: "Moving 43 .png and .jpg files...", duration: 2200 },
        { text: "Creating folder: 'Desktop/Docs'...", duration: 1000 },
        { text: "Moving 12 .pdf and .docx files...", duration: 1400 },
        { text: "Cleaning up remaining shortcuts...", duration: 1100 }
      ],
      file: null,
      timings: { typingInput: 2500, sendingDelay: 600, finalMessage: 1200 }
    },
    {
      user: "Cancel my 'TooExpensive' subscription",
      actions: [
        { text: "Navigating to service settings...", duration: 1800 },
        { text: "Locating 'Billing' tab...", duration: 1200 },
        { text: "Clicking 'Cancel Subscription'...", duration: 1000 },
        { text: "Selecting reason: 'Too expensive'...", duration: 1100 },
        { text: "Confirming cancellation...", duration: 1200 },
        { text: "Saving cancellation receipt...", duration: 1400 }
      ],
      file: null,
      timings: { typingInput: 2000, sendingDelay: 600, finalMessage: 1200 }
    }
  ];

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  // Add message
  const addMessage = (text: string, sender: 'user' | 'ai', file: string | null = null, immediate = false, isAction = false, isLoading = false, actionId: string | null = null) => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      text,
      sender,
      file,
      immediate,
      isAction,
      isLoading,
      actionId,
      visible: immediate,
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      if (updated.length > 5) return updated.slice(updated.length - 5);
      return updated;
    });

    if (!immediate) {
      setTimeout(() => {
        setMessages(msgs => msgs.map(m =>
          m.id === newMessage.id ? { ...m, visible: true } : m
        ));
      }, 50);
    }

    return newMessage.id;
  };

  // Update action to completed
  const completeAction = (actionId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.actionId === actionId ? { ...msg, isLoading: false } : msg
    ));
  };

  // Simulate typing in input
  const simulateTypingInInput = (step: WorkflowStep) => {
    const message = step.user;
    const typingSpeed = Math.max(20, step.timings.typingInput / message.length);
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < message.length) {
        setInputValue(message.substring(0, charIndex + 1));
        charIndex++;
        const id = setTimeout(typeChar, typingSpeed);
        timeoutIdsRef.current.push(id);
      } else {
        const id = setTimeout(() => {
          setInputValue('');
          processUserMessage(step);
        }, step.timings.sendingDelay);
        timeoutIdsRef.current.push(id);
      }
    };

    typeChar();
  };

  // Simulate AI typing
  const simulateTyping = (text: string, sender: 'user' | 'ai', callback?: () => void) => {
    const words = text.split(' ');
    let wordIndex = 0;
    let currentText = '';

    const messageId = addMessage('', sender);

    const typeWord = () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, text: currentText + '...' } : msg
        ));
        wordIndex++;
        const id = setTimeout(typeWord, 80);
        timeoutIdsRef.current.push(id);
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, text: currentText } : msg
        ));
        if (callback) callback();
      }
    };

    typeWord();
  };

  // Simulate action sequence
  const simulateActionSequence = (actions: Action[], callback?: () => void) => {
    let index = 0;

    const displayNextAction = () => {
      if (index < actions.length) {
        const action = actions[index];
        const actionId = 'action-' + Date.now() + Math.random();
        addMessage(action.text, 'ai', null, false, true, true, actionId);

        const convertId = setTimeout(() => {
          completeAction(actionId);
          index++;
          const nextId = setTimeout(displayNextAction, 300);
          timeoutIdsRef.current.push(nextId);
        }, action.duration);
        timeoutIdsRef.current.push(convertId);
      } else {
        if (callback) callback();
      }
    };

    displayNextAction();
  };

  // Process user message
  const processUserMessage = (step: WorkflowStep) => {
    addMessage(step.user, 'user', step.file);

    const nextStep = () => {
      // Use ref for mode to ensure freshness
      // Using askWorkflow for Act as requested
      const workflow = currentModeRef.current === 'ask' ? askWorkflow : actWorkflow;
      currentStepRef.current = (currentStepRef.current + 1) % workflow.length;

      const nextId = setTimeout(() => {
        setIsProcessing(false);
        startWorkflow();
      }, 2000);
      timeoutIdsRef.current.push(nextId);
    };

    if (currentModeRef.current === 'ask') {
      const id = setTimeout(() => {
        if (step.ai) {
          simulateTyping(step.ai, 'ai', nextStep);
        } else {
          nextStep();
        }
      }, step.timings.aiResponse || 2000);
      timeoutIdsRef.current.push(id);
    } else {
      const id = setTimeout(() => {
        if (step.actions) {
          simulateActionSequence(step.actions, () => {
            const finalId = setTimeout(() => {
              simulateTyping("All actions completed successfully!", 'ai', nextStep);
            }, step.timings.finalMessage || 1000);
            timeoutIdsRef.current.push(finalId);
          });
        } else {
          nextStep();
        }
      }, step.timings.sendingDelay);
      timeoutIdsRef.current.push(id);
    }
  };

  // Start workflow
  const startWorkflow = () => {
    // Check ref for currentMode
    setIsProcessing(true);
    // User requested "act toggle shows the data for the ask" - so we use askWorkflow for both or just use askWorkflow
    const workflow = currentModeRef.current === 'ask' ? askWorkflow : actWorkflow; // Using askWorkflow for Act as requested

    // Ensure we have a valid step, fallback to 0 if needed (safe guarding against bounds)
    if (currentStepRef.current >= workflow.length) currentStepRef.current = 0;

    const step = workflow[currentStepRef.current];
    if (step) {
      simulateTypingInInput(step);
    }
  };

  // Scroll logic: Use scrollTop on container instead of scrollIntoView on window
  useEffect(() => {
    if (messagesContainerRef.current && !isHovering) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      // Use requestAnimationFrame + instant scroll to avoid continuous smooth animations which can cause jank
      requestAnimationFrame(() => {
        messagesContainerRef.current!.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'auto'
        });
      });
    }
  }, [messages, isHovering]);

  // Handle mode change
  const handleModeChange = (mode: 'ask' | 'act') => {
    clearAllTimeouts();
    setMessages([]);
    setInputValue('');

    setCurrentMode(mode);
    currentModeRef.current = mode; // Update ref

    currentStepRef.current = 0;
    setIsProcessing(false);
    setStatusText(`Mode: ${mode === 'ask' ? 'Question & Answer' : 'Task Execution'}`);

    const id = setTimeout(() => {
      addMessage("Hello! I'm your AI assistant. Let's begin.", 'ai', null, true);
      const startId = setTimeout(() => {
        startWorkflow();
      }, 1000);
      timeoutIdsRef.current.push(startId);
    }, 500);

    timeoutIdsRef.current.push(id);
  };

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      handleModeChange('ask');
      hasInitialized.current = true;
    }
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center p-2 sm:p-5 bg-transparent w-full ${className} overflow-hidden`}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .message-enter {
          animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .fade-mask {
            mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 100%);
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="w-full max-w-[500px] flex flex-col h-full overflow-hidden">
        {/* Title Group */}
        {/* <div className="shrink-0 mb-4 text-center">
          <div className="text-white text-xl sm:text-2xl font-bold mb-1">AI Assistant</div>
          <div className="text-muted-foreground text-xs sm:text-sm">Select a mode to see the interaction</div>
        </div> */}

        {/* Toggle */}
        <div className="shrink-0 flex bg-secondary/50 p-1.5 rounded-full mx-auto w-full max-w-[300px] mb-4 border border-border backdrop-blur-md">
          {(['ask', 'act'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`flex-1 py-2 text-center rounded-full text-sm font-semibold transition-all duration-300 capitalize ${currentMode === mode
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          className="flex-1 relative min-h-[250px] sm:min-h-[350px] bg-card rounded-3xl border border-border overflow-hidden flex flex-col shadow-sm"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Added ref to container, removed messagesEndRef for direct scrolling */}
          {/* Added no-scrollbar class */}
          <div
            ref={messagesContainerRef}
            className="absolute inset-0 fade-mask overflow-y-auto w-full px-3 py-3 no-scrollbar flex flex-col"
          >
            <div className="mt-auto flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm sm:text-base message-enter text-left ${msg.sender === 'user' ? 'self-end' : 'self-start'} ${msg.isAction
                    ? 'bg-secondary border border-border text-foreground flex items-center gap-3'
                    : msg.sender === 'user'
                      ? 'bg-secondary text-foreground'
                      : 'bg-card border border-border text-foreground shadow-sm'
                    }`}
                >
                  {msg.isAction ? (
                    <>
                      {msg.isLoading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-[spin_1s_linear_infinite] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <i className="fas fa-check text-green-500 text-[10px]" />
                        </div>
                      )}
                      <span>{msg.text}</span>
                    </>
                  ) : (
                    <>
                      <div>{msg.text}</div>
                      {msg.file && (
                        <div className="mt-2 flex items-center gap-2 bg-muted/50 p-2 rounded-lg text-xs">
                          <i className="fas fa-file opacity-50" />
                          {msg.file}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status & Input */}
        <div className="shrink-0 mt-4 space-y-3">
          <div className="text-center text-xs text-foreground/70 italic h-5">{statusText}</div>

          <div className="flex items-center gap-2 p-2 bg-card rounded-full border border-border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground/70">
              <i className="fas fa-plus" />
            </div>
            <input
              type="text"
              value={inputValue}
              readOnly
              placeholder={currentMode === 'ask' ? 'Ask a question...' : 'Describe a task...'}
              className="flex-1 bg-transparent border-none outline-none text-foreground text-sm px-2 placeholder:text-muted-foreground"
            />
            <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white shadow-lg shadow-purple-900/10">
              <i className="fas fa-arrow-up transform rotate-45" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;