import React, { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'ask' | 'act';

interface ActionItem {
  text: string;
  duration: number;
}

interface StepTimings {
  typingInput: number;
  sendingDelay: number;
  finalMessage?: number;
}

interface WorkflowStep {
  user: string;
  ai?: string;
  actions?: ActionItem[];
  file: string | null;
  timings: StepTimings;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  file: string | null;
  isAction: boolean;
  isLoading: boolean;
  actionId: string | null;
  visible: boolean;
}

interface PushMessageOpts {
  file?: string | null;
  isAction?: boolean;
  isLoading?: boolean;
  actionId?: string | null;
}

// ─── Workflows (outside component — stable references) ────────────────────────

const ASK_WORKFLOW: WorkflowStep[] = [
  {
    user: "Can you work with my custom CAD software on Linux?",
    ai: "Yes. I see the screen exactly as you do. I can drive any software interface—whether it's Photoshop on Mac, a terminal on Ubuntu, or custom legacy apps on Windows. No APIs or servers required.",
    file: null,
    timings: { typingInput: 1800, sendingDelay: 400 },
  },
  {
    user: "Summarize this 50-page rental agreement for me",
    ai: "I've analyzed the lease. Key points:\n\n1. Rent is $2,400/mo, due on the 1st.\n2. No pets allowed without prior approval.\n3. Security deposit is one month's rent.\n\n⚠️ Clause 14.2 requires professional carpet cleaning every 6 months. Want me to flag this?",
    file: "rental_lease_final.pdf",
    timings: { typingInput: 2000, sendingDelay: 400 },
  },
  {
    user: "Debug this circular dependency error",
    ai: "I see the issue in `auth-provider.tsx`. You're invalidating the context inside its own consumer. I can refactor this to use a separate `useSession` hook to break the cycle. Shall I apply the fix?",
    file: "auth-provider.tsx",
    timings: { typingInput: 1600, sendingDelay: 400 },
  },
  {
    user: "Find that invoice from 'Acme Corp' I saved last month",
    ai: "Found it. `Invoice_Acme_Oct24.pdf` was in your Downloads folder. I also found a duplicate in Documents/Financials. Would you like me to open the one in Documents?",
    file: null,
    timings: { typingInput: 1800, sendingDelay: 400 },
  },
];

const ACT_WORKFLOW: WorkflowStep[] = [
  {
    user: "Deploy the latest build to the staging server",
    actions: [
      { text: "Opening Terminal (Ubuntu)...", duration: 900 },
      { text: "SSHing into user@192.168.1.55...", duration: 1200 },
      { text: "Pulling latest docker images...", duration: 1800 },
      { text: "Restarting NGINX service...", duration: 1000 },
      { text: "Verifying endpoint health check...", duration: 1200 },
      { text: "Deployment successful. Closing connection.", duration: 800 },
    ],
    file: null,
    timings: { typingInput: 2000, sendingDelay: 400, finalMessage: 800 },
  },
  {
    user: "Export Q3 reports from 'OldBooks 95' legacy app",
    actions: [
      { text: "Launching 'OldBooks 95'...", duration: 1200 },
      { text: "Navigating archaic menu structure...", duration: 1500 },
      { text: "Locating 'Reports' > 'Quarterly'...", duration: 1000 },
      { text: "Setting date range: July 1 - Sept 30...", duration: 1200 },
      { text: "Clicking tiny 'Export CSV' button...", duration: 900 },
      { text: "Handling 'Out of Memory' popup...", duration: 1000 },
      { text: "Success. Saved to Desktop.", duration: 700 },
    ],
    file: null,
    timings: { typingInput: 2400, sendingDelay: 400, finalMessage: 800 },
  },
  {
    user: "Organize my messy Desktop into folders by file type",
    actions: [
      { text: "Scanning Desktop items...", duration: 1000 },
      { text: "Identified 43 images, 12 documents, 5 installers...", duration: 1200 },
      { text: "Creating folder: 'Desktop/Images'...", duration: 800 },
      { text: "Moving 43 .png and .jpg files...", duration: 1800 },
      { text: "Creating folder: 'Desktop/Docs'...", duration: 800 },
      { text: "Moving 12 .pdf and .docx files...", duration: 1200 },
      { text: "Cleaning up remaining shortcuts...", duration: 900 },
    ],
    file: null,
    timings: { typingInput: 2500, sendingDelay: 400, finalMessage: 800 },
  },
  {
    user: "Cancel my 'TooExpensive' subscription",
    actions: [
      { text: "Navigating to service settings...", duration: 1400 },
      { text: "Locating 'Billing' tab...", duration: 1000 },
      { text: "Clicking 'Cancel Subscription'...", duration: 800 },
      { text: "Selecting reason: 'Too expensive'...", duration: 900 },
      { text: "Confirming cancellation...", duration: 1000 },
      { text: "Saving cancellation receipt...", duration: 1100 },
    ],
    file: null,
    timings: { typingInput: 2000, sendingDelay: 400, finalMessage: 800 },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIAssistant({ borderStreak }: { borderStreak?: boolean }): React.ReactElement {
  const [currentMode, setCurrentMode] = useState<Mode>('ask');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const modeRef = useRef<Mode>('ask');
  const stepRef = useRef<number>(0);
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const initialized = useRef<boolean>(false);

  // ── Timer helpers ──────────────────────────────────────────────────────────

  const schedule = (fn: () => void, ms: number): ReturnType<typeof setTimeout> => {
    const id = setTimeout(fn, ms);
    timerIds.current.push(id);
    return id;
  };

  const cancelAll = (): void => {
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];
  };

  // ── Message helpers ────────────────────────────────────────────────────────

  const pushMessage = (
    text: string,
    sender: 'user' | 'ai',
    opts: PushMessageOpts = {}
  ): number => {
    const { file = null, isAction = false, isLoading = false, actionId = null } = opts;
    const id = Date.now() + Math.random();
    const visible = sender === 'user' || isAction;
    const msg: Message = { id, text, sender, file, isAction, isLoading, actionId, visible };

    setMessages(prev => {
      const next = [...prev, msg];
      return next.length > 30 ? next.slice(-30) : next;
    });

    if (!visible) {
      schedule(() => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, visible: true } : m));
      }, 40);
    }

    return id;
  };

  const patchMessage = (id: number, patch: Partial<Message>): void => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  // Patches an action row by its actionId string (distinct from numeric msg.id)
  const patchAction = (actionId: string, patch: Partial<Message>): void => {
    setMessages(prev => prev.map(m => m.actionId === actionId ? { ...m, ...patch } : m));
  };

  const dropMessage = (id: number): void => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // ── Typing helpers ─────────────────────────────────────────────────────────

  const typeIntoInput = (text: string, msPerChar: number, done: () => void): void => {
    let i = 0;
    const tick = (): void => {
      if (i < text.length) {
        setInputValue(text.slice(0, i + 1));
        i++;
        schedule(tick, msPerChar);
      } else {
        done();
      }
    };
    tick();
  };

  const typeAIBubble = (text: string, done?: () => void): void => {
    const words = text.split(' ');
    let wi = 0;
    let built = '';
    const id = pushMessage('▋', 'ai');

    const tick = (): void => {
      if (wi < words.length) {
        built += (wi > 0 ? ' ' : '') + words[wi];
        wi++;
        patchMessage(id, { text: built + '▋', visible: true });
        schedule(tick, 65);
      } else {
        patchMessage(id, { text: built, visible: true });
        done?.();
      }
    };

    schedule(tick, 60);
  };

  // ── Action sequence (ACT mode) ─────────────────────────────────────────────

  const runActions = (actions: ActionItem[], done?: () => void): void => {
    let i = 0;
    const next = (): void => {
      if (i >= actions.length) { done?.(); return; }
      const { text, duration } = actions[i];
      const aId = `act-${Date.now()}-${i}`;
      pushMessage(text, 'ai', { isAction: true, isLoading: true, actionId: aId });
      schedule(() => {
        patchAction(aId, { isLoading: false });
        i++;
        schedule(next, 250);
      }, duration);
    };
    next();
  };

  // ── Core step runner ───────────────────────────────────────────────────────

  const runStep = (step: WorkflowStep, mode: Mode): void => {
    setInputValue('');
    setHasStarted(true);
    pushMessage(step.user, 'user', { file: step.file ?? null });

    const wf = mode === 'ask' ? ASK_WORKFLOW : ACT_WORKFLOW;

    const advance = (): void => {
      if (modeRef.current !== mode) return;
      stepRef.current = (stepRef.current + 1) % wf.length;
      schedule(() => {
        if (modeRef.current !== mode) return;
        beginStep(mode);
      }, 2200);
    };

    if (mode === 'ask') {
      let dotId: number | null = null;
      schedule(() => {
        if (modeRef.current !== mode) return;
        dotId = pushMessage('__dots__', 'ai');
        schedule(() => {
          if (modeRef.current !== mode) {
            if (dotId !== null) dropMessage(dotId);
            return;
          }
          if (dotId !== null) dropMessage(dotId);
          if (step.ai) typeAIBubble(step.ai, advance);
          else advance();
        }, 950);
      }, 450);
    } else {
      schedule(() => {
        if (modeRef.current !== mode) return;
        runActions(step.actions ?? [], () => {
          schedule(() => {
            if (modeRef.current !== mode) return;
            typeAIBubble('All actions completed successfully!', advance);
          }, step.timings.finalMessage ?? 800);
        });
      }, step.timings.sendingDelay);
    }
  };

  const beginStep = (mode: Mode): void => {
    const wf = mode === 'ask' ? ASK_WORKFLOW : ACT_WORKFLOW;
    const idx = stepRef.current % wf.length;
    const step = wf[idx];
    const spd = Math.max(18, step.timings.typingInput / step.user.length);

    typeIntoInput(step.user, spd, () => {
      if (modeRef.current !== mode) return;
      schedule(() => {
        if (modeRef.current !== mode) return;
        runStep(step, mode);
      }, step.timings.sendingDelay);
    });
  };

  // ── Mode switching ─────────────────────────────────────────────────────────

  const switchMode = (mode: Mode): void => {
    if (mode === modeRef.current) return;
    cancelAll();
    modeRef.current = mode;
    stepRef.current = 0;
    setCurrentMode(mode);
    setMessages([]);
    setInputValue('');
    setHasStarted(false);
    schedule(() => beginStep(mode), 650);
  };

  const restartWorkflow = (): void => {
    cancelAll();
    stepRef.current = 0;
    setMessages([]);
    setInputValue('');
    setHasStarted(false);
    schedule(() => beginStep(modeRef.current), 650);
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      schedule(() => beginStep('ask'), 650);
    }
    return cancelAll;
  }, []);

  useEffect(() => {
    if (messagesRef.current && !isHovering) {
      requestAnimationFrame(() => {
        if (messagesRef.current)
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      });
    }
  }, [messages, isHovering]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex",
      justifyContent: "center", alignItems: "center", padding: "20px",
    }}>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }

        .msg-enter { animation: fadeUp 0.32s cubic-bezier(0.16,1,0.3,1) forwards; }

        .dot { width:6px;height:6px;background:#aaa;border-radius:50%;display:inline-block;animation:dotBounce 1.2s infinite ease-in-out; }
        .dot:nth-child(2){ animation-delay:0.2s; }
        .dot:nth-child(3){ animation-delay:0.4s; }

        .no-scroll::-webkit-scrollbar{display:none}
        .no-scroll{-ms-overflow-style:none;scrollbar-width:none}

        .fade-top{
          mask-image:linear-gradient(to bottom,transparent 0%,black 16%,black 100%);
          -webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 16%,black 100%);
        }
        .tab-btn{
          padding:5px 16px;border-radius:20px;border:none;
          background:transparent;color:#888;font-size:12px;font-weight:600;
          cursor:pointer;transition:all 0.22s;letter-spacing:0.02em;
        }
        .tab-btn.active{background:#000;color:#fff}
        .icon-btn{
          width:30px;height:30px;border:none;background:transparent;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          border-radius:8px;color:#999;font-size:13px;transition:background 0.18s;
        }
        .icon-btn:hover{background:#f0f0f0;color:#555}
        .send-btn{
          width:36px;height:36px;border-radius:50%;border:none;
          background:#333;color:#fff;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;flex-shrink:0;transition:background 0.18s;
        }
        .border-streak-svg {
          position: absolute;
          inset: -1px;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          pointer-events: none;
          z-index: 20;
        }
        
        .streak-path {
          fill: none;
          stroke: #a855f7;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 100 400;
          animation: streak-move 3s linear infinite;
        }

        @keyframes streak-move {
          from { stroke-dashoffset: 500; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ── Card ── */}
      <div style={{
        width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column",
        position: 'relative',
      }}>
        {borderStreak && (
          <svg className="border-streak-svg">
            <rect
              x="0" y="0"
              width="100%" height="100%"
              rx="24"
              className="streak-path"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", gap: "3px", background: "#f2f2f2", padding: "3px", borderRadius: "20px" }}>
            {(['act', 'ask'] as Mode[]).map(mode => (
              <button
                key={mode}
                className={`tab-btn ${currentMode === mode ? 'active' : ''}`}
                onClick={() => switchMode(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <button className="icon-btn" onClick={restartWorkflow} title="Restart">
              <i className="fas fa-plus" />
            </button>
            <button className="icon-btn" title="History">
              <i className="fas fa-clock-rotate-left" />
            </button>
            <button className="icon-btn" title="Settings" onClick={() => {
              const el = document.getElementById('settings');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-gear" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ position: "relative", height: "320px" }}>

          {/* Empty state */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "40px",
            textAlign: "center", pointerEvents: "none",
            opacity: hasStarted ? 0 : 1, transition: "opacity 0.4s ease",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "16px", color: "#222" }}>⌘</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.25 }}>
              Greatness, how was your night?
            </h2>
            <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.6, margin: 0 }}>
              How can I assist you with your desktop tasks today?
            </p>
          </div>

          {/* Scrollable messages */}
          <div
            ref={messagesRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="no-scroll fade-top"
            style={{
              position: "absolute", inset: 0, overflowY: "auto",
              padding: "16px 16px 8px", display: "flex", flexDirection: "column",
              opacity: hasStarted ? 1 : 0, transition: "opacity 0.4s ease",
            }}
          >
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={msg.visible ? 'msg-enter' : ''}
                  style={{
                    opacity: msg.visible ? 1 : 0,
                    maxWidth: "82%",
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.isAction ? (
                    /* Action row */
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: "#f8f8f8", border: "1px solid #ebebeb",
                      borderRadius: "12px", padding: "8px 12px",
                      fontSize: "12px", color: "#444",
                    }}>
                      {msg.isLoading ? (
                        <div style={{
                          width: "14px", height: "14px", borderRadius: "50%",
                          border: "2px solid #ddd", borderTopColor: "#555",
                          animation: "spin 0.8s linear infinite", flexShrink: 0,
                        }} />
                      ) : (
                        <div style={{
                          width: "16px", height: "16px", borderRadius: "50%",
                          background: "#e8f5e9", display: "flex",
                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <i className="fas fa-check" style={{ fontSize: "9px", color: "#2e7d32" }} />
                        </div>
                      )}
                      {msg.text}
                    </div>
                  ) : (
                    /* Chat bubble */
                    <div style={{
                      background: msg.sender === 'user' ? '#000' : '#f5f5f5',
                      color: msg.sender === 'user' ? '#fff' : '#111',
                      borderRadius: msg.sender === 'user'
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      padding: msg.text === '__dots__' ? "12px 16px" : "10px 14px",
                      fontSize: "13px", lineHeight: 1.55, whiteSpace: "pre-wrap",
                    }}>
                      {msg.text === '__dots__' ? (
                        <span style={{ display: "flex", gap: "5px", alignItems: "center", height: "14px" }}>
                          <span className="dot" />
                          <span className="dot" />
                          <span className="dot" />
                        </span>
                      ) : (
                        msg.text
                      )}
                      {msg.file && (
                        <div style={{
                          marginTop: "8px", display: "flex", alignItems: "center", gap: "6px",
                          background: "rgba(255,255,255,0.15)", padding: "6px 10px",
                          borderRadius: "8px", fontSize: "12px", opacity: 0.85,
                        }}>
                          <i className="fas fa-file" style={{ fontSize: "11px" }} />
                          {msg.file}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: "12px 16px 4px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f5f5f5", borderRadius: "24px", padding: "6px 6px 6px 14px",
          }}>
            <i className="fas fa-paperclip" style={{ color: "#bbb", fontSize: "14px", cursor: "pointer", flexShrink: 0 }} />
            <input
              type="text"
              value={inputValue}
              readOnly
              placeholder={currentMode === 'ask' ? 'Ask a question...' : 'Describe a task...'}
              style={{
                flex: 1, border: "none", background: "transparent",
                fontSize: "13px", color: "#333", outline: "none", minWidth: 0,
              }}
            />
            <i className="fas fa-microphone" style={{ color: "#bbb", fontSize: "14px", cursor: "pointer", flexShrink: 0 }} />
            <button className="send-btn">
              <i className="fas fa-arrow-up" />
            </button>
          </div>

          <div style={{
            textAlign: "center", padding: "10px", fontSize: "12px", color: "#5b8def",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            <div style={{
              width: "6px", height: "6px", background: "#5b8def",
              borderRadius: "50%", animation: "pulse 2s infinite",
            }} />
            Wake word detected
          </div>
        </div>

      </div>
    </div>
  );
}