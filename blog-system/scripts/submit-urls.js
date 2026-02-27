// 自动提交 URL 到搜索引擎
// 使用方法: node scripts/submit-urls.js

const https = require('https')
const fs = require('fs')

const SITE_URL = 'https://blog.familybank.chat'

// 百度主动推送
async function submitToBaidu(urls) {
  const token = process.env.BAIDU_PUSH_TOKEN // 从百度站长平台获取
  if (!token) {
    console.log('⚠️  未配置百度推送 token')
    return
  }

  const data = urls.join('\n')
  const options = {
    hostname: 'data.zz.baidu.com',
    port: 443,
    path: `/urls?site=${SITE_URL}&token=${token}`,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        console.log('✅ 百度推送结果:', body)
        resolve(body)
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// 必应主动推送
async function submitToBing(urls) {
  const apiKey = process.env.BING_WEBMASTER_API_KEY
  if (!apiKey) {
    console.log('⚠️  未配置必应 API key')
    return
  }

  const data = JSON.stringify({
    siteUrl: SITE_URL,
    urlList: urls
  })

  const options = {
    hostname: 'ssl.bing.com',
    port: 443,
    path: '/webmaster/api.svc/json/SubmitUrlbatch?apikey=' + apiKey,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        console.log('✅ 必应推送结果:', body)
        resolve(body)
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// 主函数
async function main() {
  // 从 sitemap 读取 URL（简化版，实际应该解析 XML）
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog`,
    // 添加更多 URL...
  ]

  console.log(`📤 准备推送 ${urls.length} 个 URL...`)

  try {
    await submitToBaidu(urls)
    await submitToBing(urls)
    console.log('✅ 推送完成')
  } catch (error) {
    console.error('❌ 推送失败:', error)
  }
}

main()
