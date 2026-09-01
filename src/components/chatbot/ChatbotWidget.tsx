'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  MessageCircle,
  Bot,
  X,
  Smile,
  AlertCircle,
  Sparkles,
  Send,
  Zap,
  FolderKanban,
  Mail,
  Minus,
  Briefcase,
  PenLine,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import MarkdownRenderer from './MarkdownRenderer';

// ─── Types ───────────────────────────────────────────────────────────
interface ChatAction {
  type: string;
  page?: string;
  method?: string;
  projectId?: number;
  fields?: { name?: string; email?: string; subject?: string; message?: string };
  url?: string;
  label?: string;
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  actions?: ChatAction[];
  isGreeting?: boolean;
  timestamp?: number;
}

export interface ChatbotWidgetProps {
  onAction?: (action: ChatAction) => void;
}

// ─── Constants ───────────────────────────────────────────────────────
const PURPLE = '#5350C4';
const PURPLE_LIGHT = '#F2F2FF';

const CONTACT_DEFAULTS = {
  email: 'contact.mdmubarok@gmail.com',
  phone: '+8801XXXXXXXXX',
  whatsapp: '8801XXXXXXXXX',
  telegram: 'mdmubarok',
};

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    icon: '😊',
    emojis: ['😀', '😂', '🥰', '😎', '🤔', '😄', '🥲', '😆', '😉', '😏', '😢'],
  },
  {
    name: 'Gestures',
    icon: '👋',
    emojis: ['👋', '🤝', '👍', '👎', '👏', '🙌', '🤲', '🙏', '💪', '✌️', '🤞', '🫡'],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💝'],
  },
  {
    name: 'Objects',
    icon: '💡',
    emojis: ['💡', '🚀', '⭐', '🔥', '💻', '📱', '🎮', '🎨', '📸', '🎵', '⚡', '📌'],
  },
];

const QUICK_ACTIONS = [
  { label: 'Tell me about your skills', icon: Zap, message: 'What are your skills?' },
  { label: 'Show me your projects', icon: FolderKanban, message: 'Show me your projects' },
  { label: 'View your experience', icon: Briefcase, message: 'What is your experience?' },
  { label: 'Fill Contact Form', icon: PenLine, message: 'I want to fill the contact form' },
  { label: 'Contact info', icon: Mail, message: 'How can I contact you?' },
];

const ACTION_LABELS: Record<string, Record<string, string>> = {
  navigate: {
    home: '🏠 Home',
    about: '👤 About Me',
    skills: '⚡ Skills',
    projects: '📋 Projects',
    experience: '💼 Experience',
    contact: '📞 Contact',
  },
  contact: {
    email: '📧 Send Email',
    phone: '📞 Call Now',
    whatsapp: '📲 WhatsApp',
    telegram: '💬 Telegram',
  },
  fillForm: {
    default: '✍️ Fill Contact Form',
  },
  openUrl: {
    default: '🔗 Open Link',
  },
};

const SUGGESTED_ACTIONS: Record<string, ChatAction[]> = {
  general: [
    { type: 'navigate', page: 'home' },
    { type: 'navigate', page: 'projects' },
    { type: 'navigate', page: 'contact' },
  ],
  about: [
    { type: 'navigate', page: 'skills' },
    { type: 'navigate', page: 'experience' },
    { type: 'navigate', page: 'contact' },
  ],
  projects: [
    { type: 'navigate', page: 'about' },
    { type: 'navigate', page: 'skills' },
    { type: 'navigate', page: 'contact' },
  ],
  skills: [
    { type: 'navigate', page: 'projects' },
    { type: 'navigate', page: 'about' },
    { type: 'navigate', page: 'experience' },
  ],
  contact: [
    { type: 'fillForm', fields: {} },
    { type: 'contact', method: 'email' },
    { type: 'contact', method: 'whatsapp' },
  ],
};

function getActionLabel(action: ChatAction): string {
  if (action.type === 'project' && typeof action.projectId === 'number') {
    return `🔧 View Project ${action.projectId}`;
  }
  if (action.type === 'openUrl' && action.label) {
    return `🔗 ${action.label}`;
  }
  const typeMap = ACTION_LABELS[action.type];
  if (typeMap) {
    const key = action.page || action.method || 'default';
    if (typeMap[key]) return typeMap[key];
    if (typeMap['default']) return typeMap['default'];
  }
  return `→ ${action.type}`;
}

/** Determine conversation topic from recent messages for suggested actions */
function detectTopic(messages: ChatMessage[]): string {
  const recentText = messages
    .filter((m) => !m.isGreeting)
    .slice(-4)
    .map((m) => m.text.toLowerCase())
    .join(' ');

  if (/about|who are you|yourself|introduce|background|bio/.test(recentText)) return 'about';
  if (/project|portfolio|work|built|created|developed|showcase/.test(recentText)) return 'projects';
  if (/skill|tech|stack|language|framework|tool|proficien/.test(recentText)) return 'skills';
  if (/contact|email|phone|reach|hire|message|whatsapp|telegram|call/.test(recentText)) return 'contact';
  return 'general';
}

// ─── Helpers ─────────────────────────────────────────────────────────
let msgIdCounter = 0;
function uid() {
  return `msg-${Date.now()}-${++msgIdCounter}`;
}

function formatTimestamp(ts?: number) {
  if (!ts) return '';
  try {
    return formatDistanceToNow(ts, { addSuffix: true });
  } catch {
    return '';
  }
}

// ─── Sub-components ──────────────────────────────────────────────────

/** Elegant typing indicator with gradient dots */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
        style={{
          background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
        }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md shadow-sm"
        style={{ backgroundColor: 'var(--chat-bubble-bot, #F2F2FF)' }}
      >
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
                animation: `chatbot-typing-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Blinking cursor for streaming text */
function StreamingCursor() {
  return (
    <span
      className="chatbot-streaming-cursor"
      aria-hidden="true"
    />
  );
}

/** Toast notification for confirmations */
function ActionToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
      style={{
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        color: '#059669',
        border: '1px solid rgba(52, 211, 153, 0.2)',
      }}
    >
      <span>✅</span>
      {message}
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function ChatbotWidget({ onAction }: ChatbotWidgetProps) {
  const { isDark } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);
  const [botName, setBotName] = useState<string>("Mubarok's Assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Streaming state
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch chatbot settings from DB
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setChatEnabled(data.chatbot_enabled !== 'false');
          setBotName(data.chatbot_name || "Mubarok's Assistant");
        } else {
          setChatEnabled(true);
        }
      } catch {
        setChatEnabled(true);
      }
    }
    fetchSettings();
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize greeting when chatbot is enabled and chat is opened
  useEffect(() => {
    if (chatEnabled && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      setMessages([
        {
          id: uid(),
          from: 'bot',
          text: 'হাই! 😊 আমি তোমাকে কিভাবে সাহায্য করতে পারি? / Hi! 😊 How can I help you?',
          actions: [
            { type: 'navigate', page: 'home' },
            { type: 'navigate', page: 'about' },
            { type: 'navigate', page: 'projects' },
          ],
          isGreeting: true,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [chatEnabled, messages.length, hasGreeted]);

  // Track unread when minimized/closed and new bot messages arrive
  useEffect(() => {
    if ((isMinimized || !isOpen) && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === 'bot' && !lastMsg.isGreeting) {
        setUnreadCount((c) => c + 1);
      }
    }
  }, [messages.length, isMinimized, isOpen]);

  // Reset unread when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, streamingText, scrollToBottom]);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && !isStreaming) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized, isStreaming]);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Derived topic for suggested actions
  const topic = useMemo(() => detectTopic(messages), [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || isStreaming) return;

      setError(null);
      setShowEmoji(false);
      setInput('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      const userMsg: ChatMessage = { id: uid(), from: 'user', text: trimmed, timestamp: Date.now() };
      const prevMessages = [...messages, userMsg];
      setMessages(prevMessages);
      setIsLoading(true);
      setStreamingText('');
      setIsStreaming(false);

      const history = prevMessages
        .filter((m) => !m.isGreeting)
        .map((m) => ({ from: m.from, text: m.text }));

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        // Try streaming first
        const res = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history, stream: true }),
          signal: abort.signal,
        });

        if (!res.ok) throw new Error('Server error');

        const contentType = res.headers.get('content-type') || '';

        // Check if response is SSE (streaming)
        if (contentType.includes('text/event-stream') && res.body) {
          setIsLoading(false);
          setIsStreaming(true);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';
          let buffer = '';
          let finalReply = '';
          let finalActions: ChatAction[] = [];
          let finalBotName = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            // Split on double newline for SSE events
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || ''; // keep incomplete event

            for (const part of parts) {
              const lines = part.split('\n');
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const dataStr = line.slice(6);
                try {
                  const evt = JSON.parse(dataStr);

                  if (evt.type === 'token' && evt.content) {
                    accumulatedText += evt.content;
                    setStreamingText(accumulatedText);
                  } else if (evt.type === 'done') {
                    finalReply = evt.reply || accumulatedText;
                    finalActions = evt.actions || [];
                    if (evt.botName) finalBotName = evt.botName;
                  } else if (evt.type === 'error') {
                    finalReply = evt.reply || 'Sorry, an error occurred.';
                  }
                } catch {
                  // ignore parse errors for partial data
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                if (evt.type === 'token' && evt.content) {
                  accumulatedText += evt.content;
                } else if (evt.type === 'done') {
                  finalReply = evt.reply || accumulatedText;
                  finalActions = evt.actions || [];
                  if (evt.botName) finalBotName = evt.botName;
                } else if (evt.type === 'error') {
                  finalReply = evt.reply || 'Sorry, an error occurred.';
                }
              } catch {
                // ignore
              }
            }
          }

          setIsStreaming(false);
          setStreamingText('');

          // Add the final message
          const botMsg: ChatMessage = {
            id: uid(),
            from: 'bot',
            text: finalReply || accumulatedText || 'Sorry, I could not understand that.',
            actions: finalActions.length > 0 ? finalActions : undefined,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, botMsg]);

          if (finalBotName) setBotName(finalBotName);

        } else {
          // Non-streaming fallback (JSON response)
          const data = await res.json();

          if (data.botName) setBotName(data.botName);

          const mergedActions: ChatAction[] = [];
          if (data.action) mergedActions.push(data.action);
          if (Array.isArray(data.actions)) mergedActions.push(...data.actions);

          const botMsg: ChatMessage = {
            id: uid(),
            from: 'bot',
            text: data.reply || 'Sorry, I could not understand that.',
            actions: mergedActions.length > 0 ? mergedActions : undefined,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setIsStreaming(false);
        setStreamingText('');
        setError('Failed to get response. Tap to retry.');
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, isStreaming, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.from === 'user');
    if (lastUserMsg) {
      setError(null);
      setMessages((prev) => prev.filter((m) => m.from !== 'bot' || !m.actions));
      sendMessage(lastUserMsg.text);
    }
  };

  const handleAction = useCallback(
    (action: ChatAction) => {
      switch (action.type) {
        case 'navigate':
          onAction?.(action);
          break;
        case 'contact':
          switch (action.method) {
            case 'email':
              window.open(`mailto:${CONTACT_DEFAULTS.email}`, '_self');
              break;
            case 'phone':
              window.open(`tel:${CONTACT_DEFAULTS.phone}`, '_self');
              break;
            case 'whatsapp':
              window.open(`https://wa.me/${CONTACT_DEFAULTS.whatsapp}`, '_blank', 'noopener,noreferrer');
              break;
            case 'telegram':
              window.open(`https://t.me/${CONTACT_DEFAULTS.telegram}`, '_blank', 'noopener,noreferrer');
              break;
          }
          break;
        case 'fillForm':
          onAction?.(action);
          setToast('Contact form pre-filled! ✍️');
          break;
        case 'openUrl':
          if (action.url) {
            window.open(action.url, '_blank', 'noopener,noreferrer');
          }
          break;
        case 'project':
          onAction?.(action);
          break;
        default:
          onAction?.(action);
      }
    },
    [onAction]
  );

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  const showWelcome = messages.length <= 1 && messages[0]?.isGreeting;

  /** Get button styling for an action */
  const getActionButtonStyle = (action: ChatAction): React.CSSProperties => {
    if (action.type === 'navigate') {
      return {
        background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 12px rgba(83,80,196,0.3)',
      };
    }
    if (action.type === 'contact') {
      switch (action.method) {
        case 'email':
        case 'phone':
          return {
            backgroundColor: isDark ? 'rgba(83,80,196,0.15)' : PURPLE_LIGHT,
            color: isDark ? '#B8B5E0' : PURPLE,
            border: `2px solid ${isDark ? 'rgba(83,80,196,0.4)' : 'rgba(83,80,196,0.3)'}`,
          };
        case 'whatsapp':
          return {
            backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
            color: isDark ? '#86EFAC' : '#16A34A',
            border: `2px solid ${isDark ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.3)'}`,
          };
        case 'telegram':
          return {
            backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
            color: isDark ? '#93C5FD' : '#2563EB',
            border: `2px solid ${isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)'}`,
          };
      }
    }
    if (action.type === 'fillForm') {
      return {
        background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 12px rgba(83,80,196,0.3)',
      };
    }
    return {
      backgroundColor: isDark ? 'rgba(83,80,196,0.15)' : PURPLE_LIGHT,
      color: isDark ? '#B8B5E0' : PURPLE,
      border: `2px solid ${isDark ? 'rgba(83,80,196,0.25)' : 'rgba(83,80,196,0.15)'}`,
    };
  };

  /** Render a single action button */
  const renderActionButton = (action: ChatAction, index: number) => (
    <motion.button
      key={`${action.type}-${action.page || action.method || action.url || index}`}
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 350, damping: 25 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleAction(action)}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
      style={getActionButtonStyle(action)}
    >
      {getActionLabel(action)}
    </motion.button>
  );

  /** Render suggested actions row */
  const renderSuggestedActions = (msgId: string) => {
    const suggested = SUGGESTED_ACTIONS[topic] || SUGGESTED_ACTIONS.general;
    return (
      <motion.div
        key={`suggested-${msgId}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="flex flex-wrap gap-1.5 mt-2"
      >
        {suggested.map((action, i) => renderActionButton(action, i))}
      </motion.div>
    );
  };

  /** Render bot message content with markdown */
  const renderBotContent = (text: string, showCursor: boolean = false) => (
    <>
      <MarkdownRenderer content={text} isDark={isDark} />
      {showCursor && <StreamingCursor />}
    </>
  );

  // Don't render the chatbot widget at all if disabled
  if (chatEnabled === false) {
    return null;
  }

  // Show nothing while loading settings
  if (chatEnabled === null) {
    return null;
  }

  return (
    <>
      {/* ─── Global Styles ─── */}
      <style>{`
        @keyframes chatbot-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatbot-cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .chatbot-streaming-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: ${PURPLE};
          border-radius: 1px;
          animation: chatbot-cursor-blink 1s step-end infinite;
        }
        .chatbot-scrollbar::-webkit-scrollbar { width: 4px; }
        .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb { background: ${PURPLE}30; border-radius: 999px; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: ${PURPLE}60; }
        .chatbot-scrollbar { scrollbar-width: thin; scrollbar-color: ${PURPLE}30 transparent; }
        .chatbot-gradient-border {
          background: linear-gradient(135deg, #5350C4, #7B68EE, #9B8CE8);
          padding: 2px;
          border-radius: 1rem;
        }
        .chatbot-gradient-border-inner {
          border-radius: calc(1rem - 2px);
        }
        .chatbot-mesh-bg {
          background-image:
            radial-gradient(at 20% 80%, ${isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.06)'} 0px, transparent 50%),
            radial-gradient(at 80% 20%, ${isDark ? 'rgba(123,104,238,0.12)' : 'rgba(123,104,238,0.05)'} 0px, transparent 50%),
            radial-gradient(at 50% 50%, ${isDark ? 'rgba(155,140,232,0.08)' : 'rgba(155,140,232,0.04)'} 0px, transparent 50%);
        }
      `}</style>

      {/* ─── Floating Toggle Button / Minimized Bubble ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-2xl cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
              boxShadow: '0 8px 32px rgba(83,80,196,0.4), 0 2px 8px rgba(83,80,196,0.3)',
            }}
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: PURPLE }}
            />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #F87171)',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                  }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Minimized Desktop Bubble ─── */}
      <AnimatePresence>
        {isOpen && isMinimized && !isMobile && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-2xl cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
              boxShadow: '0 8px 32px rgba(83,80,196,0.35)',
              backdropFilter: 'blur(12px)',
            }}
            aria-label="Restore chat"
          >
            <Bot className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium pr-1">{botName}</span>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #F87171)',
                  }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Popup ─── */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={isMobile
              ? { y: '100%', opacity: 0 }
              : { scale: 0.6, opacity: 0, y: 50 }
            }
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', stiffness: 300, damping: 30 },
            }}
            exit={isMobile
              ? { y: '100%', opacity: 0, transition: { duration: 0.25 } }
              : { scale: 0.6, opacity: 0, y: 50, transition: { duration: 0.15 } }
            }
            drag={isMobile ? 'y' : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (isMobile && info.offset.y > 120) {
                setIsOpen(false);
                setIsMinimized(false);
              }
            }}
            className={
              isMobile
                ? 'fixed inset-0 z-[99999] flex flex-col overflow-hidden'
                : 'fixed z-[9999] w-[400px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-3rem)] bottom-6 right-6 flex flex-col overflow-hidden'
            }
            style={{
              borderRadius: isMobile ? 0 : '1.25rem',
              boxShadow: isMobile
                ? 'none'
                : '0 25px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(83,80,196,0.12)',
            }}
          >
            {/* ─── Header with Glassmorphism ─── */}
            <motion.div
              className="relative flex items-center justify-between px-4 py-3.5 select-none flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #5350C4 0%, #6B5CE7 50%, #7B68EE 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
                }}
              />

              <div className="relative flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-[0.9rem] leading-tight tracking-tight">
                    {botName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #34D399, #6EE7B7)',
                        boxShadow: '0 0 6px rgba(52,211,153,0.6)',
                      }}
                    />
                    <p className="text-white/80 text-xs font-medium">
                      {isStreaming ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center gap-0.5">
                {isMobile && (
                  <button
                    onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                {!isMobile && (
                  <>
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                      aria-label="Minimize chat"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                      aria-label="Close chat"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}
              </div>

              {isMobile && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-1 rounded-full bg-white/30" />
                </div>
              )}
            </motion.div>

            {/* ─── Chat Body ─── */}
            <div
              className="flex-1 flex flex-col min-h-0 overflow-hidden chatbot-mesh-bg"
              style={{
                backgroundColor: isDark ? '#0F0F1A' : '#FAFAFE',
                '--chat-bubble-bot': isDark ? '#1E1B3A' : '#FFFFFF',
                '--chat-text-bot': isDark ? '#E2E0F0' : '#1E1B4B',
              } as React.CSSProperties}
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto chatbot-scrollbar relative">
                {/* Top fade gradient */}
                <div
                  className="sticky top-0 left-0 right-0 h-6 z-10 pointer-events-none"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to bottom, #0F0F1A, transparent)'
                      : 'linear-gradient(to bottom, #FAFAFE, transparent)',
                  }}
                />

                <div className="px-4 pb-4 space-y-4">
                  {/* Welcome Screen */}
                  {showWelcome && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="flex flex-col items-center pt-4 pb-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
                          boxShadow: '0 8px 24px rgba(83,80,196,0.3)',
                        }}
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2
                        className="text-lg font-semibold mb-1"
                        style={{ color: isDark ? '#F0EEFF' : '#1E1B4B' }}
                      >
                        Welcome!
                      </h2>
                      <p
                        className="text-sm text-center max-w-[260px] mb-5"
                        style={{ color: isDark ? '#A5A3C4' : '#6B6994' }}
                      >
                        I'm {botName}. Ask me anything or try a quick action below.
                      </p>

                      {/* Quick Action Buttons */}
                      <div className="w-full space-y-2">
                        {QUICK_ACTIONS.map((action, i) => (
                          <motion.button
                            key={action.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickAction(action.message)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            style={{
                              backgroundColor: isDark ? '#1E1B3A' : '#FFFFFF',
                              color: isDark ? '#E2E0F0' : '#1E1B4B',
                              border: `1px solid ${isDark ? 'rgba(83,80,196,0.2)' : 'rgba(83,80,196,0.1)'}`,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background: isDark
                                  ? 'rgba(83,80,196,0.2)'
                                  : 'rgba(83,80,196,0.08)',
                              }}
                            >
                              <action.icon
                                className="w-4 h-4"
                                style={{ color: PURPLE }}
                              />
                            </div>
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Regular Messages */}
                  {!showWelcome &&
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`flex gap-2.5 ${
                          msg.from === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {/* Bot Avatar */}
                        {msg.from === 'bot' && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
                              boxShadow: '0 4px 12px rgba(83,80,196,0.25)',
                            }}
                          >
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Message Bubble + Actions + Suggestions */}
                        <div className="max-w-[300px] flex flex-col">
                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                              msg.from === 'user'
                                ? 'text-white rounded-2xl rounded-br-sm'
                                : 'rounded-2xl rounded-bl-sm'
                            }`}
                            style={
                              msg.from === 'user'
                                ? {
                                    background: 'linear-gradient(135deg, #5350C4, #6B5CE7)',
                                    boxShadow: '0 4px 12px rgba(83,80,196,0.25)',
                                  }
                                : {
                                    backgroundColor: isDark ? '#1E1B3A' : '#FFFFFF',
                                    color: isDark ? '#E2E0F0' : '#1E1B4B',
                                    border: `1px solid ${isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.08)'}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                  }
                            }
                          >
                            {msg.from === 'user'
                              ? msg.text
                              : renderBotContent(msg.text, false)
                            }
                          </div>

                          {/* Timestamp */}
                          <span
                            className={`text-[10px] mt-1 px-1 ${
                              msg.from === 'user' ? 'text-right' : 'text-left'
                            }`}
                            style={{ color: isDark ? '#6B6994' : '#A5A3C4' }}
                          >
                            {formatTimestamp(msg.timestamp)}
                          </span>

                          {/* Action Buttons */}
                          {msg.actions && msg.actions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
                              className="mt-2 flex flex-wrap gap-2"
                            >
                              {msg.actions.map((action, i) => renderActionButton(action, i))}
                            </motion.div>
                          )}

                          {/* Suggested Actions after bot messages */}
                          {msg.from === 'bot' && !msg.isGreeting && renderSuggestedActions(msg.id)}
                        </div>
                      </motion.div>
                    ))}

                  {/* Streaming Message Bubble (Typewriter Effect) */}
                  {isStreaming && streamingText && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="flex gap-2.5 justify-start"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #5350C4, #7B68EE)',
                          boxShadow: '0 4px 12px rgba(83,80,196,0.25)',
                        }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="max-w-[300px] flex flex-col">
                        <div
                          className="px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-bl-sm"
                          style={{
                            backgroundColor: isDark ? '#1E1B3A' : '#FFFFFF',
                            color: isDark ? '#E2E0F0' : '#1E1B4B',
                            border: `1px solid ${isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.08)'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          {renderBotContent(streamingText, true)}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Thinking Indicator (only show before streaming starts) */}
                  {isLoading && <TypingIndicator />}

                  {/* Error with retry */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 py-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <button
                        onClick={handleRetry}
                        className="text-xs text-red-500 hover:text-red-700 underline transition-colors"
                      >
                        {error}
                      </button>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Toast notification */}
                <div className="px-4">
                  <AnimatePresence>
                    {toast && (
                      <ActionToast
                        message={toast}
                        onDone={() => setToast(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom fade gradient */}
                <div
                  className="sticky bottom-0 left-0 right-0 h-6 z-10 pointer-events-none"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to top, #0F0F1A, transparent)'
                      : 'linear-gradient(to top, #FAFAFE, transparent)',
                  }}
                />
              </div>

              {/* ─── Footer / Input Area ─── */}
              <div
                className="flex-shrink-0 relative"
                style={{
                  backgroundColor: isDark ? '#0F0F1A' : '#FAFAFE',
                  borderTop: `1px solid ${isDark ? 'rgba(83,80,196,0.1)' : 'rgba(83,80,196,0.06)'}`,
                }}
              >
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      ref={emojiRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl shadow-xl overflow-hidden"
                      style={{
                        backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(83,80,196,0.2)' : 'rgba(83,80,196,0.1)'}`,
                      }}
                    >
                      <div
                        className="flex border-b px-2 pt-1.5"
                        style={{
                          borderColor: isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.08)',
                        }}
                      >
                        {EMOJI_CATEGORIES.map((cat, i) => (
                          <button
                            key={cat.name}
                            onClick={() => setEmojiCategory(i)}
                            className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all duration-200 relative"
                            style={{
                              color: emojiCategory === i
                                ? PURPLE
                                : isDark ? '#6B6994' : '#A5A3C4',
                            }}
                          >
                            <span className="text-base leading-none">{cat.icon}</span>
                            <span className="text-[9px] font-medium leading-none">{cat.name}</span>
                            {emojiCategory === i && (
                              <motion.div
                                layoutId="emoji-tab-indicator"
                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                                style={{
                                  background: 'linear-gradient(90deg, #5350C4, #7B68EE)',
                                }}
                              />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={emojiCategory}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="grid grid-cols-6 gap-0.5"
                          >
                            {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => insertEmoji(emoji)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-xl hover:scale-110 active:scale-90 transition-all duration-150"
                                style={{
                                  backgroundColor: isDark
                                    ? 'rgba(83,80,196,0.08)'
                                    : 'rgba(83,80,196,0.04)',
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex items-end gap-2 p-3"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 mb-0.5"
                    style={{
                      color: showEmoji ? PURPLE : isDark ? '#6B6994' : '#A5A3C4',
                      backgroundColor: showEmoji
                        ? isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.08)'
                        : 'transparent',
                    }}
                    aria-label="Insert emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      disabled={isStreaming}
                      className={
                        'w-full resize-none px-4 py-2.5 text-sm transition-all duration-300 outline-none disabled:opacity-50'
                      }
                      style={{
                        maxHeight: '120px',
                        borderRadius: '0.85rem',
                        backgroundColor: isDark ? '#1E1B3A' : '#FFFFFF',
                        color: isDark ? '#E2E0F0' : '#1E1B4B',
                        border: `2px solid ${isDark ? 'rgba(83,80,196,0.15)' : 'rgba(83,80,196,0.1)'}`,
                        boxShadow: input
                          ? '0 0 0 3px rgba(83,80,196,0.08)'
                          : 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = PURPLE;
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px rgba(83,80,196,0.12)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = isDark
                          ? 'rgba(83,80,196,0.15)'
                          : 'rgba(83,80,196,0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <AnimatePresence>
                    {input.trim().length > 0 && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        type="submit"
                        disabled={isLoading || isStreaming}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 mb-0.5 transition-opacity disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #5350C4, #6B5CE7)',
                          boxShadow: '0 4px 12px rgba(83,80,196,0.3)',
                        }}
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>

                <p
                  className="text-center text-[10px] pb-2 font-medium"
                  style={{ color: isDark ? '#3D3B5C' : '#C4C2DA' }}
                >
                  Powered by AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
