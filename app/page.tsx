"use client";

import AIAssistant from "@/components/animation";
import RotatingText from "@/components/RotatingText";
import Team from "@/components/Team";
import { FAQSection } from "@/components/faq";
import { FadeIn } from "@/components/fade-in";
import { useState, useEffect } from "react";
import GradientText from '@/components/gradienttext'

export default function Home() {
  const [formData, setFormData] = useState({ Name: '', Email: '', Message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0HY2Dg3F2eaziy-HtY7CXzYhzBc98vBXLI2HQQxzoJJzRhXu3s7TeX4ZuX_OpOIzN9A/exec';

  const placeholders = [
    "I want to automate my daily reports...",
    "Help me organize my research papers...",
    "Control my smart home devices...",
    "Draft emails based on my bullet points...",
    "Find and summarize local PDF files...",
    "Simply manage my files faster..."
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Note: Google Apps Script Web Apps often have CORS issues with application/json. 
      // Using no-cors mode is safer for fire-and-forget, but for reading response we try standard first as requested.
      // If CORS fails, we might need no-cors. The user sample asked for application/json.

      // We'll use URLSearchParams for better compatibility with standard Google Apps Script doPost(e) parsing if JSON fails, 
      // but sticking to user request of JSON first.

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        // Google Apps Script usually runs as a redirect. 'redirect: follow' is default.
        // Creating a URLSearchParams object is often more reliable for Apps Script 'doPost(e)', 
        // but the user explicitly asked for JSON body.
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // 'application/json' often triggers CORS preflight failure in Apps Script. text/plain avoids it.
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
      // Fallback: If JSON parsing failed but request technically worked (opaque response in no-cors), 
      // we might assume success if we switched modes, but here we treat as error.
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora text-foreground overflow-hidden selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center p-1">
              <img src="/icon-removebg-preview.png" alt="Control" className="w-full h-full object-contain invert dark:invert-0" />
            </div>
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
      <section className="relative pt-16 pb-8 md:pt-20 md:pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left Column: Text Content */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 md:space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs md:text-sm text-accent-purple animate-float">
                <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"></span>
                Now accepting beta users
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground">
                Control your 
                                <GradientText
                  colors={["#5227FF","#FF9FFC","#B19EEF"]}
                  animationSpeed={8}
                  showBorder={false}
                  className="custom-class"
                >
                <RotatingText
              texts={['computer', 'applications', 'system', 'software', 'research', 'workflows']}
              mainClassName=" rounded-lg text-4xl md:text-6xl lg:text-7xl font-bold"
              elementLevelClassName="bg-linear-to-r from-[#9333ea] to-[#18181b] bg-clip-text text-transparent"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
            </GradientText>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mx-auto md:mx-0">
                The AI desktop agent that gets things done — private, local-first, and ready out of the box.
              </p>

              <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mx-auto md:mx-0">
                Tell it what to do. It does it. No manuals, no setup.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => (document.getElementById('fullname') as HTMLInputElement)?.focus()}
                  className="h-12 px-8 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-transform active:scale-95 flex items-center justify-center gap-2 group shadow-lg shadow-black/5"
                >
                  Join the Beta
                  <i className="fas fa-arrow-right text-lg group-hover:-rotate-45 transition-transform"></i>
                </button>
                <a
                  href="/PROJECT_SUMMARY.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-8 rounded-full bg-secondary text-foreground border border-border font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  Read the Vision
                  <i className="fas fa-file-pdf text-sm"></i>
                </a>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary overflow-hidden">
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p>Trusted by 2,000+ early adopters</p>
              </div>
            </div>

            {/* Right Column: Animation Component */}
            <div className="relative w-full max-w-xl mx-auto md:mr-0">
              {/* Glow Effect (reduced intensity for smoother scrolling) */}
              <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-accent-glow/10 to-accent-purple/10 rounded-full blur-lg md:blur-xl opacity-40 pointer-events-none"></div>

              <div className="relative glass-card rounded-3xl md:rounded-[40px] overflow-hidden border border-border shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-8 md:h-10 bg-card border-b border-border flex items-center px-4 gap-2 z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="pt-8 md:pt-10 bg-secondary/30">
                  <AIAssistant className="min-h-[400px] md:min-h-[500px]" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Versatility / Definition Section */}
      <section className="pt-16 pb-6 px-4 md:px-6 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-glow -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-glow delay-1000 -z-10"></div>

        <FadeIn>
          <div className="max-w-5xl mx-auto text-left space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
              Designed to do <span className="text-gradient">Everything</span>.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Control was built with a single purpose: to handle any task on your system. <strong>It can control any software interface regardless of platform or operating system.</strong> Whether that's a personal assistant managing your calendar, a digital butler organizing your files, or a creative partner aiding your workflow.
            </p><br></br>
            <h3 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
              One App <span className="text-gradient">Full Control</span>.
            </h3>

          </div>
        </FadeIn>
      </section>

      {/* Features Grid */}
      <section id="features" className="pt-6 pb-16 px-4 md:px-6 relative">
        <FadeIn delay={200}>
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">Two Modes. Infinite Possibilities.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">Control adapts to your needs with two distinct modes designed for productivity and knowledge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-6 md:p-8 rounded-3xl hover:bg-secondary/50 transition-colors group border border-border">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-mouse-pointer text-foreground text-lg md:text-xl"></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">Act Mode</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  An autonomous agent that controls your mouse and keyboard. "Organize my downloads," "Send this email," or "Play my focus playlist." It sees your screen and gets it done.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-6 md:p-8 rounded-3xl hover:bg-secondary/50 transition-colors group border border-border">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-brain text-accent-purple text-lg md:text-xl"></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">Ask Mode</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  A supercharged knowledge assistant. Analyze PDF documents, ask complex questions, or get help with coding. It processes local files securely without uploading them.
                </p>
              </div>
            </div>

            {/* More Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
              {[
                { icon: "fa-microphone", title: "Voice Control", desc: "Hands-free operation with ambient wake-word detection." },
                { icon: "fa-shield-halved", title: "Privacy First", desc: "Local processing. Your data stays on your machine." },
                { icon: "fa-eye-slash", title: "Invisibility", desc: "Hidden from screen sharing and screenshots for total privacy." }
              ].map((feature, i) => (
                <div key={i} className="glass p-6 rounded-2xl bg-card border border-border">
                  <i className={`fas ${feature.icon} text-foreground text-xl mb-4`}></i>
                  <h4 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Interactive Use Cases */}
      <section id="use-cases" className="py-12 md:py-16 px-4 md:px-6 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gradient-subtle">Designed for your workflow</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Developers", items: ["Terminal automation", "Code analysis", "Log monitoring"], color: "purple" },
              { title: "Creatives", items: ["File organization", "Asset management", "Batch processing"], color: "purple" },
              { title: "Everyone", items: ["Email drafting", "Calendar management", "Smart home control"], color: "purple" }
            ].map((useCase, i) => (
              <div key={i} className="border-l-2 border-border pl-6 py-2 hover:border-accent-purple transition-colors">
                <h3 className="text-xl font-bold mb-4 text-foreground">{useCase.title}</h3>
                <ul className="space-y-3">
                  {useCase.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-muted-foreground text-sm md:text-base">
                      <i className="fas fa-check text-xs text-accent-purple"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-border relative overflow-hidden bg-card shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none"></div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Ready to take Control?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm md:text-base">
            Join the beta today and experience the future of human-computer interaction. Limited spots available.
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
        </div>
      </section>
      <div id="faq">
        <FAQSection />
      </div>

      {/* Meet the Team */}
      <div id="team">
        <Team />
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Control AI. All rights reserved.</p>
        {/* <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
        </div> */}
      </footer>
    </div>
  );
}
