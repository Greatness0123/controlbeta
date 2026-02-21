import React, { useState, useEffect, useRef } from 'react';

const teamMembers = [
    {
        id: 1,
        name: "Okorie Greatness",
        role: "AI Engineer/Programmer",
        bio: "",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQHQNOWWlaaTGg/profile-displayphoto-scale_400_400/B4EZyA5H7BGgAg-/0/1771688986881?e=1773273600&v=beta&t=LgTGS8Jaqk9xojDR5vp9yeI-zVr2RRjXB8yiXnIIKB0"
    },
    {
        id: 2,
        name: "Bello Nifemi",
        role: "AI Engineer/Programmer",
        bio: "",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQF3hWi5bdh2JQ/profile-displayphoto-scale_400_400/B4DZrPRShIHsAg-/0/1764414011759?e=1773273600&v=beta&t=aR8oXxcqWhBYQ9j3I89MK2AQ0U6iBwqyNH6t4cocG2E"
    },
    {
        id: 3,
        name: "Micheal Omale",
        role: "Programmer",
        bio: "",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQE1oJMXKbtjjA/profile-displayphoto-scale_400_400/B4DZum_nIGIEAk-/0/1768033255557?e=1773273600&v=beta&t=yt3ZRjgAaQKLiWOMjuMnekQe2ltRLJljHsjF3gpV7TM"
    },
    {
        id: 4,
        name: "Ameh Omale",
        role: "Programmer",
        bio: "",
        image: "https://media.licdn.com/dms/image/v2/D5603AQFKOwAgR3iQ-A/profile-displayphoto-scale_400_400/B56Zuk7iVvHgAg-/0/1767998632335?e=1773273600&v=beta&t=XH8t4sETgzjwTvlEOcfH-7B8Dji4wCcR5EX9qgDqFUE"
    }
];

export default function Team() {
    const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
    const [isSpread, setIsSpread] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsSpread(true);
                    } else {
                        setIsSpread(false);
                    }
                });
            },
            { threshold: 0.2 } // Adjusted threshold
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-24 px-6 relative overflow-hidden" ref={containerRef}>
            <div className="max-w-7xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-16 text-foreground">Meet the Builders</h2>

                {/* Mobile Scrollable View */}
                <div className="md:hidden flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory px-4 -mx-4">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="snap-center shrink-0 w-[280px] flex flex-col items-center">
                            <div
                                className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-100 to-purple-500/50 dark:from-purple-900/50 dark:to-purple-500/70 mb-6 shadow-xl relative z-10"
                                onClick={() => setSelectedMember(member)}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover rounded-full border-4 border-background bg-secondary"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                            <div className="text-accent-purple text-sm font-semibold uppercase tracking-wider mb-2">{member.role}</div>
                            <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                        </div>
                    ))}
                </div>

                {/* Desktop Spread View */}
                <div className="hidden md:flex h-40 items-center justify-center relative">
                    {teamMembers.map((member, index) => {
                        // Spread logic: 
                        // Center: 0. Spread: (index - 1.5) * 150px approx.
                        const spreadOffset = (index - 1.5) * 160; // Increased separation

                        return (
                            <div
                                key={member.id}
                                className="group absolute transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
                                style={{
                                    transform: isSpread
                                        ? `translateX(${spreadOffset}px) scale(1)`
                                        : `translateX(0px) scale(${0.8 + (index * 0.05)})`, // Stacked closely
                                    zIndex: teamMembers.length - index,
                                    opacity: isSpread ? 1 : (1 - (index * 0.1)) // Fade out back items slightly when stacked
                                }}
                                onClick={() => setSelectedMember(member)}
                            >
                                {/* Image Circle */}
                                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-100 to-purple-500/50 dark:from-purple-900/50 dark:to-purple-500/70 cursor-pointer hover:scale-110 transition-transform duration-300 shadow-xl relative z-10">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover rounded-full border-4 border-background bg-secondary"
                                    />
                                </div>

                                {/* Desktop Hover Modal - Liquid Glass */}
                                <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-80 p-6 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-4 group-hover:translate-y-0 z-50 backdrop-blur-xl bg-glass-card-bg border border-border shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-card/50 to-transparent pointer-events-none" />
                                    <div className="relative">
                                        <div className="text-xl font-bold text-foreground mb-1">{member.name}</div>
                                        <div className="text-accent-purple text-sm mb-3 font-semibold tracking-wide">{member.role}</div>
                                        <p className="text-muted-foreground text-sm leading-relaxed font-medium">{member.bio}</p>
                                    </div>


                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Click Modal (Optional since we show content inline now, but keeping for detail view if needed) */}
            {/* Removing mobile modal since we laid out content inline for better scrolling experience as requested */}
            {selectedMember && window.innerWidth >= 768 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/80 backdrop-blur-md md:hidden" onClick={() => setSelectedMember(null)}>
                    {/* Simplified to avoid duplication with inline view */}
                </div>
            )}
        </section>
    );
}
