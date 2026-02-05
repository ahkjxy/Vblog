#!/usr/bin/env node

/**
 * 环境变量验证脚本
 * 用于检查 Supabase 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证环境变量配置...\n');

// 读取 .env.local 文件
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ 错误: .env.local 文件不存在');
  console.log('💡 请创建 .env.local 文件并添加必要的环境变量');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// 检查必需的环境变量
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let hasErrors = false;

console.log('📋 检查必需的环境变量:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName];
  
  if (!value) {
    console.error(`❌ ${varName}: 未设置`);
    hasErrors = true;
  } else if (value.includes(' ') && !varName.includes('URL')) {
    console.warn(`⚠️  ${varName}: 包含空格（可能导致问题）`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: 已设置`);
    
    // 显示部分值用于验证
    if (varName.includes('URL')) {
      console.log(`   值: ${value}`);
    } else {
      const preview = value.substring(0, 20) + '...' + value.substring(value.length - 10);
      console.log(`   值: ${preview}`);
      console.log(`   长度: ${value.length} 字符`);
    }
  }
  console.log('');
});

// 验证 URL 格式
const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
if (supabaseUrl) {
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL 必须以 https:// 开头');
    hasErrors = true;
  }
  if (!supabaseUrl.includes('.supabase.co')) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL 格式可能不正确（应包含 .supabase.co）');
  }
}

// 验证密钥格式
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (anonKey && !anonKey.startsWith('eyJ')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 格式不正确（应以 eyJ 开头）');
  hasErrors = true;
}

if (serviceKey && !serviceKey.startsWith('eyJ')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 格式不正确（应以 eyJ 开头）');
  hasErrors = true;
}

// 检查密钥长度
if (anonKey && anonKey.length < 100) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY 长度异常（可能不完整）');
  hasErrors = true;
}

if (serviceKey && serviceKey.length < 100) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY 长度异常（可能不完整）');
  hasErrors = true;
}

console.log('\n' + '='.repeat(60) + '\n');

if (hasErrors) {
  console.error('❌ 发现配置问题！请修复后重试。\n');
  console.log('📖 参考文档:');
  console.log('   - VERCEL_DEPLOYMENT.md');
  console.log('   - VERCEL_TROUBLESHOOTING.md\n');
  process.exit(1);
} else {
  console.log('✅ 所有环境变量配置正确！\n');
  console.log('📝 下一步:');
  console.log('   1. 确保在 Vercel 中也配置了相同的环境变量');
  console.log('   2. 运行 npm run dev 测试本地环境');
  console.log('   3. 推送代码并在 Vercel 上重新部署\n');
  process.exit(0);
}
