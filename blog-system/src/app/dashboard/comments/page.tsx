import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { MessageSquare, ThumbsUp, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default async function CommentsPage() {
  const supabase = await createClient()
  
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles(username, avatar_url),
      posts(title, slug)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">评论管理</h1>
        <p className="text-gray-600">管理所有文章评论</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D94] to-[#FF7AB8] rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{comments?.length || 0}</div>
              <div className="text-sm text-gray-600">总评论数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7C4DFF] to-[#9575CD] rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {comments?.filter(c => c.status === 'approved').length || 0}
              </div>
              <div className="text-sm text-gray-600">已批准</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFA726] to-[#FFB74D] rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {comments?.filter(c => c.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-gray-600">待审核</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-3xl border border-gray-100">
        {comments && comments.length > 0 ? (
          <div className="divide-y">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.profiles?.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt={comment.profiles.username}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-semibold">
                        {comment.profiles?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.profiles?.username}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-600">{formatDate(comment.created_at)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comment.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comment.status === 'approved' ? '已批准' : '待审核'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    
                    {comment.posts && (
                      <a 
                        href={`/blog/${comment.posts.slug}`}
                        className="text-sm text-[#FF4D94] hover:text-[#7C4DFF] transition-colors"
                      >
                        评论于: {comment.posts.title}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {comment.status === 'pending' && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-[#FF4D94]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">暂无评论</h3>
            <p className="text-gray-600">还没有收到任何评论</p>
          </div>
        )}
      </div>
    </div>
  )
}
