import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Zap, TrendingUp, Award, Shield, FileText } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-sm mb-6">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-medium">元气银行 Architecture & Guide</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            元气银行<br />
            <span className="text-gray-600">使用说明与技术手册</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            本指南详细汇总了应用的功能模块、操作流程及同步策略。旨在帮助家庭成员快速上手，同时为系统管理员提供完整的维护参考。
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium">
              React 18
            </div>
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium">
              Tailwind CSS
            </div>
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium">
              Supabase Cloud
            </div>
            <div className="px-4 py-2 bg-white border rounded-full text-sm font-medium">
              Realtime Sync
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-medium"
            >
              查看文档
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:border-gray-400 transition-all font-medium"
            >
              开始使用
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🗺️ 路由架构 / Navigation</h2>
            <p className="text-gray-600">完整的功能模块导航</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">/dashboard</h3>
              <p className="text-sm text-gray-600">账户概览 - 核心看板，展示余额与趋势</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">/earn</h3>
              <p className="text-sm text-gray-600">元气任务 - 赚取积分与违规扣减入口</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">/redeem</h3>
              <p className="text-sm text-gray-600">梦想商店 - 积分兑换实物 or 特权奖励</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">/history</h3>
              <p className="text-sm text-gray-600">能量账单 - 全量交易流水查询</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold mb-2">/settings</h3>
              <p className="text-sm text-gray-600">系统配置 - 仅管理员可见的规则与成员管理</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🚀 页面核心功能 / Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-3">数据实时同步</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                所有积分变动、成员信息及任务规则均直接持久化至 Supabase 云端，确保多设备访问时数据的一致性与实时性。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-3">自动化管理</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                支持设置每日、每周、每月等多种结算周期的任务；系统每日会自动发放"元气奖励"以保持成员活跃度。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-3">多角色权限</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                严谨的权限控制：普通成员仅能执行赚取与兑换，管理员拥有规则制定权与账单审计权。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🛠️ 管理流程 / Workflow</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">录入任务</h4>
                <p className="text-gray-600 text-sm">选择分类下的具体事项，确认后系统即刻更新成员余额。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">兑换奖品</h4>
                <p className="text-gray-600 text-sm">商品网格展示，余额不足时自动置灰锁定，防止超支。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">规则制定</h4>
                <p className="text-gray-600 text-sm">管理员可在设置中随时调整任务点数、商品库存或图片。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">成员更替</h4>
                <p className="text-gray-600 text-sm">支持管理员增删成员及调整权限，确保家庭空间的私密性。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts && posts.length > 0 && (
        <section className="container mx-auto px-6 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">📚 最新文档</h2>
              <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {post.profiles?.avatar_url && (
                          <img 
                            src={post.profiles.avatar_url} 
                            alt={post.profiles.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{post.profiles?.username}</div>
                          <div className="text-xs">{formatDate(post.published_at!)}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">💻 技术规范 / Specs</h2>
          </div>

          <div className="bg-white border rounded-2xl p-8">
            <h3 className="font-semibold mb-6">Tech Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Frontend</div>
                <div className="font-medium">React + TypeScript</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Styling</div>
                <div className="font-medium">Tailwind + Radix</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Backend</div>
                <div className="font-medium">Supabase BaaS</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Storage</div>
                <div className="font-medium">Supabase S3 Bucket</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
            立即开始使用元气银行，让家庭积分管理变得简单高效。
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
          >
            免费开始
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
