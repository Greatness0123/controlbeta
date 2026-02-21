import React, { useState } from 'react';

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
    width: '50px', height: '28px',
    background: active ? '#000' : '#e0e0e0',
    borderRadius: '14px', position: 'relative',
    cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
  }}>
    <div style={{
      position: 'absolute', width: '24px', height: '24px',
      background: 'white', borderRadius: '50%',
      top: '2px', left: active ? '24px' : '2px',
      transition: 'left 0.3s',
    }} />
  </div>
);

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, control, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 0', borderBottom: '1px solid #f0f0f0',
  }}>
    <div style={{
      width: '40px', height: '40px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#666', fontSize: '20px', flexShrink: 0,
    }}>
      <i className={icon} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: '#888' }}>{description}</div>
      {children}
    </div>
    {control && <div style={{ flexShrink: 0 }}>{control}</div>}
  </div>
);

const Section: React.FC<SectionProps> = ({ icon, label, children }) => (
  <div style={{
    marginBottom: '24px', background: 'white',
    border: '1px solid #e8e8e8', borderRadius: '16px', padding: '24px',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '24px', color: '#888', fontSize: '13px',
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
    }}>
      <i className={icon} style={{ fontSize: '16px' }} />
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
    padding: '10px 24px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
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
      padding: '12px 44px 12px 16px', border: '1px solid #e0e0e0',
      borderRadius: '10px', fontSize: '15px', color: '#000',
      background: `white url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 16px center`,
      cursor: 'pointer', appearance: 'none', minWidth: '200px',
      marginTop: '12px', ...style,
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
      width: '100%', padding: '12px 16px',
      border: '1px solid #e0e0e0', borderRadius: '10px',
      fontSize: '15px', color: '#000', background: 'white',
      marginTop: '8px', outline: 'none',
      letterSpacing: type === 'password' ? '3px' : undefined,
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

export default function Settings(): React.ReactElement {

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

  const toggle = (key: string) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const [provider, setProvider] = useState<Provider>('gemini');
  const [theme, setTheme] = useState('Light');

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ebf0 100%)',
      minHeight: '100vh', display: 'flex',
      justifyContent: 'center', alignItems: 'center', padding: '20px',
    }}>
      <style>{`
        .scrollable-content::-webkit-scrollbar { width: 6px; }
        .scrollable-content::-webkit-scrollbar-track { background: transparent; }
        .scrollable-content::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 3px; }
        select { -webkit-appearance: none; -moz-appearance: none; }
        input:focus { border-color: #999 !important; }
        .setting-item-last { border-bottom: none !important; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '640px', height: '750px',
        background: 'white', borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '32px 40px 24px', background: 'white',
          borderBottom: '1px solid #e8e8e8', flexShrink: 0,
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#000', marginBottom: '24px' }}>
            Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#000', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontSize: '32px', fontWeight: 600, flexShrink: 0,
            }}>
              C
            </div>
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>Greatness</div>
              <div style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>grucookorie08@gmail.com</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#666' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                Ready
              </div>
            </div>
            <button style={{
              padding: '8px 20px', background: '#000', color: 'white',
              border: 'none', borderRadius: '20px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px',
            }}>
              MASTER PLAN
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="scrollable-content" style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 40px' }}>

          {/* APPEARANCE */}
          <Section icon="fas fa-palette" label="Appearance">
            <SettingItem icon="fas fa-moon" title="Theme" description="Choose between light and dark mode">
              <SelectDropdown
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'Light', label: 'Light' },
                  { value: 'Dark', label: 'Dark' },
                  { value: 'Auto', label: 'Auto' },
                ]}
              />
            </SettingItem>
            <div style={{ borderBottom: 'none' }}>
              <SettingItem
                icon="fas fa-sparkles"
                title="Border Streak Effect"
                description="Show purple light streak along window borders"
                control={<Toggle active={toggles.borderStreak} onToggle={() => toggle('borderStreak')} />}
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