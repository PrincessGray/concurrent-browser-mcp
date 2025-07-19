#!/bin/bash

# Concurrent Browser MCP 服务器安装脚本

echo "🚀 安装 Concurrent Browser MCP 服务器..."
echo ""

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装。请先安装 Node.js 18 或更高版本。"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js 版本过低。需要 18.0.0 或更高版本，当前版本：$NODE_VERSION"
    exit 1
fi

echo "✅ Node.js 版本检查通过：$NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装。"
    exit 1
fi

echo "✅ npm 检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建成功"

# 安装 Playwright 浏览器
echo "🌐 安装 Playwright 浏览器..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "❌ Playwright 浏览器安装失败"
    exit 1
fi

echo "✅ Playwright 浏览器安装成功"

# 创建全局链接（可选）
echo "🔗 创建全局链接..."
npm link

if [ $? -eq 0 ]; then
    echo "✅ 全局链接创建成功"
    echo "📝 现在可以使用 'concurrent-browser-mcp' 命令了"
else
    echo "⚠️ 全局链接创建失败，可以使用 'node dist/index.js' 运行"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📋 使用方法："
echo "  1. 基础用法：node dist/index.js"
echo "  2. 查看帮助：node dist/index.js --help"
echo "  3. 查看示例：node dist/index.js example"
echo "  4. 运行演示：node examples/demo.js"
echo ""
echo "🔧 MCP 客户端配置示例："
echo "  {"
echo "    \"mcpServers\": {"
echo "      \"concurrent-browser\": {"
echo "        \"command\": \"node\","
echo "        \"args\": [\"$(pwd)/dist/index.js\"]"
echo "      }"
echo "    }"
echo "  }"
echo ""
echo "🚀 开始使用 Concurrent Browser MCP 服务器！" 