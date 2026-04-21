
import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { subscribeToPosts, createPost } from '../services/firestoreService';
import { auth } from '../lib/firebase';

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPosts(setPosts);
    return () => unsub();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaUrl.trim()) return;

    setIsPosting(true);
    const user = auth.currentUser;
    try {
      await createPost({
        content: newPostContent,
        mediaUrl,
        mediaType: mediaUrl ? mediaType : null,
        authorId: user?.uid,
        authorName: user?.displayName || 'Equipa Casa Mãe',
        authorPhoto: user?.photoURL,
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
    <div className="max-w-3xl mx-auto space-y-16 pb-32">
      {/* Creation Panel */}
      <div className="bg-surface-container border border-outline-variant/10 p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
        <div className="relative z-10">
          <div className="flex gap-6 items-start mb-8">
             <div className="w-14 h-14 bg-surface-bright border border-outline-variant/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xl grayscale">
                {auth.currentUser?.photoURL ? (
                  <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-headline italic text-primary text-2xl">{auth.currentUser?.displayName?.[0] || 'A'}</span>
                )}
             </div>
             <div className="flex-1">
                <textarea 
                  placeholder="Partilhe uma novidade da Casa Mãe..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-surface-bright/5 border border-outline-variant/10 p-6 text-on-surface font-headline italic text-xl focus:outline-none focus:border-primary/40 transition-all resize-none min-h-[140px] placeholder:text-on-surface-variant/20 tracking-wide"
                />
             </div>
          </div>
          
          {mediaUrl && (
            <div className="mb-8 relative rounded-sm overflow-hidden border border-outline-variant/10 grayscale hover:grayscale-0 transition-all duration-700">
               {mediaType === 'image' ? (
                 <img src={mediaUrl} alt="Preview" className="w-full max-h-[400px] object-cover" />
               ) : (
                 <div className="w-full h-[240px] bg-surface-bright flex items-center justify-center">
                    <Video size={48} className="text-primary/20" />
                 </div>
               )}
               <button 
                 onClick={() => setMediaUrl('')}
                 className="absolute top-6 right-6 p-2 bg-on-surface/80 text-surface hover:bg-primary transition-colors"
               >
                 <MoreHorizontal size={16} />
               </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-6">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const url = window.prompt("Image Visual URL:");
                    if (url) { setMediaUrl(url); setMediaType('image'); }
                  }}
                  className="p-3 text-on-surface-variant/40 hover:text-primary transition-all flex items-center gap-2 font-body text-[9px] uppercase tracking-widest italic"
                >
                   <Camera size={16} />
                   <span>Visual</span>
                </button>
                <button 
                  onClick={() => {
                    const url = window.prompt("Motion Content URL:");
                    if (url) { setMediaUrl(url); setMediaType('video'); }
                  }}
                  className="p-3 text-on-surface-variant/40 hover:text-primary transition-all flex items-center gap-2 font-body text-[9px] uppercase tracking-widest italic"
                >
                   <Video size={16} />
                   <span>Motion</span>
                </button>
             </div>
             <button 
               onClick={handlePost}
               disabled={isPosting || (!newPostContent.trim() && !mediaUrl.trim())}
               className="px-10 py-4 bg-on-surface text-surface font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all italic underline decoration-surface/20 underline-offset-8 disabled:opacity-30 disabled:pointer-events-none"
             >
                {isPosting ? 'A publicar...' : 'Publicar no Mural'}
             </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 opacity-30">
         <div className="h-px flex-1 bg-outline-variant/20"></div>
         <span className="font-body text-[9px] font-bold uppercase tracking-[0.4em] italic text-on-surface flex items-center gap-4">
            Narrativas Recentes
         </span>
         <div className="h-px flex-1 bg-outline-variant/20"></div>
      </div>

      {/* Feed */}
      <div className="space-y-24">
        {posts.length === 0 ? (
          <div className="text-center py-32 opacity-10 italic">
             <p className="font-headline text-3xl">O Mural aguarda a sua inspiração.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="relative group animate-fade-in">
               <div className="flex flex-col lg:flex-row gap-12 items-start">
                  <div className="lg:w-1/3 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-bright border border-outline-variant/10 flex items-center justify-center overflow-hidden grayscale shrink-0">
                           {post.authorPhoto ? (
                             <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <span className="font-headline italic text-primary text-lg">{post.authorName?.[0]}</span>
                           )}
                        </div>
                        <div>
                           <p className="font-headline italic text-lg text-on-surface leading-none">{post.authorName}</p>
                           <p className="font-body text-[8px] text-on-surface-variant/40 font-bold uppercase mt-1 tracking-widest italic">
                              {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Syncing...'}
                           </p>
                        </div>
                     </div>
                     <p className="font-headline italic text-2xl text-on-surface/90 leading-relaxed tracking-wide group-hover:text-primary transition-colors duration-500">
                        "{post.content}"
                     </p>
                     <div className="flex items-center gap-6 pt-4">
                        <button className="flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-all font-body uppercase text-[9px] tracking-widest italic group/btn">
                           <Heart size={14} className={cn("transition-transform group-hover/btn:scale-110", post.likes > 0 && "fill-primary text-primary")} />
                           {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-all font-body uppercase text-[9px] tracking-widest italic">
                           <MessageCircle size={14} />
                           Comentar
                        </button>
                     </div>
                  </div>

                  <div className="lg:w-2/3 w-full">
                    {post.mediaUrl && (
                      <div className="relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl">
                         {post.mediaType === 'image' ? (
                           <img src={post.mediaUrl} alt="" className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-[2000ms]" />
                         ) : (
                           <div className="w-full aspect-video bg-surface-container flex items-center justify-center border border-outline-variant/10">
                              <Video size={48} className="text-primary/10" />
                           </div>
                         )}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
