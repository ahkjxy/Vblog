import { Code, Zap, Lock, Database, Cloud, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function APIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Code className="w-4 h-4" />
              API 文档
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              元气银行 API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              强大的 RESTful API，让您轻松集成元气银行功能
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Overview */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">API 概览</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                元气银行提供完整的 RESTful API，支持所有核心功能的编程访问。
                基于 Supabase 构建，提供实时数据同步、安全认证和高性能查询。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'REST', desc: '标准 RESTful API' },
                  { label: '实时', desc: 'WebSocket 实时订阅' },
                  { label: '安全', desc: 'JWT 认证 + RLS' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl font-bold mb-2">{item.label}</div>
                    <div className="text-sm text-white/90">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">核心特性</h2>
              <p className="text-gray-600 text-lg">企业级的API功能和安全保障</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Lock,
                  title: '安全认证',
                  desc: '基于 JWT 的安全认证机制，支持多种认证方式。所有 API 请求都经过严格的权限验证。',
                  gradient: 'from-purple-100 to-pink-100',
                  color: 'text-purple-600'
                },
                {
                  icon: Database,
                  title: '行级安全',
                  desc: 'PostgreSQL RLS 策略确保数据安全，用户只能访问自己有权限的数据。',
                  gradient: 'from-pink-100 to-rose-100',
                  color: 'text-pink-600'
                },
                {
                  icon: Zap,
                  title: '实时同步',
                  desc: '通过 WebSocket 订阅数据变化，实现多设备实时同步，无需轮询。',
                  gradient: 'from-indigo-100 to-purple-100',
                  color: 'text-indigo-600'
                },
                {
                  icon: Cloud,
                  title: '云端存储',
                  desc: '集成 S3 对象存储，支持图片上传和管理，自动处理和优化。',
                  gradient: 'from-fuchsia-100 to-pink-100',
                  color: 'text-fuchsia-600'
                },
              ].map((feature) => (
                <div key={feature.title} className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-100 shadow-lg">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">主要端点</h2>
            
            <div className="space-y-8">
              {[
                {
                  title: '认证',
                  color: 'text-purple-600',
                  endpoints: [
                    { method: 'POST', path: '/auth/v1/signup', color: 'bg-green-100 text-green-700' },
                    { method: 'POST', path: '/auth/v1/token', color: 'bg-green-100 text-green-700' },
                    { method: 'POST', path: '/auth/v1/logout', color: 'bg-green-100 text-green-700' },
                  ]
                },
                {
                  title: '文章管理',
                  color: 'text-pink-600',
                  endpoints: [
                    { method: 'GET', path: '/rest/v1/posts', color: 'bg-blue-100 text-blue-700' },
                    { method: 'GET', path: '/rest/v1/posts?id=eq.{id}', color: 'bg-blue-100 text-blue-700' },
                    { method: 'POST', path: '/rest/v1/posts', color: 'bg-green-100 text-green-700' },
                    { method: 'PATCH', path: '/rest/v1/posts?id=eq.{id}', color: 'bg-yellow-100 text-yellow-700' },
                    { method: 'DELETE', path: '/rest/v1/posts?id=eq.{id}', color: 'bg-red-100 text-red-700' },
                  ]
                },
                {
                  title: '分类与标签',
                  color: 'text-indigo-600',
                  endpoints: [
                    { method: 'GET', path: '/rest/v1/categories', color: 'bg-blue-100 text-blue-700' },
                    { method: 'GET', path: '/rest/v1/tags', color: 'bg-blue-100 text-blue-700' },
                    { method: 'POST', path: '/rest/v1/categories', color: 'bg-green-100 text-green-700' },
                  ]
                },
                {
                  title: '评论',
                  color: 'text-fuchsia-600',
                  endpoints: [
                    { method: 'GET', path: '/rest/v1/comments?post_id=eq.{id}', color: 'bg-blue-100 text-blue-700' },
                    { method: 'POST', path: '/rest/v1/comments', color: 'bg-green-100 text-green-700' },
                  ]
                },
              ].map((section) => (
                <div key={section.title} className="border-l-4 border-purple-600 pl-6">
                  <h3 className={`text-2xl font-bold mb-4 ${section.color}`}>{section.title}</h3>
                  <div className="space-y-3">
                    {section.endpoints.map((endpoint, idx) => (
                      <div key={idx} className="flex items-start gap-3 font-mono text-sm">
                        <span className={`px-3 py-1.5 ${endpoint.color} rounded-lg font-bold`}>{endpoint.method}</span>
                        <span className="text-gray-600 py-1.5">{endpoint.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-gray-900 text-gray-100 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 text-white">示例代码</h2>
            <div className="space-y-8">
              {[
                {
                  title: '获取文章列表',
                  code: `const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)`
                },
                {
                  title: '创建新文章',
                  code: `const { data, error } = await supabase
  .from('posts')
  .insert({
    title: '文章标题',
    content: '文章内容',
    status: 'draft'
  })
  .select()`
                },
                {
                  title: '实时订阅',
                  code: `supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe()`
                },
              ].map((example) => (
                <div key={example.title}>
                  <div className="text-sm text-gray-400 mb-3 font-semibold">{example.title}</div>
                  <pre className="text-sm overflow-x-auto bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">速率限制</h2>
            <p className="text-gray-600 mb-6 text-lg">为确保服务稳定性，API 实施以下速率限制：</p>
            <ul className="space-y-3 text-gray-600">
              {[
                '认证端点：每分钟 10 次请求',
                '读取操作：每分钟 100 次请求',
                '写入操作：每分钟 30 次请求',
                '文件上传：每小时 50 次请求',
              ].map((limit) => (
                <li key={limit} className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {limit}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-6">
              超出限制将返回 429 状态码。如需更高配额，请联系技术支持。
            </p>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">开始使用 API</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                查看完整文档或联系我们获取 API 密钥
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
                >
                  查看文档
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-xl font-bold text-lg hover:bg-purple-800 transition-all border-2 border-white/30"
                >
                  联系我们
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
