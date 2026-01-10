"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Paperclip, Image as ImageIcon, File as FileIcon, PlayCircle, X } from "lucide-react";
import { getSwapMessages, sendMessage, markMessagesAsRead } from "@/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    mediaUrl?: string;
    mediaType?: string;
    isRead: boolean;
    receiverId: string;
    sender: {
        name: string;
    };
}

// Optimized Message Item
const MessageItem = React.memo(({ msg, isMe, showAvatar, onViewImage }: { msg: Message, isMe: boolean, showAvatar: boolean, onViewImage: (url: string) => void }) => (
    <div className={cn("flex flex-col group animate-fade-in", isMe ? "items-end" : "items-start")}>
        <div className={cn("flex gap-3 max-w-[85%]", isMe && "flex-row-reverse")}>
            {!isMe && (
                <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar ? (
                        <Avatar className="w-8 h-8 border border-border shadow-sm">
                            <AvatarFallback className="text-[10px] font-bold bg-muted">{msg.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ) : <div className="w-8" />}
                </div>
            )}
            <div className={cn(
                "px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all group-hover:shadow-md overflow-hidden",
                isMe
                    ? "bg-primary text-white rounded-tr-none shadow-primary/10"
                    : "bg-muted text-foreground rounded-tl-none border border-border/50"
            )}>
                {msg.mediaUrl && (
                    <div className="mb-2 max-w-full rounded-xl overflow-hidden bg-black/5">
                        {msg.mediaType === "IMAGE" && (
                            <div onClick={() => onViewImage(msg.mediaUrl!)} className="block cursor-pointer cursor-zoom-in">
                                <img src={msg.mediaUrl} alt="attachment" className="max-w-full h-auto object-cover max-h-60 hover:opacity-90 transition-opacity" />
                            </div>
                        )}
                        {msg.mediaType === "VIDEO" && (
                            <video src={msg.mediaUrl} controls className="max-w-full max-h-60" />
                        )}
                        {msg.mediaType === "DOCUMENT" && (
                            <a
                                href={msg.mediaUrl}
                                download="document"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors group/doc"
                            >
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/doc:bg-primary group-hover/doc:text-white transition-all">
                                    <FileIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-black truncate max-w-[120px]">View Document</span>
                                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Click to open</span>
                                </div>
                            </a>
                        )}
                    </div>
                )}
                {msg.content}
            </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1 mx-11 px-1">
            <span className="text-[10px] font-bold text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-opacity",
                    msg.isRead ? "text-primary opacity-100" : "text-muted-foreground opacity-20"
                )}>
                    {msg.isRead ? "• Seen" : "• Sent"}
                </span>
            )}
        </div>
    </div>
));

MessageItem.displayName = "MessageItem";

export function ChatModal({
    swapId,
    currentUserId,
    otherUserName,
    triggerClassName
}: {
    swapId: string,
    currentUserId: string,
    otherUserName: string,
    triggerClassName?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string, type: "IMAGE" | "VIDEO" | "DOCUMENT", name: string } | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await getSwapMessages(swapId);
            setMessages(data as unknown as Message[]);
            // Mark as read when fetching if any are unread for us
            const hasUnread = data.some((m: any) => m.receiverId === currentUserId && !m.isRead);
            if (hasUnread) {
                await markMessagesAsRead(swapId);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, swapId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("swapId") === swapId && searchParams.get("tab") === "active-swaps") {
            setIsOpen(true);
        }
    }, [searchParams, swapId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation for 1MB Server Action Limit
        // Base64 encoding adds ~33% overhead, so we limit to ~800KB for safety
        if (file.size > 800 * 1024) {
            alert("File is too large! Please keep it under 800KB for safe transmission.");
            return;
        }

        // In a real app, you'd upload this to S3/Cloudinary.
        // For this demo, we'll use a local object URL or base64.
        const reader = new FileReader();
        reader.onload = (event) => {
            const url = event.target?.result as string;
            let type: "IMAGE" | "VIDEO" | "DOCUMENT" = "DOCUMENT";
            if (file.type.startsWith("image/")) type = "IMAGE";
            else if (file.type.startsWith("video/")) type = "VIDEO";

            setAttachment({ url, type, name: file.name });
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        setLoading(true);
        try {
            await sendMessage({
                swapId,
                content: newMessage,
                mediaUrl: attachment?.url,
                mediaType: attachment?.type
            });
            setNewMessage("");
            setAttachment(null);
            await fetchMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="relative group/chat">
                        <Button variant="outline" size="sm" className={cn("gap-2 rounded-xl px-5 font-bold transition-all hover:bg-primary/5 hover:text-primary active:scale-95 w-full h-full", triggerClassName)}>
                            <MessageSquare className="w-4 h-4" /> Message
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="chat-modal-content sm:max-w-[450px] max-sm:w-screen max-sm:h-screen max-sm:max-h-screen p-0 overflow-hidden sm:rounded-[3.2rem] max-sm:rounded-none border-none shadow-2xl haptic-touch">
                    <div className="flex flex-col h-[600px] max-sm:h-screen bg-background">
                        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20 backdrop-blur-xl">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                                            <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">{otherUserName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-black tracking-tight">{otherUserName}</DialogTitle>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online now</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full h-10 w-10 hover:bg-foreground/10 active:scale-95 transition-all text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 select-none">
                                        <MessageSquare className="w-16 h-16 mb-4" />
                                        <p className="font-black uppercase tracking-[0.2em] text-xs">No messages yet</p>
                                        <p className="text-[10px] mt-1">Start a conversation to coordinate your swap!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <MessageItem
                                            key={msg.id}
                                            msg={msg}
                                            isMe={msg.senderId === currentUserId}
                                            showAvatar={i === 0 || messages[i - 1].senderId !== msg.senderId}
                                            onViewImage={setViewingImage}
                                        />
                                    ))
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-6 bg-muted/20 border-t border-border/50 max-sm:sticky max-sm:bottom-0 max-sm:bg-background/95 max-sm:backdrop-blur-xl max-sm:pb-safe">
                            {attachment && (
                                <div className="mb-4 flex items-center justify-between p-3 bg-background rounded-2xl border border-primary/20 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3 truncate">
                                        {attachment.type === "IMAGE" ? <ImageIcon className="w-5 h-5 text-primary" /> : attachment.type === "VIDEO" ? <PlayCircle className="w-5 h-5 text-primary" /> : <FileIcon className="w-5 h-5 text-primary" />}
                                        <span className="text-xs font-bold truncate max-w-[200px]">{attachment.name}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => setAttachment(null)} className="h-8 w-8 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2 bg-background p-1.5 rounded-2xl border-2 border-border focus-within:border-primary transition-all shadow-sm">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary/10 text-primary transition-all"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message your partner..."
                                    disabled={loading}
                                    className="border-none focus-visible:ring-0 font-bold bg-transparent"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={loading || (!newMessage.trim() && !attachment)}
                                    className="h-10 w-10 shrink-0 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Viewer Modal */}
            <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
                <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
                    {viewingImage && (
                        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                            <img
                                src={viewingImage}
                                alt="Full preview"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                            />
                            <Button
                                className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto"
                                size="icon"
                                onClick={() => setViewingImage(null)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
