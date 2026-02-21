"use client";

import AIAssistant from "@/components/animatednew";
import RotatingText from "@/components/RotatingText";
import Team from "@/components/Team";
import { FAQSection } from "@/components/faq";
import { FadeIn } from "@/components/fade-in";
import { useState, useEffect } from "react";
import GradientText from '@/components/gradienttext';
import InfiniteRotatingCards from "@/components/InfiniteRotatingCards";
import { ThemeProvider } from "@/components/ThemeProvider";
import Settings from "@/components/settings";
import { ChevronDown, Brain, MousePointer2 } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({ Name: '', Email: '', Message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [borderStreak, setBorderStreak] = useState(true);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    "What will you build with Control?",
    "Show me how to automate my workflow.",
    "Analyze this PDF for key insights.",
    "Organize my downloads folder.",
    "Send a summary of this meeting."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: "Brain", isLucide: true, title: "Ask Mode", desc: "A supercharged knowledge assistant. Analyze PDF documents, ask complex questions, or get help with coding. It processes local files securely without uploading them." },
    { icon: "MousePointer2", isLucide: true, title: "Act Mode", desc: "An autonomous agent that controls your mouse and keyboard. \"Organize my downloads,\" \"Send this email,\" or \"Play my focus playlist.\" It sees your screen and gets it done." },
    { icon: "fa-brain", title: "All AI Providers", desc: "Native support for Gemini, OpenRouter (Claude, GPT-4), and local Ollama models for total autonomy." },
    { icon: "fa-keyboard", title: "Global Hotkeys", desc: "Control everything with Ctrl+Space, Alt+Z, and custom shortcuts designed for speed." },
    { icon: "fa-lock", title: "PIN Protection", desc: "4-digit SHA-256 encrypted PIN to secure your local assistant from unauthorized access." },
    { icon: "fa-microphone", title: "Voice Control", desc: "Hands-free operation with ambient wake-word detection for a truly hands-off experience." },
    { icon: "fa-shield-halved", title: "Privacy First", desc: "Local processing by default. Your data and interactions stay strictly on your device." },
    { icon: "fa-eye-slash", title: "Invisibility", desc: "Hidden from screen sharing and screenshots, ensuring your privacy while you work." }
  ];

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaJA87ar2GT68vpkSUjKn54uhFo1AuCDeXmbTIQsDcgtI5q10gdulFD-YxMDOj8-zmUg/exec';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.result === 'success') {
        setSubmitStatus('success');
        setFormData({ Name: '', Email: '', Message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-purple-500/30">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/50 backdrop-blur-xl transition-colors">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/icon-removebg-preview.png"
                alt="Control"
                className="w-8 h-8 object-contain dark:invert"
              />
              <span className="font-bold text-xl tracking-tight">Control</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <a href="#team" className="hover:text-foreground transition-colors">Team</a>
            </div>
            <button
              onClick={() => (document.getElementById('fullname') as HTMLInputElement)?.focus()}
              className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Join Beta
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-28 pb-4 md:pt-32 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto">
          <FadeIn delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

              {/* Left Column: Text Content */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-10 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs md:text-sm text-accent-purple">
                  <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"></span>
                  Now accepting beta users
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-foreground">
                  Control everything.
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mx-auto md:mx-0">
                  The AI desktop agent that gets things done — private, local-first, and ready out of the box.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => (document.getElementById('fullname') as HTMLInputElement)?.focus()}
                    className="h-12 px-8 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 group text-base"
                  >
                    Join the Beta
                    <i className="fas fa-arrow-right text-base group-hover:-rotate-45 transition-transform"></i>
                  </button>
                  <a
                    href="/PROJECT_SUMMARY.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-8 rounded-full bg-secondary text-foreground border border-border font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    Read the Vision
                  </a>
                </div>
              </div>

              {/* Right Column: AIAssistant */}
              <div className="relative w-full z-10 flex justify-center md:justify-end">
                <div className="relative w-full max-w-md">
                  <div className="relative glass-card rounded-[32px] overflow-hidden border border-border/50 shadow-xl bg-card">
                    <div className="pt-0">
                      <AIAssistant borderStreak={borderStreak} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </FadeIn>
        </section>

        {/* Features Section with Settings */}
        <section id="features" className="py-12 md:py-16 px-4 md:px-6 bg-background/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* Features List Stacks (Comes first on mobile) */}
              <div className="lg:col-span-7 flex flex-col gap-8 order-1 lg:order-2">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">Features.</h2>
                  <p className="text-muted-foreground mt-4 text-lg">Powerful local-first capabilities with dedicated Ask & Act modes.</p>
                </div>

                <div className="flex flex-col gap-4 h-[500px] overflow-y-auto pr-2 scrollable-features">
                  {features.map((feature, i) => (
                    <FadeIn key={i} delay={i * 100}>
                      <div
                        className={`glass-card rounded-[20px] border border-border/50 hover:border-accent-purple transition-all bg-card overflow-hidden ${expandedFeature === i ? 'shadow-md border-accent-purple/50' : ''}`}
                      >
                        <button
                          onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                          className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-3 group"
                        >
                          <div className="flex gap-4 items-center">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${feature.isLucide ? 'bg-accent-purple/10' : 'bg-secondary'}`}>
                              {feature.isLucide ? (
                                feature.icon === 'Brain' ? <Brain className="w-4 h-4 md:w-5 md:h-5 text-accent-purple" /> : <MousePointer2 className="w-4 h-4 md:w-5 md:h-5 text-accent-purple" />
                              ) : (
                                <i className={`fas ${feature.icon} text-foreground text-sm md:text-base`}></i>
                              )}
                            </div>
                            <h4 className="font-bold text-base md:text-lg text-foreground tracking-tight">{feature.title}</h4>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedFeature === i ? 'rotate-180' : ''}`} />
                        </button>

                        <div
                          className={`px-4 md:px-5 overflow-hidden transition-all duration-300 ease-in-out ${expandedFeature === i ? 'max-h-40 pb-4 md:pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/10 pt-3">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>

              {/* Left Column: Settings (Comes second on mobile) */}
              <div className="lg:col-span-5 lg:sticky top-24 order-2 lg:order-1">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter">Accessibility is key.</h2>
                  <p className="text-muted-foreground mt-2 text-lg">Your workspace, your rules.</p>
                </div>
                <div className="glass-card rounded-[24px] border border-border/50 shadow-xl bg-card relative">
                  <Settings borderStreak={borderStreak} onSetBorderStreak={setBorderStreak} />
                </div>
              </div>

            </div>
          </div>
          <style jsx>{`
            .scrollable-features::-webkit-scrollbar { width: 6px; }
            .scrollable-features::-webkit-scrollbar-track { background: transparent; }
            .scrollable-features::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
            .scrollable-features::-webkit-scrollbar-thumb:hover { background: var(--muted); }
          `}</style>
        </section>

        {/* Join Beta */}
        <section id="signup" className="py-12 px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto p-12 md:p-16 rounded-[40px] bg-secondary/30 border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tighter text-center">Join the Beta.</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto text-center">
                Be among the first to experience the future of local-first AI. Early testers get lifetime pro access.
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
                <input
                  id="fullname"
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-6 py-4 rounded-xl bg-secondary border border-border focus:border-accent-purple outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-6 py-4 rounded-xl bg-secondary border border-border focus:border-accent-purple outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <textarea
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full px-6 py-4 rounded-xl bg-secondary border border-border focus:border-accent-purple outline-none transition-all text-foreground placeholder:text-muted-foreground min-h-[120px] resize-y"
                  value={formData.Message}
                  onChange={(e) => setFormData({ ...formData, Message: e.target.value })}
                  required
                  disabled={isSubmitting}
                />

                <div className="relative">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-full bg-foreground text-background font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-circle-notch animate-spin text-sm"></i>
                        Submitting...
                      </>
                    ) : (
                      'Get Early Access'
                    )}
                  </button>
                </div>

                {submitStatus === 'success' && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    Thanks for joining! We'll be in touch soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    Something went wrong. Please try again.
                  </div>
                )}
              </form>
            </FadeIn>
          </div>
        </section>

        {/* Infinite Rotating Cards Section */}
        <section className="py-16 border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tighter">What can Control do?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Control is simply a situation where a computer-use agent is maximized, it can operate across apps like a power user: read screens, click, type, navigate, and chain actions into real outcomes.
            </p>
          </div>
          <InfiniteRotatingCards items={[
            { title: "Universal Integration", description: "Works seamlessly across Windows, macOS, and Linux without complex configuration.", icon: "fa-universal-access" },
            { title: "Local Autonomy", description: "Processes your data locally, ensuring your privacy remains the top priority.", icon: "fa-shield-halved" },
            { title: "Voice Precision", description: "Advanced wake-word detection and noise cancellation for reliable hands-free use.", icon: "fa-microphone" },
            { title: "Security First", description: "4-digit PIN protection and SHA-256 encryption keep your personal assistant secure.", icon: "fa-lock" },
            { title: "AI Versatility", description: "Switch between high-performance cloud models and ultra-private local models on the fly.", icon: "fa-brain" }
          ]} />
        </section>

        {/* FAQ & Team */}
        <section id="faq" className="py-16 border-t border-border">
          <FAQSection />
        </section>
        <section id="team" className="py-16 bg-secondary/10 border-y border-border">
          <Team />
        </section>

        <footer className="py-20 border-t border-border text-center text-muted-foreground">
          <p className="text-lg">&copy; 2026 Control AI. The future is local.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
