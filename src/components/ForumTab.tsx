import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldAlert, AlertTriangle, User, PlusCircle, Sparkles } from 'lucide-react';
import { ForumPost, ForumReply } from '../types.ts';

interface ForumTabProps {
  token: string | null;
  isOffline: boolean;
  language: 'en' | 'fr';
}

export default function ForumTab({
  token,
  isOffline,
  language,
}: ForumTabProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activeChannel, setActiveChannel] = useState<'tech' | 'business' | 'wellbeing'>('tech');
  const [loading, setLoading] = useState(true);

  // New post modal / state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Selected thread view
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replyText, setReplyText] = useState('');

  const t = {
    en: {
      channelsHeader: 'Channels',
      techLabel: '💻 Tech & Digital',
      businessLabel: '💼 Small Business & Finance',
      wellbeingLabel: '🌸 Wellbeing & Coaching',
      newPostBtn: 'Start Conversation',
      noPosts: 'No conversations in this channel yet. Be the first to start one!',
      authorBy: 'by',
      comments: 'Replies',
      writeCommentPlaceholder: 'Write a supportive reply...',
      sendBtn: 'Send Reply',
      reportBtn: 'Report',
      reportedMsg: 'Content reported and flagged for admin review.',
      titleLabel: 'Discussion Title',
      contentLabel: 'What do you want to ask or share?',
      submitPost: 'Publish Discussion',
      close: 'Cancel',
      demoAd: 'Join the sisterhood discussion! Post questions, share merchant MoMo setup tips, and build community together.',
    },
    fr: {
      channelsHeader: 'Canaux',
      techLabel: '💻 Tech et Numérique',
      businessLabel: '💼 Entreprise et Finance',
      wellbeingLabel: '🌸 Bien-être et Confiance',
      newPostBtn: 'Lancer une discussion',
      noPosts: 'Aucune discussion. Lancer le premier sujet !',
      authorBy: 'par',
      comments: 'Réponses',
      writeCommentPlaceholder: 'Rédiger une réponse d\'encouragement...',
      sendBtn: 'Envoyer',
      reportBtn: 'Signaler',
      reportedMsg: 'Contenu signalé et envoyé en modération.',
      titleLabel: 'Titre de la Discussion',
      contentLabel: 'Que souhaitez-vous partager ou demander ?',
      submitPost: 'Publier',
      close: 'Annuler',
      demoAd: 'Rejoignez les discussions ! Posez des questions, échangez des conseils MoMo et soutenez-vous.',
    }
  }[language];

  useEffect(() => {
    fetchPosts();
  }, [activeChannel, token, isOffline]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        const stored = localStorage.getItem('herrise_forum_cache');
        if (stored) {
          const cached = JSON.parse(stored) as ForumPost[];
          setPosts(cached.filter(p => p.channel === activeChannel && !p.isFlagged));
        }
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/forum?channel=${activeChannel}`);
      const data = await res.json();
      setPosts(data);
      localStorage.setItem('herrise_forum_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent || !token) return;

    try {
      if (isOffline) {
        const newPost: ForumPost = {
          id: 'post_offline_' + Date.now(),
          authorId: 'offline_user',
          authorName: 'Aisha Umutesi',
          authorRole: 'learner',
          channel: activeChannel,
          title: newPostTitle,
          content: newPostContent,
          replies: [],
          reportsCount: 0,
          isFlagged: false,
          createdAt: new Date().toISOString(),
        };

        const stored = localStorage.getItem('herrise_forum_cache');
        let cached = stored ? JSON.parse(stored) : [];
        cached.push(newPost);
        localStorage.setItem('herrise_forum_cache', JSON.stringify(cached));

        setPosts(cached.filter((p: any) => p.channel === activeChannel));
        setNewPostTitle('');
        setNewPostContent('');
        setShowCreatePost(false);
        return;
      }

      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          channel: activeChannel,
        })
      });

      const data = await res.json();
      setPosts([data, ...posts]);
      
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedPost || !token) return;

    try {
      if (isOffline) {
        const newReply: ForumReply = {
          id: 'rep_offline_' + Date.now(),
          postId: selectedPost.id,
          authorId: 'offline_user',
          authorName: 'Aisha Umutesi',
          authorRole: 'learner',
          content: replyText,
          reportsCount: 0,
          isFlagged: false,
          createdAt: new Date().toISOString(),
        };

        const stored = localStorage.getItem('herrise_forum_cache');
        let cached = stored ? JSON.parse(stored) : [];
        cached = cached.map((p: any) => {
          if (p.id === selectedPost.id) {
            p.replies.push(newReply);
          }
          return p;
        });

        localStorage.setItem('herrise_forum_cache', JSON.stringify(cached));
        setSelectedPost({ ...selectedPost, replies: [...selectedPost.replies, newReply] });
        setReplyText('');
        fetchPosts();
        return;
      }

      const res = await fetch(`/api/forum/${selectedPost.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });
      const data = await res.json();

      setSelectedPost(data);
      setReplyText('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportContent = async (postId: string, replyId?: string) => {
    try {
      if (isOffline) {
        alert(t.reportedMsg);
        return;
      }

      const res = await fetch('/api/forum/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId, replyId })
      });

      if (res.ok) {
        alert(t.reportedMsg);
        fetchPosts();
        if (selectedPost) {
          setSelectedPost(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="forum-board-panel">
      
      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="create-post-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-emerald-700" />
              <span>{t.newPostBtn}</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t.titleLabel}</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. Any advice on drafting my agribusiness marketing plan?"
                  required
                  className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none focus:border-emerald-600"
                  style={{ minHeight: '40px' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t.contentLabel}</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share details of your draft or ask questions..."
                  required
                  className="w-full p-3 border border-slate-200 text-xs rounded-lg focus:outline-none focus:border-emerald-600"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {t.submitPost}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns - Channels & Posts List (Span 8 or 12 if active post selected) */}
        <div className={selectedPost ? 'lg:col-span-6 space-y-6' : 'lg:col-span-8 space-y-6'} id="channels-and-topics">
          
          <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Support Sisterhood
              </span>
              <h2 className="text-lg font-black tracking-tight">{language === 'en' ? 'Community Forum' : 'Forum de Discussion'}</h2>
            </div>

            {token && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                style={{ minHeight: '40px' }}
                id="start-discussion-btn"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.newPostBtn}</span>
              </button>
            )}
          </div>

          {/* Channel buttons */}
          <div className="flex gap-2.5 overflow-x-auto pb-1" id="forum-channels-scroller">
            {['tech', 'business', 'wellbeing'].map((ch) => {
              const label = ch === 'tech' ? t.techLabel : ch === 'business' ? t.businessLabel : t.wellbeingLabel;
              const isSelected = activeChannel === ch;
              return (
                <button
                  key={ch}
                  onClick={() => {
                    setActiveChannel(ch as any);
                    setSelectedPost(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ minHeight: '44px' }}
                  id={`channel-tab-${ch}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="py-12 text-center" id="forum-loading-state">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-xs">{language === 'en' ? 'Loading community topics...' : 'Chargement...'}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl" id="forum-empty-state">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-xs px-4 leading-relaxed max-w-sm mx-auto">{t.noPosts}</p>
            </div>
          ) : (
            <div className="space-y-4" id="forum-posts-grid">
              {posts.map((post) => {
                const isSelected = selectedPost?.id === post.id;
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-left space-y-3 ${
                      isSelected ? 'border-emerald-600 bg-emerald-50/20 shadow-sm' : 'border-slate-200'
                    }`}
                    id={`post-card-${post.id}`}
                  >
                    {/* Post Meta */}
                    <div className="flex gap-3 items-center text-xs">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {post.authorName}
                          <span className="text-[10px] text-slate-400 font-normal ml-1.5 uppercase bg-slate-100 py-0.5 px-2 rounded-full font-bold">
                            {post.authorRole}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-black text-slate-950 text-sm tracking-tight leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 py-1 px-2.5 rounded-lg text-slate-600">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.replies.length} {t.comments}</span>
                      </span>

                      {/* Report button */}
                      {token && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportContent(post.id);
                          }}
                          className="text-rose-500 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50"
                          title="Report toxic/inappropriate content"
                          id={`report-post-btn-${post.id}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{t.reportBtn}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Columns - Thread replies detail view (Span 6 if active thread) */}
        {selectedPost && (
          <div className="lg:col-span-6 space-y-6" id="discussion-thread-replies">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              
              {/* Main selected post */}
              <div className="space-y-3 pb-4 border-b border-slate-100 text-left">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full uppercase mb-2 cursor-pointer"
                  id="close-thread-btn"
                >
                  &larr; Back to channel list
                </button>
                <h3 className="font-black text-slate-950 text-sm tracking-tight leading-tight">
                  {selectedPost.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 font-bold">
                  <span>Posted by {selectedPost.authorName} ({selectedPost.authorRole})</span>
                  <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Replies List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 tracking-tight text-xs uppercase text-slate-500 tracking-wider">
                  {selectedPost.replies.length} {t.comments}
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="replies-scroller">
                  {selectedPost.replies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className="p-3 rounded-xl border border-slate-150 bg-slate-50 text-xs text-left space-y-2 relative"
                      id={`reply-item-${reply.id}`}
                    >
                      <div className="flex gap-2 items-center text-[10px] text-slate-500 font-bold">
                        <span className="text-slate-700">{reply.authorName}</span>
                        <span className="text-[8px] bg-slate-200 py-0.5 px-1.5 rounded-full font-bold uppercase">{reply.authorRole}</span>
                        <span className="ml-auto font-normal text-[9px]">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line">
                        {reply.content}
                      </p>

                      {/* Report comment */}
                      {token && (
                        <button
                          onClick={() => handleReportContent(selectedPost.id, reply.id)}
                          className="absolute bottom-2 right-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Report inappropriate content"
                          id={`report-reply-btn-${reply.id}`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Input Form */}
              {token ? (
                <form onSubmit={handleCreateReply} className="pt-4 border-t border-slate-100 flex gap-2" id="reply-input-form">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.writeCommentPlaceholder}
                    required
                    className="flex-grow px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none bg-slate-50 focus:bg-white"
                    style={{ minHeight: '40px' }}
                    id="reply-input-field"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-850 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                    style={{ minHeight: '40px', minWidth: '40px' }}
                    id="submit-reply-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : null}

            </div>
          </div>
        )}

        {/* Sidebar Guidelines (Span 4, hides if Thread active) */}
        {!selectedPost && (
          <div className="lg:col-span-4 space-y-6" id="forum-guidelines-sidebar">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs text-left space-y-3">
              <h3 className="font-black text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-200 shrink-0" />
                <span>{language === 'en' ? 'Community Guidelines' : 'Charte du Forum'}</span>
              </h3>
              <p className="text-amber-800 leading-relaxed leading-normal text-[11px]">
                {t.demoAd}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-850">
                <li>Be supportive and respect each member’s journey.</li>
                <li>Zero-tolerance for toxic comment threads, scams, or abuse.</li>
                <li>Flagged posts (3+ flags) are auto-hidden instantly.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
