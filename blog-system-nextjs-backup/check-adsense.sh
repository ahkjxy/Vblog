#!/bin/bash

echo "🔍 Google AdSense 验证诊断工具"
echo "================================"
echo ""

DOMAIN="blog.familybank.chat"
ADSENSE_ID="ca-pub-8769672462868982"

echo "📍 检查域名: $DOMAIN"
echo ""

# 1. 检查 DNS 解析
echo "1️⃣ DNS 解析检查..."
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN | grep -A 2 "Name:"
else
    echo "   ⚠️  nslookup 命令不可用"
fi
echo ""

# 2. 检查网站可访问性
echo "2️⃣ 网站可访问性检查..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ 网站可访问 (HTTP $HTTP_CODE)"
else
    echo "   ❌ 网站访问异常 (HTTP $HTTP_CODE)"
fi
echo ""

# 3. 检查 AdSense 脚本
echo "3️⃣ AdSense 脚本检查..."
if curl -s https://$DOMAIN | grep -q "$ADSENSE_ID"; then
    echo "   ✅ AdSense 脚本已找到"
    echo "   Publisher ID: $ADSENSE_ID"
else
    echo "   ❌ 未找到 AdSense 脚本"
fi
echo ""

# 4. 检查 ads.txt
echo "4️⃣ ads.txt 文件检查..."
ADS_TXT_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ads.txt)
if [ "$ADS_TXT_CODE" = "200" ]; then
    echo "   ✅ ads.txt 文件存在"
    echo "   内容:"
    curl -s https://$DOMAIN/ads.txt | sed 's/^/      /'
else
    echo "   ⚠️  ads.txt 文件不存在 (HTTP $ADS_TXT_CODE)"
fi
echo ""

# 5. 检查 robots.txt
echo "5️⃣ robots.txt 检查..."
ROBOTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/robots.txt)
if [ "$ROBOTS_CODE" = "200" ]; then
    echo "   ✅ robots.txt 文件存在"
else
    echo "   ⚠️  robots.txt 文件不存在 (HTTP $ROBOTS_CODE)"
fi
echo ""

# 6. SSL 证书检查
echo "6️⃣ SSL 证书检查..."
if curl -s https://$DOMAIN > /dev/null 2>&1; then
    echo "   ✅ SSL 证书有效"
else
    echo "   ❌ SSL 证书问题"
fi
echo ""

echo "================================"
echo "📋 诊断总结"
echo "================================"
echo ""
echo "如果所有检查都通过，但 AdSense 仍然无法验证："
echo ""
echo "1. 确认 AdSense 后台填写的域名是: $DOMAIN"
echo "   （不是 familybank.chat）"
echo ""
echo "2. 等待 DNS 传播完成（24-48 小时）"
echo ""
echo "3. 尝试其他验证方法（HTML 标签、文件上传）"
echo ""
echo "4. 确保网站有足够的原创内容（建议 10+ 篇文章）"
echo ""
echo "5. 检查网站是否符合 AdSense 内容政策"
echo ""
