import React, { useEffect, useState } from 'react';
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
  };
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
            setPosts(fallbackData || []);
          } else {
            throw error;
          }
        } else {
          setPosts(data || []);
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
          setPosts(fallbackData || []);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Icon name="book-open" className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">最新博客</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Icon name="book-open" className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">最新博客</h2>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">加载失败</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Icon name="book-open" className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">最新博客</h2>
        </div>
        <a
          href="https://blog.familybank.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
        >
          查看全部
          <Icon name="arrow-right" className="w-4 h-4" />
        </a>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`https://blog.familybank.chat/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Icon name="user" className="w-3 h-3" />
                {post.profiles?.name || '未知作者'}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="clock" className="w-3 h-3" />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="eye" className="w-3 h-3" />
                {post.view_count}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <a
          href="https://blog.familybank.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm"
        >
          <Icon name="book-open" className="w-4 h-4" />
          访问博客
          <Icon name="external-link" className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
