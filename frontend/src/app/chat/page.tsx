'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { useAuth } from '@/shared/providers/AuthProvider';
import { apiClient } from '@/shared/lib/axios';
import { getSocket } from '@/shared/lib/socket';
import { getMediaUrl } from '@/shared/lib/utils';
import { MessageSquare, Send, Users as UsersIcon, Plus } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');

  const fetchConversations = async () => {
    try {
      const res: any = await apiClient.get('/chat/conversations');
      setConversations(res.data || []);
      if (res.data && res.data.length > 0 && !activeConv) {
        setActiveConv(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFollowing = async () => {
    if (!user) return;
    try {
      const res: any = await apiClient.get(`/social/following/${user.id}`);
      setFollowingUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res: any = await apiClient.get(`/chat/messages/${convId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchFollowing();
      const socket = getSocket(user.id);
      socket.on('new_message', (msg: any) => {
        setMessages((prev) => [...prev, msg]);
      });
      return () => {
        socket.off('new_message');
      };
    }
  }, [user]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv]);

  const startConversationWithUser = async (targetUserId: string) => {
    try {
      const res: any = await apiClient.post(`/chat/conversation/${targetUserId}`);
      setActiveConv(res.data);
      setActiveTab('chats');
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    try {
      const res: any = await apiClient.post(`/chat/messages/${activeConv.id}`, {
        content: text,
      });
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-8 items-start h-[calc(100vh-100px)]">
      <Sidebar />

      <div className="flex-1 h-full flex gap-4 glass-card p-0 overflow-hidden border-surface-border">
        {/* Conversations & Following Users Sidebar */}
        <div className="w-80 border-r border-surface-border flex flex-col">
          <div className="p-3 border-b border-surface-border flex items-center justify-between">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'chats' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chats ({conversations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UsersIcon className="h-4 w-4" />
              <span>People</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-surface-border">
            {activeTab === 'chats' ? (
              conversations.length > 0 ? (
                conversations.map((conv) => {
                  const partner = conv.userOneId === user?.id ? conv.userTwo : conv.userOne;
                  const isActive = activeConv?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={`p-4 flex items-center gap-3 text-left transition ${
                        isActive ? 'bg-primary/15 border-l-4 border-primary' : 'hover:bg-surface/50'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm overflow-hidden border border-primary/30 shrink-0">
                        {partner?.profile?.avatar ? (
                          <img src={getMediaUrl(partner.profile.avatar)} alt={partner.username} className="h-full w-full object-cover" />
                        ) : (
                          partner?.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-white truncate">@{partner?.username}</span>
                        <span className="text-xs text-gray-400 truncate">{conv.lastMessageContent || 'Started a conversation'}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  No active conversations. Switch to "People" tab to message someone!
                </div>
              )
            ) : (
              followingUsers.length > 0 ? (
                followingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversationWithUser(u.id)}
                    className="p-3.5 flex items-center justify-between text-left hover:bg-surface/50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-xs overflow-hidden border border-secondary/30 shrink-0">
                        {u.profile?.avatar ? (
                          <img src={getMediaUrl(u.profile.avatar)} alt={u.username} className="h-full w-full object-cover" />
                        ) : (
                          u.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate group-hover:text-primary transition">
                          {u.profile?.fullName || u.username}
                        </span>
                        <span className="text-[10px] text-gray-400">@{u.username}</span>
                      </div>
                    </div>
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-semibold text-primary group-hover:bg-primary group-hover:text-white transition">
                      Message
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  You are not following anyone yet. Follow users to start chatting!
                </div>
              )
            )}
          </div>
        </div>

        {/* Message Window */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-surface/20">
            <div className="p-4 border-b border-surface-border font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Direct Conversation</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'self-end bg-gradient-to-r from-primary to-secondary text-white rounded-br-none'
                        : 'self-start bg-surface border border-surface-border text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <span>{msg.content}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-surface-border flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 rounded-xl border border-surface-border bg-surface/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a conversation or pick a person to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
