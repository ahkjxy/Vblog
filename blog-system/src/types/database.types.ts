export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          bio: string | null
          avatar_url: string | null
          role: 'admin' | 'editor' | 'author'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'author'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'author'
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json
          excerpt: string | null
          status: 'draft' | 'published' | 'archived'
          author_id: string
          published_at: string | null
          scheduled_at: string | null
          view_count: number
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: Json
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id: string
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          author_id?: string
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      post_categories: {
        Row: {
          post_id: string
          category_id: string
        }
        Insert: {
          post_id: string
          category_id: string
        }
        Update: {
          post_id?: string
          category_id?: string
        }
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
