import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Icon } from './Icon';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  view_count: number;
  profiles: {
    name: string;
  } | null;
}

export function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // 先尝试查询带 review_status 的
      let query = supabase
        .from('posts')
        .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      // 尝试添加 review_status 过滤，如果字段不存在会失败
      try {
        const { data, error } = await query.eq('review_status', 'approved');
        if (error) {
          // 如果是字段不存在的错误，重新查询不带 review_status
          if (error.code === '42703') {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('posts')
              .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name)')
              .eq('status', 'published')
              .order('published_at', { ascending: false })
              .limit(3);
            
            if (fallbackError) throw fallbackError;
            setPosts(fallbackData as any || []);
          } else {
            throw error;
          }
        } else {
          setPosts(data as any || []);
        }
      } catch (queryError: any) {
        // 如果查询失败，尝试不带 review_status 的查询
        if (queryError.code === '42703') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('posts')
            .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name)')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(3);
          
          if (fallbackError) throw fallbackError;
          setPosts(fallbackData as any || []);
        } else {
          throw queryError;
        }
      }
    } catch (err: any) {
      console.error('加载博客文章失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-sm mobile-card flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">最新博客</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">分享家庭管理的智慧与经验</p>
          </div>
        </div>
        <div className="space-y-5 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-6 rounded-[28px] bg-gray-50/50 dark:bg-white/5">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-sm mobile-card flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">最新博客</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">分享家庭管理的智慧与经验</p>
          </div>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">加载失败</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-sm mobile-card flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">最新博客</h3>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">分享家庭管理的智慧与经验</p>
        </div>
        <a
          href="https://blog.familybank.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-black text-[#7C4DFF] uppercase tracking-wider hover:underline shrink-0"
        >
          查看全部
        </a>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`https://blog.familybank.chat/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-[28px] bg-gray-50/50 dark:bg-white/5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md"
          >
            <h3 className="font-black text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-base leading-snug">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <Icon name="user" size={14} className="flex-shrink-0" />
                {post.profiles?.name ? `${post.profiles.name}的家庭` : '未知作者'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="clock" size={14} className="flex-shrink-0" />
                {formatDate(post.published_at)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="eye" size={14} className="flex-shrink-0" />
                {post.view_count}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
        <a
          href="https://blog.familybank.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-900 dark:bg-white/10 text-white text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-all hover:shadow-lg"
        >
          <Icon name="book-open" className="w-4 h-4" />
          访问博客
          <Icon name="external-link" className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
