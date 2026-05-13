
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Send, 
  Heart, 
  Share2, 
  MessageCircle, 
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Activity,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { subscribeToPosts, createPost } from '../services/firestoreService';
import { supabase } from '../lib/supabase';

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = subscribeToPosts(setPosts);
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    return () => unsub();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaUrl.trim()) return;

    setIsPosting(true);
    try {
      await createPost({
        content: newPostContent,
        mediaUrl,
        mediaType: mediaUrl ? mediaType : null,
        authorId: currentUser?.id,
        authorName: currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'Equipa Casa Mãe',
        authorPhoto: currentUser?.user_metadata?.avatar_url,
        likes: 0
      });
      setNewPostContent('');
      setMediaUrl('');
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-20 pb-40">
      {/* Creation Panel - Command Style */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 relative overflow-hidden group rounded-3xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <div className="flex gap-8 items-start mb-10">
             <div className="w-16 h-16 bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl relative rounded-2xl group-hover:rotate-6 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-50"></div>
                {currentUser?.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-headline italic text-primary text-3xl font-bold">{(currentUser?.user_metadata?.display_name?.[0] || currentUser?.email?.[0] || 'A').toUpperCase()}</span>
                )}
             </div>
             <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="font-body text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">New Operational Intel</span>
                   <Activity size={14} className="text-primary/20 animate-pulse" />
                </div>
                <textarea 
                  placeholder="DIGITE AQUI A SUA NARRATIVA..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 p-8 text-white font-headline italic text-2xl focus:outline-none focus:border-primary/20 focus:bg-white/[0.04] transition-all resize-none min-h-[160px] placeholder:text-white/10 tracking-tight rounded-2xl shadow-inner"
                />
             </div>
          </div>
          
          <AnimatePresence>
            {mediaUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-10 relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl group/media"
              >
                 {mediaType === 'image' ? (
                   <img src={mediaUrl} alt="Preview" className="w-full max-h-[440px] object-cover transition-transform duration-1000 group-hover/media:scale-105" />
                 ) : (
                   <div className="w-full h-[300px] bg-white/[0.02] flex items-center justify-center">
                      <Video size={64} className="text-primary/20 animate-pulse" />
                   </div>
                 )}
                 <button 
                   onClick={() => setMediaUrl('')}
                   className="absolute top-8 right-8 p-3 bg-black/60 text-white hover:bg-red-500 transition-all rounded-xl backdrop-blur-md"
                 >
                   <X size={18} />
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-8 pt-8 border-t border-white/5">
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => {
                    const url = window.prompt("Image Assets URL:");
                    if (url) { setMediaUrl(url); setMediaType('image'); }
                  }}
                  className="group flex items-center gap-4 text-white/30 hover:text-primary transition-all p-2"
                >
                   <div className="p-3 bg-white/[0.03] rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Camera size={18} />
                   </div>
                   <div className="flex flex-col items-start">
                      <span className="font-body text-[9px] font-black uppercase tracking-[0.3em]">IMAGENS</span>
                      <span className="text-[8px] font-mono opacity-40">VIS_DATA</span>
                   </div>
                </button>
                <button 
                  onClick={() => {
                    const url = window.prompt("Motion Capture URL:");
                    if (url) { setMediaUrl(url); setMediaType('video'); }
                  }}
                  className="group flex items-center gap-4 text-white/30 hover:text-secondary transition-all p-2"
                >
                   <div className="p-3 bg-white/[0.03] rounded-xl group-hover:bg-secondary/20 transition-colors">
                      <Video size={18} />
                   </div>
                   <div className="flex flex-col items-start">
                      <span className="font-body text-[9px] font-black uppercase tracking-[0.3em]">VÍDEOS</span>
                      <span className="text-[8px] font-mono opacity-40">MOT_STREAM</span>
                   </div>
                </button>
             </div>
             <button 
               onClick={handlePost}
               disabled={isPosting || (!newPostContent.trim() && !mediaUrl.trim())}
               className="px-12 py-5 bg-primary text-white font-black text-[11px] font-mono uppercase tracking-[0.5em] hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-30 rounded-2xl relative overflow-hidden group/btn"
             >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                <span className="relative z-10">{isPosting ? 'DEPLOYING...' : 'PUBLISH ASSET'}</span>
             </button>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-8 px-4">
         <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
         <span className="font-body text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic flex items-center gap-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
            OPERATIONAL_INTEL_STREAM
         </span>
         <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Feed */}
      <div className="space-y-32">
        {posts.length === 0 ? (
          <div className="text-center py-40">
             <p className="font-headline text-5xl text-white/5 italic font-black uppercase tracking-tighter">No Reports Found</p>
             <p className="font-body text-[10px] uppercase tracking-[0.4em] text-white/5 mt-6 font-bold">Aguardando Primeira Transmissão</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative group bg-white/[0.01] hover:bg-white/[0.02] transition-colors p-1"
            >
               <div className="flex flex-col lg:flex-row gap-16 items-stretch">
                  <div className="lg:w-2/5 space-y-10 flex flex-col justify-center">
                     <div className="space-y-4">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-white/[0.04] border border-white/10 flex items-center justify-center overflow-hidden grayscale rounded-xl">
                              {post.authorPhoto ? (
                                <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-headline italic text-primary text-xl font-bold">{post.authorName?.[0]?.toUpperCase()}</span>
                              )}
                           </div>
                           <div>
                              <p className="font-headline italic text-2xl text-white leading-none font-bold tracking-tight">{post.authorName}</p>
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="text-[8px] font-mono text-primary uppercase tracking-widest">{post.authorId?.slice(0, 8)}</span>
                                 <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                 <p className="font-body text-[8px] text-white/30 font-bold uppercase tracking-widest">
                                    {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleTimeString() : 'SYNCHRONIZING'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="relative">
                        {/* Quote design */}
                        <div className="absolute -left-8 top-0 text-7xl font-headline italic text-primary opacity-5 select-none">"</div>
                        <p className="font-headline italic text-3xl text-white leading-snug tracking-tight group-hover:text-primary transition-colors duration-700 relative z-10">
                           {post.content}
                        </p>
                     </div>

                     <div className="flex items-center gap-10 pt-10 border-t border-white/5">
                        <button className="flex items-center gap-3 text-white/20 hover:text-primary transition-all font-mono uppercase text-[10px] tracking-widest font-bold group/like">
                           <Heart size={18} className={cn("transition-transform duration-500 group-hover/like:scale-125", post.likes > 0 && "fill-primary text-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]")} />
                           <span>{post.likes || 0} APPROVALS</span>
                        </button>
                        <button className="flex items-center gap-3 text-white/20 hover:text-white transition-all font-mono uppercase text-[10px] tracking-widest font-bold">
                           <MessageCircle size={18} />
                           <span>COMMANDS</span>
                        </button>
                     </div>
                  </div>

                  <div className="lg:w-3/5 w-full">
                    {post.mediaUrl ? (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/5"
                      >
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-12">
                            <p className="font-mono text-primary text-[10px] tracking-widest font-black uppercase mb-2">INTEL_VISUAL_STREAM</p>
                            <h4 className="font-headline text-2xl text-white italic font-bold">Registro de Auditoria #{idx + 1}</h4>
                         </div>
                         {post.mediaType === 'image' ? (
                           <img src={post.mediaUrl} alt="" className="w-full aspect-[4/5] object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-[2000ms]" />
                         ) : (
                           <div className="w-full aspect-[4/5] bg-neutral-900 flex items-center justify-center">
                              <Video size={64} className="text-white/5" />
                           </div>
                         )}
                      </motion.div>
                    ) : (
                      <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center bg-white/[0.01]">
                         <Activity size={40} className="text-white/5" />
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
