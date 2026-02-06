import { useState, useEffect, useRef } from "react";
import { Profile } from "../types";
import { supabase } from "../supabaseClient";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { LocalNotifications } from "@capacitor/local-notifications";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🥰", "😍", "🤩", "😘", 
  "😋", "😛", "😜", "🤪", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", 
  "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", 
  "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", 
  "🥶", "🥴", "😵", "🤯", "🥳", "😎", "🤓", "🧐", "😕", "😟", 
  "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", 
  "😢", "😭", "😤", "😡", "👍", "👎", "👏", "🙌", "🤝", "💪", 
  "🎉", "🎊", "❤️", "💖", "💕", "🔥", "💥", "✨", "🎁", "🎂"
];

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

const SYSTEM_MESSAGE_PREFIX = "[系统]";

interface ChatWidgetProps {
  currentProfile: Profile;
  familyId: string;
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
  onSwitchProfile?: (id: string) => void;
}

export function ChatWidget({
  currentProfile,
  familyId,
  profiles,
  isOpen,
  onClose,
  onUnreadChange,
  onSwitchProfile,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 }); // 自底部和右侧的偏移 (仅限非最大化)
  const [size, setSize] = useState({ width: 380, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(isOpen);

  // 触摸/鼠标 统一处理
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { 
      x: clientX + position.x, 
      y: clientY + position.y 
    };
    // e.preventDefault(); // 注释掉以允许内部点击触发
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMaximized) return;
    setIsResizing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    resizeStartSize.current = { width: size.width, height: size.height };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const newX = dragStartPos.current.x - clientX;
        const newY = dragStartPos.current.y - clientY;
        setPosition({ 
          x: Math.max(-100, Math.min(newX, window.innerWidth - 100)), 
          y: Math.max(0, Math.min(newY, window.innerHeight - 100)) 
        });
      }

      if (isResizing) {
        const deltaX = dragStartPos.current.x - clientX;
        const deltaY = dragStartPos.current.y - clientY;
        setSize({
          width: Math.max(280, Math.min(window.innerWidth - 40, resizeStartSize.current.width + deltaX)),
          height: Math.max(300, Math.min(window.innerHeight - 40, resizeStartSize.current.height + deltaY))
        });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing]);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (internalOpen && isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [internalOpen, isMaximized]);

  const handleInternalClose = () => {
    setInternalOpen(false);
    onClose();
  };

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        if (typeof window !== "undefined" && !(window as any).Capacitor) return;
        const { display } = await LocalNotifications.requestPermissions();
        if (display === "granted") {
          await LocalNotifications.createChannel({
            id: "chat-notifications",
            name: "聊天消息",
            description: "家庭成员发送的消息通知",
            importance: 5,
            visibility: 1,
            sound: "default",
          });
        }
      } catch (e) {}
    };
    setupNotifications();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (internalOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, internalOpen]);

  useEffect(() => {
    if (onUnreadChange) onUnreadChange(unreadCount);
  }, [unreadCount, onUnreadChange]);

  useEffect(() => {
    if (!familyId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("family_id", familyId)
          .order("created_at", { ascending: true })
          .limit(50);
        if (error) throw error;
        setMessages(data || []);
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    const channel = supabase
      .channel(`family:${familyId}:messages`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `family_id=eq.${familyId}` },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          if (!internalOpen) {
            setUnreadCount((prev) => prev + 1);
          }
          if (newMsg.sender_id !== currentProfile.id && !newMsg.content.startsWith(SYSTEM_MESSAGE_PREFIX)) {
            const senderProfile = profiles.find(p => p.id === newMsg.sender_id);
            try {
              await LocalNotifications.schedule({
                notifications: [{
                  title: `${newMsg.sender_name} 发送了消息`,
                  body: newMsg.content,
                  id: Date.now() % 2147483647,
                  schedule: { at: new Date() },
                  channelId: "chat-notifications",
                  autoCancel: true,
                  summaryText: "家庭群聊",
                  group: "family-chat",
                  attachments: senderProfile?.avatarUrl ? [{ id: 'avatar', url: senderProfile.avatarUrl }] : undefined,
                }]
              });
            } catch (e) {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, internalOpen, currentProfile.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    try {
      const { error } = await supabase.from("messages").insert({
        family_id: familyId,
        sender_id: currentProfile.id,
        sender_name: currentProfile.name,
        content: trimmed,
      });
      if (error) throw error;
      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (e) {
      showToast({ type: "error", title: "发送失败", description: (e as Error)?.message });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  const isOwnMessage = (senderId: string) => senderId === currentProfile.id;
  const isSystemMessage = (msg: ChatMessage) => 
    msg.content.startsWith(SYSTEM_MESSAGE_PREFIX) || 
    msg.sender_name === "系统通知" || 
    msg.sender_name === "系统" ||
    msg.sender_id === "00000000-0000-0000-0000-000000000000"; // 兜底 UUID

  if (!familyId) return null;

  return (
    <>
      {/* Floating Entry Bubble */}
      {!internalOpen && (
        <button
          onClick={() => { setInternalOpen(true); setUnreadCount(0); }}
          className="fixed bottom-[100px] lg:bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white shadow-[0_20px_50px_-15px_rgba(255,77,148,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[90] animate-in zoom-in duration-500 group"
        >
          <div className="relative">
            <Icon name="message-circle" size={28} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FF4D94] border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Main Chat Window */}
      {internalOpen && (
        <div 
          ref={windowRef}
          className={`fixed z-[100] flex flex-col shadow-[0_32px_120px_-20px_rgba(0,0,0,0.4)] border border-white/40 dark:border-white/5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl overflow-hidden
            ${isMaximized 
              ? "inset-2 md:inset-10 rounded-[32px] md:rounded-[40px]" 
              : "rounded-[32px] bottom-6 right-4 sm:right-6 lg:bottom-auto lg:right-auto"
            } ${isDragging || isResizing ? "transition-none shadow-[0_45px_150px_-30px_rgba(0,0,0,0.5)] scale-[1.005]" : "transition-all duration-300"}
          `}
          style={!isMaximized ? {
            right: window.innerWidth < 1024 ? '16px' : `${position.x}px`,
            bottom: window.innerWidth < 1024 ? '24px' : `${position.y}px`,
            width: window.innerWidth < 1024 ? 'calc(100% - 32px)' : `${size.width}px`,
            height: window.innerWidth < 1024 ? 'calc(100% - 140px)' : `${size.height}px`,
            maxWidth: '100vw',
            maxHeight: 'calc(100svh - 40px)',
          } : undefined}
        >
          {/* Resize Grippers */}
          {!isMaximized && (
            <>
              <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-50 hover:bg-[#FF4D94]/10" />
              <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-50 hover:bg-[#FF4D94]/10" />
              <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-50 hover:bg-[#FF4D94]/20 rounded-br-full" />
            </>
          )}

          {/* Header (Drag Handle) */}
          <div 
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className={`flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 shrink-0 bg-white/50 dark:bg-black/20 ${!isMaximized ? 'cursor-move active:cursor-grabbing select-none' : ''}`}
          >
            <div className="flex items-center gap-4 relative">
              {/* Profile Switcher Trigger */}
              <div className="relative group">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowProfileSwitcher(!showProfileSwitcher); }}
                  onMouseDown={(e) => e.stopPropagation()} // 防止触发拖拽
                  className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white text-xl font-black shadow-lg transition-all hover:scale-110 active:scale-95 ring-2 ring-transparent hover:ring-[#FF4D94]/30 ${currentProfile.avatarColor || 'bg-gray-400'}`}
                >
                  {currentProfile.name.slice(-1)}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4ADE80] border-2 border-white dark:border-gray-900 rounded-full z-10 shadow-sm" />
                </button>

                {/* Quick Switcher Dropdown */}
                {showProfileSwitcher && (
                  <div 
                    className="absolute top-14 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 p-2 z-[110] flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-top-2 duration-300"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-2 border-b border-gray-50 dark:border-white/5 mb-1">切换身份</p>
                    {profiles.filter(p => p.id !== 'guest').map(p => (
                      <button
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSwitchProfile?.(p.id);
                          setShowProfileSwitcher(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          p.id === currentProfile.id 
                            ? 'bg-[#FF4D94]/10 text-[#FF4D94]' 
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${p.avatarColor || 'bg-gray-400'}`}>
                          {p.name.slice(-1)}
                        </div>
                        <span className="text-xs font-bold truncate">{p.name}</span>
                        {p.id === currentProfile.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF4D94]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-left cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-black text-[#1E293B] dark:text-white tracking-tight leading-none mb-1">家庭聊天室</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  {profiles.filter(p => p.id !== 'guest').length} Members Syncing
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"
                title={isMaximized ? "还原窗口" : "最大化"}
              >
                <Icon name={isMaximized ? "minimize" : "maximize"} size={16} />
              </button>
              <button 
                onClick={handleInternalClose}
                className="w-9 h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                title="最小化"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar bg-gray-50/50 dark:bg-black/10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF4D94] rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-[#FF4D94]">Syncing...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-40">
                 <Icon name="message-circle" size={48} className="text-gray-300" />
                <p className="text-sm font-bold text-gray-400">目前没有任何消息</p>
              </div>
            ) : (
              messages.map((msg) => {
                if (isSystemMessage(msg)) {
                  const content = msg.content.replace(SYSTEM_MESSAGE_PREFIX, "").trim();
                  return (
                    <div key={msg.id} className="flex flex-col items-center my-8 group animate-in fade-in zoom-in duration-700">
                      <div className="flex items-center gap-4 w-full px-6">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent opacity-50" />
                        <div className="flex flex-col items-center gap-2">
                           <div className="px-4 py-1.5 bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-gray-100/50 dark:border-white/5 rounded-full shadow-sm group-hover:bg-white/60 dark:group-hover:bg-white/10 transition-all">
                              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-wider">
                                {content}
                              </p>
                           </div>
                           <span className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] transform scale-90">
                              {formatTime(msg.created_at)}
                           </span>
                        </div>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent opacity-50" />
                      </div>
                    </div>
                  );
                }
                const isOwn = isOwnMessage(msg.sender_id);
                const senderProfile = profiles.find(p => p.id === msg.sender_id);
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-${isOwn ? 'right' : 'left'}-2 duration-300`}>
                    <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white dark:border-white/5 mt-1 flex items-center justify-center text-[10px] font-black text-white ${senderProfile?.avatarColor || 'bg-gray-400'}`}>
                       {(senderProfile?.name || msg.sender_name).slice(-1)}
                    </div>

                    <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {!isOwn && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{msg.sender_name}</span>
                      )}
                      <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md
                        ${isOwn 
                          ? "bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white rounded-tr-none" 
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10 rounded-tl-none"
                        }`}
                      >
                        <p className="break-words font-medium">{msg.content}</p>
                        <p className={`text-[9px] mt-2 tabular-nums font-bold uppercase ${isOwn ? "text-white/60" : "text-gray-400 opacity-60"}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-white/5 shrink-0 bg-white dark:bg-gray-950 rounded-b-[32px]">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="键入消息..." 
                    className="w-full pl-5 pr-12 py-4 bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-[#7C4DFF]/30 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#7C4DFF]/5 transition-all font-medium text-gray-900 dark:text-white shadow-inner" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${showEmojiPicker ? "bg-[#FF4D94] text-white scale-110 shadow-lg" : "text-gray-300 hover:text-gray-500 hover:bg-white dark:hover:bg-white/10"}`}
                  >
                    <span className="text-xl">😀</span>
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()} 
                  className="w-14 h-14 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#FF4D94]/30 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Icon name="send" size={24} />
                </button>
              </div>

              {showEmojiPicker && (
                <div className="bg-gray-100/50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-white/5 animate-in slide-in-from-bottom-2 duration-300 max-h-[160px] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button 
                        key={emoji} 
                        type="button" 
                        onClick={() => { setNewMessage(prev => prev + emoji); }} 
                        className="w-9 h-9 flex items-center justify-center text-2xl bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-[#FF4D94]/20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
