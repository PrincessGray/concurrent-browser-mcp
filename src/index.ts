#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ConcurrentBrowserServer, defaultConfig } from './server.js';
import { ServerConfig } from './types.js';

const program = new Command();

program
  .name('concurrent-browser-mcp')
  .description('一个支持多并发的浏览器 MCP 服务器')
  .version('1.0.0');

program
  .option('-m, --max-instances <number>', '最大实例数', (value) => parseInt(value), defaultConfig.maxInstances)
  .option('-t, --instance-timeout <number>', '实例超时时间（分钟）', (value) => parseInt(value) * 60 * 1000, defaultConfig.instanceTimeout)
  .option('-c, --cleanup-interval <number>', '清理间隔（分钟）', (value) => parseInt(value) * 60 * 1000, defaultConfig.cleanupInterval)
  .option('--browser <browser>', '默认浏览器类型', 'chromium')
  .option('--headless', '默认无头模式', true)
  .option('--width <number>', '默认视口宽度', (value) => parseInt(value), defaultConfig.defaultBrowserConfig.viewport?.width || 1280)
  .option('--height <number>', '默认视口高度', (value) => parseInt(value), defaultConfig.defaultBrowserConfig.viewport?.height || 720)
  .option('--user-agent <string>', '默认用户代理')
  .option('--ignore-https-errors', '忽略 HTTPS 错误', false)
  .option('--bypass-csp', '绕过 CSP', false)
  .action(async (options) => {
    // 构建配置
    const config: ServerConfig = {
      maxInstances: options.maxInstances,
      instanceTimeout: options.instanceTimeout,
      cleanupInterval: options.cleanupInterval,
      defaultBrowserConfig: {
        browserType: options.browser as 'chromium' | 'firefox' | 'webkit',
        headless: options.headless,
        viewport: {
          width: options.width,
          height: options.height,
        },
        userAgent: options.userAgent,
        contextOptions: {
          ignoreHTTPSErrors: options.ignoreHttpsErrors,
          bypassCSP: options.bypassCsp,
        },
      },
    };

    // 启动服务器
    try {
      console.error(chalk.blue('🚀 正在启动 Concurrent Browser MCP Server...'));
      console.error(chalk.gray(`最大实例数: ${config.maxInstances}`));
      console.error(chalk.gray(`默认浏览器: ${config.defaultBrowserConfig.browserType}`));
      console.error(chalk.gray(`无头模式: ${config.defaultBrowserConfig.headless ? '是' : '否'}`));
      console.error(chalk.gray(`视口大小: ${config.defaultBrowserConfig.viewport?.width}x${config.defaultBrowserConfig.viewport?.height}`));
      console.error(chalk.gray(`实例超时: ${config.instanceTimeout / 60000} 分钟`));
      console.error(chalk.gray(`清理间隔: ${config.cleanupInterval / 60000} 分钟`));
      console.error('');

      const server = new ConcurrentBrowserServer(config);
      await server.run();
    } catch (error) {
      console.error(chalk.red('❌ 启动服务器失败:'), error);
      process.exit(1);
    }
  });

// 添加示例命令
program
  .command('example')
  .description('显示使用示例')
  .action(() => {
    console.log(chalk.bold('\n📚 使用示例:\n'));
    
    console.log(chalk.yellow('1. 启动服务器（默认配置）:'));
    console.log(chalk.gray('  npx concurrent-browser-mcp\n'));
    
    console.log(chalk.yellow('2. 启动服务器（自定义配置）:'));
    console.log(chalk.gray('  npx concurrent-browser-mcp --max-instances 25 --browser firefox --headless false\n'));
    
    console.log(chalk.yellow('3. 在 MCP 客户端中使用:'));
    console.log(chalk.gray('  {'));
    console.log(chalk.gray('    "mcpServers": {'));
    console.log(chalk.gray('      "concurrent-browser": {'));
    console.log(chalk.gray('        "command": "npx",'));
    console.log(chalk.gray('        "args": ["concurrent-browser-mcp", "--max-instances", "20"]'));
    console.log(chalk.gray('      }'));
    console.log(chalk.gray('    }'));
    console.log(chalk.gray('  }\n'));
    
    console.log(chalk.yellow('4. 可用的工具包括:'));
    console.log(chalk.gray('  - browser_create_instance: 创建浏览器实例'));
    console.log(chalk.gray('  - browser_list_instances: 列出所有实例'));
    console.log(chalk.gray('  - browser_navigate: 导航到URL'));
    console.log(chalk.gray('  - browser_click: 点击元素'));
    console.log(chalk.gray('  - browser_type: 输入文本'));
    console.log(chalk.gray('  - browser_screenshot: 截图'));
    console.log(chalk.gray('  - browser_evaluate: 执行JavaScript'));
    console.log(chalk.gray('  - 以及更多...\n'));
    
    console.log(chalk.yellow('5. 测试真实功能:'));
    console.log(chalk.gray('  - 模拟演示: node examples/demo.js'));
    console.log(chalk.gray('  - 真实测试: node test-real-screenshot.js (会生成实际截图文件)'));
    console.log(chalk.gray('  - 查看截图: open screenshot-*.png\n'));
  });

// 错误处理
program.configureHelp({
  sortSubcommands: true,
  helpWidth: 80,
});

program.parse();

// 如果没有提供参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 