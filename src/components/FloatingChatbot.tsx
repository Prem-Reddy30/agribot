import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { sendMessageToAI, getConversations } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export function FloatingChatbot() {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [queryText, setQueryText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const history = await getConversations();
            const formattedMessages: Message[] = [];

            history.slice().reverse().forEach(conv => {
                formattedMessages.push({
                    id: `${conv.id}-user`,
                    role: 'user',
                    content: conv.userMessage,
                    timestamp: conv.timestamp
                });
                formattedMessages.push({
                    id: `${conv.id}-assistant`,
                    role: 'assistant',
                    content: conv.aiResponse,
                    timestamp: conv.timestamp
                });
            });

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!queryText.trim() || isSubmitting) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: queryText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setQueryText('');
        setIsSubmitting(true);

        try {
            const response = await sendMessageToAI(queryText, [], language);

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: response.timestamp
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please make sure the backend server (port 5000) is running and try again.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all z-50 group"
                aria-label="Open Chatbot"
            >
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 w-[360px] sm:w-[400px] z-50 transition-all duration-300 ease-out ${isMinimized ? 'h-16' : 'h-[550px]'
                } bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-black/10 flex flex-col overflow-hidden`}
        >
            {/* Header */}
            <div
                className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white cursor-pointer"
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">KrishiSahay AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-emerald-100 uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 dark:bg-slate-800/30 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-2xl flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-emerald-500/50" />
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('chat.startConversation')}</p>
                                <p className="text-xs mt-1 text-gray-400">{t('chat.noQuestions')}</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-tr-md'
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-md border border-gray-100 dark:border-slate-700'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-emerald prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0.5">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="leading-relaxed">{msg.content}</p>
                                        )}
                                        <span className={`text-[9px] mt-1 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-100 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                placeholder={t('chat.placeholder')}
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-sm"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !queryText.trim()}
                                className="absolute right-2 top-1.5 w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg flex items-center justify-center hover:shadow-md disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 transition-all"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </form>
                        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-widest">
                            Powered by KrishiSahay AI
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
