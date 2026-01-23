'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    name: 'General',
    questions: [
      {
        q: 'What is Control?',
        a: 'Control is the first AI-powered personal computer assistant that actively performs tasks on your computer. Unlike chatbots, Control executes real actions through voice commands.',
      },
      {
        q: 'How is Control different from Siri or Alexa?',
        a: 'Control is a true computer use agent—it doesn\'t just answer questions, it performs complex multi-step tasks on your computer. Siri and Alexa have limited app integration compared to Control\'s comprehensive computer control.',
      },
      {
        q: 'When will Control be publicly available?',
        a: 'We\'re launching a public beta in March 2025 and expect to release publicly in Q2 2025. Join the beta now to get early access!',
      },
      {
        q: 'Is Control free?',
        a: 'Control will have a free tier and a premium Pro plan. Beta testers get free lifetime Pro access if they actively participate.',
      },
    ],
  },
  {
    name: 'Technical',
    questions: [
      {
        q: 'What platforms does Control support?',
        a: 'Control currently supports Windows 10+, macOS 10.14+, and Ubuntu 18.04+. Linux support will be expanded based on beta feedback.',
      },
      {
        q: 'Does Control require an internet connection?',
        a: 'Control runs primarily locally, but requires an internet connection for initial setup and cloud features. Voice processing can happen offline with local models.',
      },
      {
        q: 'How much resources does Control use?',
        a: 'Control requires 4GB RAM minimum (8GB recommended) and about 500MB of storage. It\'s optimized to run efficiently alongside other applications.',
      },
      {
        q: 'Can I use Control with multiple computers?',
        a: 'Yes! Your Control account works across multiple computers. However, each device requires its own installation and activation.',
      },
    ],
  },
  {
    name: 'Privacy & Security',
    questions: [
      {
        q: 'Does Control collect my data?',
        a: 'We collect minimal data. Control processes your commands locally first, and we never store your activity logs without explicit consent.',
      },
      {
        q: 'Where is my data processed?',
        a: 'All processing happens on your device by default. This privacy-first approach means your commands never leave your computer unless you explicitly opt-in to cloud features.',
      },
      {
        q: 'Is my voice data recorded?',
        a: 'Voice commands are processed in real-time but not recorded by default. You have full control over recording settings in the privacy section.',
      },
      {
        q: 'Can I delete my data?',
        a: 'Absolutely. You can delete all stored data, activity logs, and settings with one click from the privacy dashboard.',
      },
    ],
  },
  {
    name: 'Beta Program',
    questions: [
      {
        q: 'How do I join the beta?',
        a: 'Sign up with your email on this page and we\'ll send you an invitation link. Beta slots fill up quickly, so join early to guarantee access!',
      },
      {
        q: 'What are the requirements for beta testers?',
        a: 'Just have a compatible device (Windows, Mac, or Linux), 4GB+ RAM, a microphone, and a willingness to share feedback. That\'s it!',
      },
      {
        q: 'How long does the beta program last?',
        a: 'The beta program runs from January through May 2025, with a phased rollout. Active beta testers will have free access beyond the beta period.',
      },
      {
        q: 'Will my data be deleted after beta?',
        a: 'No. When we transition to public release, your data will be migrated safely. We\'ll notify you in advance of any changes.',
      },
    ],
  },
];

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = useMemo(() => {
    if (!searchQuery) return faqCategories;

    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  return (
    <section id="faq" className="py-20 sm:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about Control
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/70" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 text-base bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent-purple shadow-sm"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-bold text-foreground mb-4 px-2">{category.name}</h3>
              <div className="space-y-3">
                {category.questions.map((item, itemIndex) => {
                  const itemId = `${categoryIndex}-${itemIndex}`;
                  const isExpanded = expandedId === itemId;

                  return (
                    <button
                      key={itemId}
                      onClick={() => setExpandedId(isExpanded ? null : itemId)}
                      className="w-full text-left"
                    >
                      <div className="p-4 bg-card hover:bg-muted border border-border rounded-lg transition-all shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-foreground text-base">{item.q}</p>
                          <ChevronDown
                            className={`w-5 h-5 flex-shrink-0 text-foreground/70 transition-transform ${isExpanded ? 'rotate-180' : ''
                              }`}
                          />
                        </div>

                        {/* Answer */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-3 pt-3 border-t border-border' : 'max-h-0'
                            }`}
                        >
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No questions found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-accent-purple font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Still have questions? */}
        {/* <div className="mt-16 p-8 bg-gradient-to-r from-accent-purple/10 to-secondary rounded-2xl border border-border text-center">
          <h4 className="text-xl font-bold text-foreground mb-2">Still have questions?</h4>
          <p className="text-muted-foreground mb-4">Join our Discord community or contact us directly.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-6 py-2 bg-accent-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
              Join Discord
            </button>
            <button className="px-6 py-2 border border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors bg-card">
              Contact Support
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
}
