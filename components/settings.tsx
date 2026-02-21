import React, { useState, useRef } from 'react';
import { useTheme } from './ThemeProvider';


// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = 'gemini' | 'openrouter' | 'ollama';

interface ToggleProps {
  active: boolean;
  onToggle: () => void;
}

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  control?: React.ReactNode;
  children?: React.ReactNode;
}

interface SectionProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

interface ShortcutKeyProps {
  label: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle: React.FC<ToggleProps> = ({ active, onToggle }) => (
  <div onClick={onToggle} style={{
    width: '40px', height: '22px',
    background: active ? '#000' : '#e0e0e0',
    borderRadius: '11px', position: 'relative',
    cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', width: '18px', height: '18px',
      background: 'white', borderRadius: '50%',
      top: '2px', left: active ? '20px' : '2px',
      transition: 'left 0.3s',
    }} />
  </div>
);

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, control, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 0', borderBottom: '1px solid #f0f0f0',
  }}>
    <div style={{
      width: '32px', height: '32px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#666', fontSize: '16px', flexShrink: 0,
    }}>
      <i className={icon} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#888' }}>{description}</div>
      {children}
    </div>
    {control && <div style={{ flexShrink: 0 }}>{control}</div>}
  </div>
);

const Section: React.FC<SectionProps> = ({ icon, label, children }) => (
  <div style={{
    marginBottom: '16px', background: 'white',
    border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '16px', color: '#888', fontSize: '11px',
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      <i className={icon} style={{ fontSize: '13px' }} />
      {label}
    </div>
    {children}
  </div>
);

const ShortcutKey: React.FC<ShortcutKeyProps> = ({ label }) => (
  <div style={{
    padding: '6px 12px', background: '#f5f5f5',
    border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '13px', fontWeight: 500, color: '#666',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
  }}>
    {label} <i className="fas fa-pen" style={{ fontSize: '11px' }} />
  </div>
);

const Btn: React.FC<{ children: React.ReactNode; danger?: boolean; onClick?: () => void }> = ({ children, danger, onClick }) => (
  <button onClick={onClick} style={{
    padding: '6px 16px', borderRadius: '8px',
    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${danger ? '#fcc' : '#e0e0e0'}`,
    background: danger ? '#fee' : 'white',
    color: danger ? '#c33' : '#000',
    transition: 'all 0.2s',
  }}>
    {children}
  </button>
);

const SelectDropdown: React.FC<{
  value?: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  style?: React.CSSProperties;
}> = ({ value, onChange, options, style }) => (
  <select
    value={value}
    onChange={e => onChange?.(e.target.value)}
    style={{
      padding: '8px 32px 8px 12px', border: '1px solid #e0e0e0',
      borderRadius: '8px', fontSize: '13px', color: '#000',
      background: `white url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center`,
      cursor: 'pointer', appearance: 'none', minWidth: '140px',
      marginTop: '8px', ...style,
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const InputField: React.FC<{ type?: string; value?: string; placeholder?: string }> = ({ type = 'text', value, placeholder }) => (
  <input
    type={type}
    defaultValue={value}
    placeholder={placeholder}
    style={{
      width: '100%', padding: '8px 12px',
      border: '1px solid #e0e0e0', borderRadius: '8px',
      fontSize: '13px', color: '#000', background: 'white',
      marginTop: '6px', outline: 'none',
      letterSpacing: type === 'password' ? '2px' : undefined,
    }}
  />
);

const NoteBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: '#fef9e7', border: '1px solid #f9e79f',
    borderRadius: '10px', padding: '16px', marginTop: '16px',
    fontSize: '13px', color: '#666',
  }}>
    <i className="fas fa-info-circle" style={{ color: '#f39c12', marginRight: '8px' }} />
    {children}
  </div>
);

const ActiveBadge: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    display: 'inline-block', padding: '4px 12px',
    background: '#d1fae5', color: '#059669',
    borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginTop: '8px',
  }}>
    {label}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Settings({
  borderStreak,
  onSetBorderStreak
}: {
  borderStreak?: boolean;
  onSetBorderStreak?: (val: boolean) => void;
}): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  // Toggles state

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    borderStreak: false,
    securityPin: false,
    voiceActivation: true,
    autoSend: false,
    wakeWordToggle: true,
    voiceResponse: true,
    muteNotifications: false,
    windowVisibility: true,
    greetingVoice: true,
    edgeGlow: true,
    proceedWithout: true,
    runOnStartup: false,
    floatingButton: true,
  });

  const toggle = (key: string) => {
    if (key === 'borderStreak' && onSetBorderStreak) {
      onSetBorderStreak(!borderStreak);
    }
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [provider, setProvider] = useState<Provider>('gemini');

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      display: 'flex',
      justifyContent: 'center', alignItems: 'center',
    }}>
      <style>{`
        .scrollable-content::-webkit-scrollbar { width: 6px; }
        .scrollable-content::-webkit-scrollbar-track { background: transparent; }
        .scrollable-content::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 3px; }
        select { -webkit-appearance: none; -moz-appearance: none; }
        input:focus { border-color: #999 !important; }
        .setting-item-last { border-bottom: none !important; }
        
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

      <div id="settings" style={{
        width: '100%', maxWidth: '480px', height: '500px',
        background: 'var(--card)', borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        border: '1px solid var(--border)',
      }}>
        {borderStreak && (
          <svg className="border-streak-svg">
            <rect
              x="0" y="0"
              width="100%" height="100%"
              rx="20"
              className="streak-path"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}


        {/* ── Header ── */}
        <div style={{
          padding: '24px 20px 16px', borderRadius: '20px 20px 0 0',
          borderBottom: '1px solid #e8e8e8', flexShrink: 0,
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
            Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#000', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontSize: '20px', fontWeight: 600, flexShrink: 0,
            }}>
              C
            </div>
            {/* Info */}
            <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '1px' }}>Greatness</div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px', wordBreak: 'break-all' }}>grucookorie08@gmail.com</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666' }}>
                <div style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%' }} />
                Ready
              </div>
            </div>
            <button style={{
              padding: '4px 10px', background: '#000', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '10px',
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.3px',
              flexShrink: 0,
            }}>
              MASTER
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="scrollable-content" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>

          {/* APPEARANCE */}
          <Section icon="fas fa-palette" label="Appearance">
            <SettingItem icon="fas fa-moon" title="Theme" description="Choose between light and dark mode">
              <SelectDropdown
                value={theme === 'light' ? 'Light' : 'Dark'}
                onChange={(v) => toggleTheme()}
                options={[
                  { value: 'Light', label: 'Light' },
                  { value: 'Dark', label: 'Dark' },
                ]}
              />

            </SettingItem>
            <div style={{ borderBottom: 'none' }}>
              <SettingItem
                icon="fas fa-sparkles"
                title="Border Streak Effect"
                description="Show purple light streak along window borders"
                control={<Toggle active={borderStreak ?? toggles.borderStreak} onToggle={() => toggle('borderStreak')} />}
              />
            </div>
          </Section>

          {/* SECURITY */}
          <Section icon="fas fa-shield-halved" label="Security">
            <SettingItem
              icon="fas fa-lock"
              title="Enable Security PIN"
              description="Require PIN to open chat"
              control={<Toggle active={toggles.securityPin} onToggle={() => toggle('securityPin')} />}
            />
            <SettingItem
              icon="fas fa-key"
              title="Change PIN"
              description="Update your security PIN"
              control={<Btn><i className="fas fa-pen" style={{ marginRight: '6px' }} />Edit</Btn>}
            />
          </Section>

          {/* VOICE & SPEECH */}
          <Section icon="fas fa-microphone" label="Voice & Speech">
            <SettingItem
              icon="fas fa-volume-high"
              title="Voice Activation"
              description='Wake word: "hey control"'
              control={<Toggle active={toggles.voiceActivation} onToggle={() => toggle('voiceActivation')} />}
            />
            <SettingItem
              icon="fas fa-paper-plane"
              title="Auto-Send After Wake Word"
              description="Automatically send transcriptions after wakeword"
              control={<Toggle active={toggles.autoSend} onToggle={() => toggle('autoSend')} />}
            />
            <SettingItem
              icon="fas fa-repeat"
              title="Wake Word Toggle Chat"
              description='Allow "Hey Control" to toggle chat open/close'
              control={<Toggle active={toggles.wakeWordToggle} onToggle={() => toggle('wakeWordToggle')} />}
            />
            <SettingItem
              icon="fas fa-volume-up"
              title="Voice Response"
              description="Read AI responses aloud"
              control={<Toggle active={toggles.voiceResponse} onToggle={() => toggle('voiceResponse')} />}
            />
            <SettingItem
              icon="fas fa-volume-xmark"
              title="Mute Notifications"
              description="Disable notification sounds"
              control={<Toggle active={toggles.muteNotifications} onToggle={() => toggle('muteNotifications')} />}
            />
            <SettingItem
              icon="fas fa-camera"
              title="Window Visibility"
              description="Allow windows in screenshots/recordings"
              control={<Toggle active={toggles.windowVisibility} onToggle={() => toggle('windowVisibility')} />}
            />
            <SettingItem
              icon="fas fa-volume-high"
              title="Greeting Voice"
              description="Speak welcome greeting aloud"
              control={<Toggle active={toggles.greetingVoice} onToggle={() => toggle('greetingVoice')} />}
            />
            <SettingItem
              icon="fas fa-sparkles"
              title="Edge Glow Effect"
              description="Show purple edge glow during Act mode"
              control={<Toggle active={toggles.edgeGlow} onToggle={() => toggle('edgeGlow')} />}
            />
            <SettingItem
              icon="fas fa-check-circle"
              title="Proceed Without Confirmation"
              description="Allow AI to perform high-risk tasks automatically"
              control={<Toggle active={toggles.proceedWithout} onToggle={() => toggle('proceedWithout')} />}
            />
          </Section>

          {/* AI MODEL SETTINGS */}
          <Section icon="fas fa-brain" label="AI Model Settings">
            <SettingItem icon="fas fa-server" title="Model Provider" description="Choose where to run your AI models">
              <SelectDropdown
                value={provider}
                onChange={v => setProvider(v as Provider)}
                options={[
                  { value: 'gemini', label: 'Google Gemini (Native)' },
                  { value: 'openrouter', label: 'OpenRouter (Pro/Master)' },
                  { value: 'ollama', label: 'Ollama (Local)' },
                ]}
              />
            </SettingItem>

            {/* Gemini */}
            {provider === 'gemini' && (
              <SettingItem icon="fas fa-star" title="Gemini Model" description="Default native model: gemini-2.5-flash">
                <ActiveBadge label="ACTIVE (Google SDK)" />
              </SettingItem>
            )}

            {/* OpenRouter */}
            {provider === 'openrouter' && (
              <>
                <SettingItem icon="fas fa-list" title="Select Model" description="Vetted multimodal & computer-use models">
                  <SelectDropdown
                    options={[{ value: 'custom', label: 'Custom Model...' }]}
                  />
                </SettingItem>
                <SettingItem icon="fas fa-pen" title="Custom Model Name" description="Enter OpenRouter model identifier">
                  <InputField value="z-ai/glm-4.5-air:free" />
                </SettingItem>
                <SettingItem icon="fas fa-key" title="OpenRouter API Key" description="Your personal key (optional, will use system key if empty)">
                  <InputField type="password" value="••••••••••••••••••••••••••••" />
                </SettingItem>
              </>
            )}

            {/* Ollama */}
            {provider === 'ollama' && (
              <>
                <SettingItem icon="fas fa-link" title="Ollama URL" description="Local API endpoint">
                  <InputField value="http://localhost:11434" />
                </SettingItem>
                <SettingItem icon="fas fa-cube" title="Ollama Model" description="Model name (e.g. llama3)">
                  <InputField value="llama3" />
                  <NoteBox>
                    <strong>Note:</strong> For computer use tasks with Ollama, please use a multimodal model with vision support (e.g. llama3-vision or llava).
                  </NoteBox>
                </SettingItem>
              </>
            )}
          </Section>

          {/* SHORTCUTS */}
          <Section icon="fas fa-keyboard" label="Shortcuts">
            <SettingItem
              icon="fas fa-comment"
              title="Toggle Chat"
              description="Show/hide chat window"
              control={<ShortcutKey label="Ctrl+Space" />}
            />
            <SettingItem
              icon="fas fa-circle-stop"
              title="Stop Task"
              description="Emergency stop AI action"
              control={<ShortcutKey label="Alt+Z" />}
            />
            <SettingItem
              icon="fas fa-rotate-left"
              title="Reset Hotkeys"
              description="Restore default shortcuts"
              control={<Btn>Reset</Btn>}
            />
          </Section>

          {/* SYSTEM */}
          <Section icon="fas fa-cog" label="System">
            <SettingItem
              icon="fas fa-power-off"
              title="Run on Startup"
              description="Automatically start Control when computer turns on"
              control={<Toggle active={toggles.runOnStartup} onToggle={() => toggle('runOnStartup')} />}
            />
            <SettingItem
              icon="fas fa-eye"
              title="Floating Button"
              description="Show overlay floating button"
              control={<Toggle active={toggles.floatingButton} onToggle={() => toggle('floatingButton')} />}
            />
            <SettingItem
              icon="fas fa-lock"
              title="Lock App"
              description="Lock the application"
              control={<Btn><i className="fas fa-lock" style={{ marginRight: '6px' }} />Lock</Btn>}
            />
            <SettingItem
              icon="fas fa-right-from-bracket"
              title="Log Out"
              description="Sign out of your account"
              control={<Btn><i className="fas fa-right-from-bracket" style={{ marginRight: '6px' }} />Log Out</Btn>}
            />
            <SettingItem
              icon="fas fa-power-off"
              title="Quit Application"
              description="Exit Control"
              control={<Btn danger><i className="fas fa-power-off" style={{ marginRight: '6px' }} />Quit</Btn>}
            />
          </Section>

        </div>
      </div>
    </div>
  );
}