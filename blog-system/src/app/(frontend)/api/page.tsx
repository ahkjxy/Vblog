import { Code, Zap, Lock, Database, Cloud } from 'lucide-react'

export default function APIPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-sm mb-6">
            <Code className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-medium">API 文档</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            元气银行 API
          </h1>
          <p className="text-xl text-gray-600">
            强大的 RESTful API，让您轻松集成元气银行功能
          </p>
        </div>

        {/* Overview */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-4">API 概览</h2>
          <p className="text-lg text-gray-700 mb-6">
            元气银行提供完整的 RESTful API，支持所有核心功能的编程访问。
            基于 Supabase 构建，提供实时数据同步、安全认证和高性能查询。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">REST</div>
              <div className="text-sm text-gray-600">标准 RESTful API</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">实时</div>
              <div className="text-sm text-gray-600">WebSocket 实时订阅</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">安全</div>
              <div className="text-sm text-gray-600">JWT 认证 + RLS</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">核心特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">安全认证</h3>
              <p className="text-gray-600">
                基于 JWT 的安全认证机制，支持多种认证方式。所有 API 请求都经过严格的权限验证。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">行级安全</h3>
              <p className="text-gray-600">
                PostgreSQL RLS 策略确保数据安全，用户只能访问自己有权限的数据。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">实时同步</h3>
              <p className="text-gray-600">
                通过 WebSocket 订阅数据变化，实现多设备实时同步，无需轮询。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">云端存储</h3>
              <p className="text-gray-600">
                集成 S3 对象存储，支持图片上传和管理，自动处理和优化。
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">主要端点</h2>
          
          <div className="space-y-6">
            {/* Authentication */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-600">认证</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/auth/v1/signup</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/auth/v1/token</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/auth/v1/logout</span>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-600">文章管理</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">GET</span>
                  <span className="text-gray-600">/rest/v1/posts</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">GET</span>
                  <span className="text-gray-600">/rest/v1/posts?id=eq.{'{id}'}</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/rest/v1/posts</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">PATCH</span>
                  <span className="text-gray-600">/rest/v1/posts?id=eq.{'{id}'}</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">DELETE</span>
                  <span className="text-gray-600">/rest/v1/posts?id=eq.{'{id}'}</span>
                </div>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-600">分类与标签</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">GET</span>
                  <span className="text-gray-600">/rest/v1/categories</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">GET</span>
                  <span className="text-gray-600">/rest/v1/tags</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/rest/v1/categories</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-600">评论</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">GET</span>
                  <span className="text-gray-600">/rest/v1/comments?post_id=eq.{'{id}'}</span>
                </div>
                <div className="flex items-start gap-3 font-mono text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">POST</span>
                  <span className="text-gray-600">/rest/v1/comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 text-gray-100 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white">示例代码</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">获取文章列表</div>
              <pre className="text-sm overflow-x-auto">
                <code>{`const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)`}</code>
              </pre>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">创建新文章</div>
              <pre className="text-sm overflow-x-auto">
                <code>{`const { data, error } = await supabase
  .from('posts')
  .insert({
    title: '文章标题',
    content: '文章内容',
    status: 'draft'
  })
  .select()`}</code>
              </pre>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">实时订阅</div>
              <pre className="text-sm overflow-x-auto">
                <code>{`supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log(payload)
  )
  .subscribe()`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white border rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">速率限制</h2>
          <div className="space-y-4 text-gray-600">
            <p>为确保服务稳定性，API 实施以下速率限制：</p>
            <ul className="space-y-2 ml-6">
              <li>• 认证端点：每分钟 10 次请求</li>
              <li>• 读取操作：每分钟 100 次请求</li>
              <li>• 写入操作：每分钟 30 次请求</li>
              <li>• 文件上传：每小时 50 次请求</li>
            </ul>
            <p className="text-sm">
              超出限制将返回 429 状态码。如需更高配额，请联系技术支持。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">开始使用 API</h2>
            <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
              查看完整文档或联系我们获取 API 密钥
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/docs"
                className="inline-block px-8 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
              >
                查看文档
              </a>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all font-medium border-2 border-white"
              >
                联系我们
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
