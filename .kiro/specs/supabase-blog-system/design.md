# Design Document: Supabase Blog System

## Overview

The Supabase Blog System is a modern, full-stack blogging platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase. The architecture follows a serverless approach with clear separation between frontend presentation, backend logic, and data persistence.

The system leverages Supabase's integrated services:
- **PostgreSQL Database**: Structured relational data with full-text search
- **Authentication**: Built-in auth with email/password and OAuth providers
- **Storage**: Object storage for media files
- **Real-time**: WebSocket subscriptions for live updates
- **Edge Functions**: Serverless functions for custom backend logic

The frontend uses Next.js 14's App Router with a hybrid rendering strategy: SSR for public-facing pages (SEO optimization) and client-side rendering for interactive dashboard components. The design emphasizes type safety through TypeScript and Supabase's generated types, security through Row Level Security policies, and user experience through real-time updates and responsive design.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Public Pages  │  │   Dashboard    │  │  Auth Pages   │ │
│  │  (SSR/Static)  │  │   (Client)     │  │   (Client)    │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                     │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │   Middleware   │  │  API Routes    │  │  Server       │ │
│  │  (Auth/RBAC)   │  │                │  │  Components   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Layer                          │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │ PostgreSQL │  │   Auth   │  │ Storage │  │    Edge    │ │
│  │  + RLS     │  │ Service  │  │ Buckets │  │ Functions  │ │
│  └────────────┘  └──────────┘  └─────────┘  └────────────┐ │
│                                                             │ │
│  ┌──────────────────────────────────────────────────────┐  │ │
│  │              Real-time Subscriptions                 │  │ │
│  └──────────────────────────────────────────────────────┘  │ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

**Public Content Retrieval (SSR)**:
1. User requests post page → Next.js server component
2. Server component queries Supabase with service role key
3. RLS policies filter data based on published status
4. Server renders HTML with post content
5. HTML sent to client with hydration data

**Authenticated Operations (Client)**:
1. User performs action in dashboard → Client component
2. Client component calls Supabase client with user session
3. RLS policies validate user permissions
4. Database operation succeeds or fails based on policy
5. Client receives response and updates UI

**Real-time Updates**:
1. Client establishes WebSocket connection to Supabase
2. Client subscribes to specific table changes
3. Database change triggers real-time notification
4. Client receives update and re-renders affected components

### Security Model

**Authentication Flow**:
- Supabase Auth manages sessions with JWT tokens
- Tokens stored in HTTP-only cookies (server) and localStorage (client)
- Middleware validates tokens on protected routes
- Session refresh handled automatically by Supabase client

**Authorization via RLS**:
- All database access filtered through RLS policies
- Policies check `auth.uid()` and user role from profiles table
- Service role key bypasses RLS (used only in trusted server contexts)
- Client operations always subject to RLS

**Role Hierarchy**:
- **Admin**: Full access to all operations
- **Editor**: Content management, user viewing, no user role changes
- **Author**: Create/edit own posts, view published content
- **Authenticated User**: Comment on posts, manage own profile
- **Anonymous**: View published content only

## Components and Interfaces

### Database Schema

**profiles table**:
```typescript
interface Profile {
  id: string;              // UUID, references auth.users(id)
  username: string;        // Unique, not null
  email: string;           // Not null
  bio: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'author';  // Default: 'author'
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}
```

**posts table**:
```typescript
interface Post {
  id: string;              // UUID, primary key
  title: string;           // Not null
  slug: string;            // Unique, not null
  content: JSONContent;    // JSONB, TipTap document
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';  // Default: 'draft'
  author_id: string;       // UUID, references profiles(id)
  published_at: string | null;  // Timestamp
  scheduled_at: string | null;  // Timestamp
  view_count: number;      // Default: 0
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}
```

**categories table**:
```typescript
interface Category {
  id: string;              // UUID, primary key
  name: string;            // Unique, not null
  slug: string;            // Unique, not null
  description: string | null;
  created_at: string;      // Timestamp
}
```

**tags table**:
```typescript
interface Tag {
  id: string;              // UUID, primary key
  name: string;            // Unique, not null
  slug: string;            // Unique, not null
  created_at: string;      // Timestamp
}
```

**post_categories table**:
```typescript
interface PostCategory {
  post_id: string;         // UUID, references posts(id)
  category_id: string;     // UUID, references categories(id)
  // Primary key: (post_id, category_id)
}
```

**post_tags table**:
```typescript
interface PostTag {
  post_id: string;         // UUID, references posts(id)
  tag_id: string;          // UUID, references tags(id)
  // Primary key: (post_id, tag_id)
}
```

**comments table**:
```typescript
interface Comment {
  id: string;              // UUID, primary key
  post_id: string;         // UUID, references posts(id)
  user_id: string;         // UUID, references profiles(id)
  content: string;         // Not null
  status: 'pending' | 'approved' | 'rejected';  // Default: 'pending'
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}
```

**settings table**:
```typescript
interface Settings {
  id: string;              // UUID, primary key
  key: string;             // Unique, not null
  value: string;           // JSONB
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}
```

### Database Indexes

```sql
-- Posts table indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || excerpt));

-- Comments table indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_status ON comments(status);

-- Junction table indexes
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
```

### Row Level Security Policies

**profiles table**:
```sql
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**posts table**:
```sql
-- Published posts viewable by everyone
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

-- Authors can view their own drafts
CREATE POLICY "Authors can view own drafts"
  ON posts FOR SELECT
  USING (author_id = auth.uid());

-- Editors and admins can view all posts
CREATE POLICY "Editors and admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Authors can insert posts
CREATE POLICY "Authors can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
    )
  );

-- Authors can update own posts, editors can update any
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**categories and tags tables**:
```sql
-- Everyone can view categories and tags
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Editors and admins can manage categories
CREATE POLICY "Editors can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Same policies for tags
```

**comments table**:
```sql
-- Approved comments on published posts are viewable
CREATE POLICY "Approved comments are viewable"
  ON comments FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND status = 'published'
    )
  );

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own comments, admins can update any
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete own comments, admins can delete any
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Supabase Client Configuration

**Server-side client (for Server Components and API Routes)**:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

**Client-side client (for Client Components)**:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Service role client (for privileged operations)**:
```typescript
import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

### Frontend Components Structure

**App Router Structure**:
```
app/
├── (frontend)/              # Public-facing pages
│   ├── layout.tsx          # Public layout with header/footer
│   ├── page.tsx            # Homepage (post list)
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx    # Post detail page (SSR)
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx    # Category page (SSR)
│   └── tags/
│       └── [slug]/
│           └── page.tsx    # Tag page (SSR)
├── (dashboard)/            # Admin dashboard
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Dashboard overview
│   ├── posts/
│   │   ├── page.tsx        # Post list
│   │   ├── new/
│   │   │   └── page.tsx    # Create post
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx # Edit post
│   ├── media/
│   │   └── page.tsx        # Media library
│   ├── categories/
│   │   └── page.tsx        # Category management
│   ├── tags/
│   │   └── page.tsx        # Tag management
│   ├── comments/
│   │   └── page.tsx        # Comment moderation
│   ├── users/
│   │   └── page.tsx        # User management
│   └── settings/
│       └── page.tsx        # System settings
├── auth/
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── signup/
│   │   └── page.tsx        # Signup page
│   └── callback/
│       └── route.ts        # OAuth callback handler
├── api/
│   ├── posts/
│   │   └── [id]/
│   │       └── views/
│   │           └── route.ts # Increment view count
│   └── search/
│       └── route.ts        # Search API
└── middleware.ts           # Auth and RBAC middleware
```

**Key Component Interfaces**:

```typescript
// Rich Text Editor Component
interface EditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  onImageUpload: (file: File) => Promise<string>;
}

// Post Form Component
interface PostFormProps {
  post?: Post;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: PostFormData) => Promise<void>;
  onSaveDraft: (data: PostFormData) => Promise<void>;
}

interface PostFormData {
  title: string;
  content: JSONContent;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  scheduled_at?: string;
  category_ids: string[];
  tag_ids: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

// Media Upload Component
interface MediaUploadProps {
  onUpload: (file: File) => Promise<string>;
  accept: string;
  maxSize: number;
}

// Comment Component
interface CommentProps {
  comment: Comment;
  author: Profile;
  onDelete?: () => Promise<void>;
  onApprove?: () => Promise<void>;
}

// Search Component
interface SearchProps {
  onSearch: (query: string) => void;
  placeholder: string;
}
```

### Middleware Implementation

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check role for dashboard access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
```

## Data Models

### Type Generation

Use Supabase CLI to generate TypeScript types:

```bash
npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
```

Generated types provide full type safety:

```typescript
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];
```

### TipTap Document Structure

Posts store content as TipTap JSON:

```typescript
interface JSONContent {
  type: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  text?: string;
}

// Example post content
const exampleContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'My Blog Post' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'bold text' },
        { type: 'text', text: '.' }
      ]
    },
    {
      type: 'image',
      attrs: {
        src: 'https://example.com/image.jpg',
        alt: 'Description'
      }
    }
  ]
};
```

### Slug Generation

Slugs are URL-friendly identifiers generated from titles:

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/[\s_-]+/g, '-')   // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
}

async function ensureUniqueSlug(baseSlug: string, postId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', postId || '')
      .single();
    
    if (!data) return slug;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
```

### Search Implementation

Full-text search using PostgreSQL:

```typescript
async function searchPosts(query: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(*), categories(*), tags(*)')
    .eq('status', 'published')
    .textSearch('title_content_search', query, {
      type: 'websearch',
      config: 'english'
    })
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

Database function for search:
```sql
CREATE FUNCTION posts_search(search_query text)
RETURNS SETOF posts AS $$
  SELECT *
  FROM posts
  WHERE status = 'published'
    AND to_tsvector('english', title || ' ' || excerpt) @@ websearch_to_tsquery('english', search_query)
  ORDER BY ts_rank(to_tsvector('english', title || ' ' || excerpt), websearch_to_tsquery('english', search_query)) DESC;
$$ LANGUAGE sql STABLE;
```

### Real-time Subscriptions

```typescript
// Subscribe to new published posts
const subscription = supabase
  .channel('public-posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'status=eq.published'
    },
    (payload) => {
      console.log('New post published:', payload.new);
      // Update UI with new post
    }
  )
  .subscribe();

// Subscribe to comment approvals for a specific post
const commentSubscription = supabase
  .channel(`post-${postId}-comments`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'comments',
      filter: `post_id=eq.${postId}`
    },
    (payload) => {
      if (payload.new.status === 'approved') {
        // Add approved comment to UI
      }
    }
  )
  .subscribe();
```

### Storage Configuration

```typescript
// Create storage bucket for media
// Run once during setup
await supabase.storage.createBucket('media', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
});

// Upload image
async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

// Delete image
async function deleteImage(url: string): Promise<void> {
  const path = url.split('/media/')[1];
  
  const { error } = await supabase.storage
    .from('media')
    .remove([path]);
  
  if (error) throw error;
}
```

