# Blog System Migration: Next.js → Nuxt.js

## Project Overview
- **Current**: Next.js 15 (App Router) + React + Tailwind CSS + Supabase
- **Target**: Nuxt 3 (latest) + Vue 3 + Tailwind CSS + Supabase
- **Package Manager**: yarn

## Route Mapping (Next.js → Nuxt.js)

### Frontend Pages
| Next.js Route | Nuxt.js Route | Type |
|---|---|---|
| `(frontend)/page.tsx` | `pages/index.vue` | SSR (data fetch) |
| `(frontend)/blog/page.tsx` | `pages/blog/index.vue` | SSR |
| `(frontend)/blog/[slug]/page.tsx` | `pages/blog/[slug].vue` | SSR + SEO |
| `(frontend)/categories/page.tsx` | `pages/categories/index.vue` | SSR |
| `(frontend)/categories/[slug]/page.tsx` | `pages/categories/[slug].vue` | SSR |
| `(frontend)/tags/page.tsx` | `pages/tags/index.vue` | SSR |
| `(frontend)/tags/[slug]/page.tsx` | `pages/tags/[slug].vue` | SSR |
| `(frontend)/about/page.tsx` | `pages/about.vue` | Static |
| `(frontend)/contact/page.tsx` | `pages/contact.vue` | Static |
| `(frontend)/changelog/page.tsx` | `pages/changelog.vue` | Static |
| `(frontend)/docs/page.tsx` | `pages/docs.vue` | Static |
| `(frontend)/api/page.tsx` | `pages/api-docs.vue` | Static |
| `(frontend)/privacy/page.tsx` | `pages/privacy.vue` | Static |
| `(frontend)/support/page.tsx` | `pages/support.vue` | Client-side |

### Auth Pages
| Next.js Route | Nuxt.js Route |
|---|---|
| `auth/unified/page.tsx` | `pages/auth/unified.vue` |
| `auth/callback/route.ts` | `server/api/auth/callback.get.ts` |
| `auth/page.tsx` | `pages/auth/index.vue` |

### Dashboard Pages
| Next.js Route | Nuxt.js Route |
|---|---|
| `dashboard/page.tsx` | `pages/dashboard/index.vue` |
| `dashboard/posts/page.tsx` | `pages/dashboard/posts/index.vue` |
| `dashboard/posts/new/page.tsx` | `pages/dashboard/posts/new.vue` |
| `dashboard/posts/[id]/edit/page.tsx` | `pages/dashboard/posts/[id]/edit.vue` |
| `dashboard/posts/[id]/review/page.tsx` | `pages/dashboard/posts/[id]/review.vue` |
| `dashboard/categories/page.tsx` | `pages/dashboard/categories.vue` |
| `dashboard/tags/page.tsx` | `pages/dashboard/tags.vue` |
| `dashboard/comments/page.tsx` | `pages/dashboard/comments.vue` |
| `dashboard/media/page.tsx` | `pages/dashboard/media.vue` |
| `dashboard/settings/page.tsx` | `pages/dashboard/settings.vue` |
| `dashboard/users/page.tsx` | `pages/dashboard/users.vue` |
| `dashboard/feedback/page.tsx` | `pages/dashboard/feedback.vue` |

## Component Mapping
| React Component | Vue Component |
|---|---|
| `layout/Header.tsx` | `components/layout/AppHeader.vue` |
| `layout/Footer.tsx` | `components/layout/AppFooter.vue` |
| `CustomerSupport.tsx` | `components/CustomerSupport.vue` |
| `Comments.tsx` | `components/Comments.vue` |
| `MarkdownContent.tsx` | `components/MarkdownContent.vue` |
| `Logo.tsx` | `components/Logo.vue` |
| `FamilyBankCTA.tsx` | `components/FamilyBankCTA.vue` |
| `PublicWelfareNotice.tsx` | `components/PublicWelfareNotice.vue` |
| `JsonLd.tsx` | Via `useHead()` |
| `ads/*` | `components/ads/*` |
| `dashboard/*` | `components/dashboard/*` |
| `editor/*` | `components/editor/*` |
| `ui/*` | `components/ui/*` |

## Key Architecture Decisions

### Supabase Integration
- Use `@nuxtjs/supabase` module for seamless SSR integration
- Auto-handles cookie-based auth for SSR
- No more manual cookie config needed

### Auth Middleware
- Use Nuxt route middleware instead of Next.js middleware
- `middleware/auth.ts` for dashboard protection

### Data Fetching
- `useAsyncData()` / `useFetch()` replaces React Server Components
- All data fetching is SSR-first by default in Nuxt

### SEO
- `useHead()` / `useSeoMeta()` replaces Next.js Metadata API
- `defineSEOConfig` in `nuxt.config.ts` for defaults

### Layouts
- `layouts/default.vue` for frontend (Header + Footer + CustomerSupport)
- `layouts/dashboard.vue` for dashboard (Sidebar + TopBar)
- `layouts/auth.vue` for auth pages (minimal)

## Execution Order
1. Backup current project
2. Initialize Nuxt 3 project in-place
3. Core infrastructure (Supabase, Tailwind, config)
4. Layouts + base components
5. Frontend pages (static first, then data-driven)
6. Auth system
7. Dashboard pages
8. Remaining components (comments, customer support, ads, editor)
