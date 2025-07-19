#!/usr/bin/env node

/**
 * 演示脚本：展示 Concurrent Browser MCP 服务器的多并发功能
 * 
 * 此脚本演示了如何：
 * 1. 创建多个浏览器实例
 * 2. 并发执行不同的任务
 * 3. 管理实例生命周期
 * 4. 处理并发操作的结果
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// 模拟 MCP 工具调用
class MockMCPClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 0;
  }

  async startServer() {
    console.log('🚀 启动 Concurrent Browser MCP 服务器...');
    
    // 在实际应用中，这里会启动 MCP 服务器
    // 为了演示，我们只是模拟
    await setTimeout(1000);
    console.log('✅ 服务器已启动');
  }

  async callTool(name, args) {
    const requestId = ++this.requestId;
    console.log(`📞 调用工具: ${name}`, args ? `(${JSON.stringify(args)})` : '');
    
    // 模拟工具调用延迟
    await setTimeout(Math.random() * 1000 + 500);
    
    // 模拟不同工具的响应
    switch (name) {
      case 'browser_create_instance':
        return {
          success: true,
          data: {
            instanceId: `instance-${requestId}`,
            browserType: args?.browserType || 'chromium',
            headless: args?.headless ?? true,
            metadata: args?.metadata
          }
        };
      
      case 'browser_list_instances':
        return {
          success: true,
          data: {
            instances: [
              { id: 'instance-1', isActive: true, metadata: { name: 'worker-1' } },
              { id: 'instance-2', isActive: true, metadata: { name: 'worker-2' } },
              { id: 'instance-3', isActive: true, metadata: { name: 'worker-3' } }
            ],
            totalCount: 3,
            maxInstances: 5
          }
        };
      
      case 'browser_navigate':
        return {
          success: true,
          data: {
            url: args.url,
            title: `示例页面 - ${args.url}`,
            instanceId: args.instanceId
          }
        };
      
      case 'browser_screenshot':
        return {
          success: true,
          data: {
            screenshot: 'base64-encoded-screenshot-data',
            type: 'png',
            instanceId: args.instanceId
          }
        };
      
      case 'browser_close_instance':
        return {
          success: true,
          data: {
            instanceId: args.instanceId,
            closed: true
          }
        };
      
      default:
        return {
          success: true,
          data: { message: `工具 ${name} 执行成功`, instanceId: args?.instanceId }
        };
    }
  }

  async stopServer() {
    console.log('🛑 停止服务器...');
    await setTimeout(500);
    console.log('✅ 服务器已停止');
  }
}

// 演示场景
class ConcurrentBrowserDemo {
  constructor() {
    this.client = new MockMCPClient();
    this.instances = [];
  }

  async run() {
    console.log('🎬 开始演示 Concurrent Browser MCP 服务器\n');
    
    try {
      // 启动服务器
      await this.client.startServer();
      console.log('');

      // 场景1：创建多个浏览器实例
      await this.demo1_CreateMultipleInstances();
      console.log('');

      // 场景2：并发执行不同任务
      await this.demo2_ConcurrentTasks();
      console.log('');

      // 场景3：实例管理
      await this.demo3_InstanceManagement();
      console.log('');

      // 场景4：批量操作
      await this.demo4_BatchOperations();
      console.log('');

    } catch (error) {
      console.error('❌ 演示过程中出错:', error);
    } finally {
      // 清理
      await this.cleanup();
    }
  }

  async demo1_CreateMultipleInstances() {
    console.log('📋 场景1: 创建多个浏览器实例');
    console.log('─'.repeat(50));

    const configs = [
      { browserType: 'chromium', metadata: { name: 'worker-1', description: 'Chrome浏览器实例' } },
      { browserType: 'firefox', metadata: { name: 'worker-2', description: 'Firefox浏览器实例' } },
      { browserType: 'webkit', metadata: { name: 'worker-3', description: 'Safari浏览器实例' } }
    ];

    console.log('🔧 并发创建3个不同类型的浏览器实例...');
    
    const createPromises = configs.map(config => 
      this.client.callTool('browser_create_instance', config)
    );

    const results = await Promise.all(createPromises);
    
    results.forEach((result, index) => {
      if (result.success) {
        this.instances.push(result.data);
        console.log(`✅ 实例 ${index + 1}: ${result.data.instanceId} (${result.data.browserType})`);
      } else {
        console.log(`❌ 实例 ${index + 1}: 创建失败`);
      }
    });

    console.log(`📊 共创建了 ${this.instances.length} 个实例`);
  }

  async demo2_ConcurrentTasks() {
    console.log('📋 场景2: 并发执行不同任务');
    console.log('─'.repeat(50));

    const tasks = [
      { instanceId: this.instances[0]?.instanceId, url: 'https://example.com' },
      { instanceId: this.instances[1]?.instanceId, url: 'https://github.com' },
      { instanceId: this.instances[2]?.instanceId, url: 'https://stackoverflow.com' }
    ];

    console.log('🌐 并发导航到不同网站...');
    
    const navPromises = tasks.map(task => 
      this.client.callTool('browser_navigate', task)
    );

    const navResults = await Promise.all(navPromises);
    
    navResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ 导航 ${index + 1}: ${result.data.url} - ${result.data.title}`);
      } else {
        console.log(`❌ 导航 ${index + 1}: 失败`);
      }
    });

    console.log('📸 并发截图...');
    
    const screenshotPromises = this.instances.map(instance => 
      this.client.callTool('browser_screenshot', { instanceId: instance.instanceId })
    );

    const screenshotResults = await Promise.all(screenshotPromises);
    
    screenshotResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ 截图 ${index + 1}: 已保存 (${result.data.type})`);
      } else {
        console.log(`❌ 截图 ${index + 1}: 失败`);
      }
    });
  }

  async demo3_InstanceManagement() {
    console.log('📋 场景3: 实例管理');
    console.log('─'.repeat(50));

    // 列出所有实例
    console.log('📋 列出所有实例...');
    const listResult = await this.client.callTool('browser_list_instances');
    
    if (listResult.success) {
      console.log(`📊 实例统计: ${listResult.data.totalCount}/${listResult.data.maxInstances}`);
      listResult.data.instances.forEach(instance => {
        console.log(`  - ${instance.id} (${instance.metadata?.name || '未命名'})`);
      });
    }

    // 模拟实例超时清理
    console.log('🧹 模拟自动清理超时实例...');
    await setTimeout(1000);
    console.log('✅ 清理完成，所有实例都在正常运行');
  }

  async demo4_BatchOperations() {
    console.log('📋 场景4: 批量操作');
    console.log('─'.repeat(50));

    // 批量执行 JavaScript
    console.log('🔧 批量执行 JavaScript...');
    const jsPromises = this.instances.map(instance => 
      this.client.callTool('browser_evaluate', {
        instanceId: instance.instanceId,
        script: 'document.title'
      })
    );

    const jsResults = await Promise.all(jsPromises);
    
    jsResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ JS执行 ${index + 1}: 成功`);
      } else {
        console.log(`❌ JS执行 ${index + 1}: 失败`);
      }
    });

    // 批量点击操作
    console.log('🖱️ 批量点击操作...');
    const clickPromises = this.instances.map(instance => 
      this.client.callTool('browser_click', {
        instanceId: instance.instanceId,
        selector: '#demo-button'
      })
    );

    const clickResults = await Promise.all(clickPromises);
    
    clickResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ 点击 ${index + 1}: 成功`);
      } else {
        console.log(`❌ 点击 ${index + 1}: 失败`);
      }
    });
  }

  async cleanup() {
    console.log('🧹 清理资源...');
    
    // 关闭所有实例
    if (this.instances.length > 0) {
      const closePromises = this.instances.map(instance => 
        this.client.callTool('browser_close_instance', { instanceId: instance.instanceId })
      );

      await Promise.all(closePromises);
      console.log(`✅ 已关闭 ${this.instances.length} 个实例`);
    }

    // 停止服务器
    await this.client.stopServer();
    console.log('✅ 清理完成');
  }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new ConcurrentBrowserDemo();
  demo.run().catch(console.error);
} 