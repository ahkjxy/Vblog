export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">隐私政策</h1>
        <p className="text-gray-600 mb-12">最后更新：2024年1月</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. 信息收集</h2>
            <p className="text-gray-600 mb-4">
              我们收集以下类型的信息：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>账户信息：用户名、邮箱地址</li>
              <li>使用数据：任务记录、积分变动、兑换历史</li>
              <li>设备信息：IP 地址、浏览器类型、操作系统</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. 信息使用</h2>
            <p className="text-gray-600 mb-4">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>提供和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>发送服务通知和更新</li>
              <li>分析使用趋势和优化用户体验</li>
              <li>防止欺诈和滥用</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. 信息共享</h2>
            <p className="text-gray-600 mb-4">
              我们不会出售、交易或出租您的个人信息给第三方。我们可能在以下情况下共享信息：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>经您同意</li>
              <li>为提供服务所必需（如云服务提供商）</li>
              <li>遵守法律要求</li>
              <li>保护我们的权利和安全</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. 数据安全</h2>
            <p className="text-gray-600 mb-4">
              我们采取以下措施保护您的数据：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>使用 SSL/TLS 加密传输</li>
              <li>数据库加密存储</li>
              <li>定期安全审计</li>
              <li>访问控制和权限管理</li>
              <li>定期备份</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Cookie 使用</h2>
            <p className="text-gray-600 mb-4">
              我们使用 Cookie 和类似技术来：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>保持您的登录状态</li>
              <li>记住您的偏好设置</li>
              <li>分析网站使用情况</li>
              <li>提供个性化体验</li>
            </ul>
            <p className="text-gray-600 mt-4">
              您可以通过浏览器设置管理 Cookie 偏好。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. 您的权利</h2>
            <p className="text-gray-600 mb-4">
              您有权：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>访问您的个人信息</li>
              <li>更正不准确的信息</li>
              <li>删除您的账户和数据</li>
              <li>导出您的数据</li>
              <li>反对或限制某些数据处理</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. 儿童隐私</h2>
            <p className="text-gray-600">
              我们的服务面向家庭使用。家长或监护人负责管理儿童账户和数据。
              我们不会在未经家长同意的情况下收集 13 岁以下儿童的个人信息。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. 政策更新</h2>
            <p className="text-gray-600">
              我们可能会不时更新本隐私政策。重大变更时，我们会通过邮件或网站通知您。
              继续使用我们的服务即表示您接受更新后的政策。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. 联系我们</h2>
            <p className="text-gray-600 mb-4">
              如对本隐私政策有任何疑问，请联系我们：
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li>邮箱：ahkjxy@qq.com</li>
              <li>地址：中国</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
