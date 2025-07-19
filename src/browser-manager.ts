import { chromium, firefox, webkit, Browser } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserConfig, ServerConfig, ToolResult } from './types.js';

export class BrowserManager {
  private instances: Map<string, BrowserInstance> = new Map();
  private config: ServerConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: ServerConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * 创建新的浏览器实例
   */
  async createInstance(
    browserConfig?: Partial<BrowserConfig>,
    metadata?: BrowserInstance['metadata']
  ): Promise<ToolResult> {
    try {
      if (this.instances.size >= this.config.maxInstances) {
        return {
          success: false,
          error: `Maximum number of instances (${this.config.maxInstances}) reached`
        };
      }

      const config = { ...this.config.defaultBrowserConfig, ...browserConfig };
      const browser = await this.launchBrowser(config);
      
      const contextOptions: any = {
        viewport: config.viewport,
        ...config.contextOptions
      };
      if (config.userAgent) {
        contextOptions.userAgent = config.userAgent;
      }
      const context = await browser.newContext(contextOptions);

      const page = await context.newPage();
      
      const instanceId = uuidv4();
      const instance: BrowserInstance = {
        id: instanceId,
        browser,
        context,
        page,
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
        ...(metadata && { metadata })
      };

      this.instances.set(instanceId, instance);

      return {
        success: true,
        data: {
          instanceId,
          browserType: config.browserType,
          headless: config.headless,
          viewport: config.viewport,
          metadata
        },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create browser instance: ${error instanceof Error ? error.message : error}`
      };
    }
  }

  /**
   * 获取浏览器实例
   */
  getInstance(instanceId: string): BrowserInstance | undefined {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.lastUsed = new Date();
    }
    return instance;
  }

  /**
   * 列出所有实例
   */
  listInstances(): ToolResult {
    const instanceList = Array.from(this.instances.values()).map(instance => ({
      id: instance.id,
      isActive: instance.isActive,
      createdAt: instance.createdAt.toISOString(),
      lastUsed: instance.lastUsed.toISOString(),
      metadata: instance.metadata,
      currentUrl: instance.page.url()
    }));

    return {
      success: true,
      data: {
        instances: instanceList,
        totalCount: this.instances.size,
        maxInstances: this.config.maxInstances
      }
    };
  }

  /**
   * 关闭浏览器实例
   */
  async closeInstance(instanceId: string): Promise<ToolResult> {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        return {
          success: false,
          error: `Instance ${instanceId} not found`
        };
      }

      await instance.browser.close();
      this.instances.delete(instanceId);

      return {
        success: true,
        data: { instanceId, closed: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to close instance: ${error instanceof Error ? error.message : error}`
      };
    }
  }

  /**
   * 关闭所有实例
   */
  async closeAllInstances(): Promise<ToolResult> {
    try {
      const closePromises = Array.from(this.instances.values()).map(
        instance => instance.browser.close()
      );
      
      await Promise.all(closePromises);
      const closedCount = this.instances.size;
      this.instances.clear();

      return {
        success: true,
        data: { closedCount }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to close all instances: ${error instanceof Error ? error.message : error}`
      };
    }
  }

  /**
   * 启动浏览器
   */
  private async launchBrowser(config: BrowserConfig): Promise<Browser> {
    const launchOptions: any = {
      headless: config.headless ?? true
    };
    
    if (config.headless) {
      launchOptions.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    switch (config.browserType) {
      case 'chromium':
        return await chromium.launch(launchOptions);
      case 'firefox':
        return await firefox.launch(launchOptions);
      case 'webkit':
        return await webkit.launch(launchOptions);
      default:
        throw new Error(`Unsupported browser type: ${config.browserType}`);
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupInactiveInstances();
    }, this.config.cleanupInterval);
  }

  /**
   * 清理非活跃实例
   */
  private async cleanupInactiveInstances(): Promise<void> {
    const now = new Date();
    const instancesToClose: string[] = [];

    for (const [id, instance] of this.instances.entries()) {
      const timeSinceLastUsed = now.getTime() - instance.lastUsed.getTime();
      if (timeSinceLastUsed > this.config.instanceTimeout) {
        instancesToClose.push(id);
      }
    }

    for (const instanceId of instancesToClose) {
      await this.closeInstance(instanceId);
      console.log(`Cleaned up inactive instance: ${instanceId}`);
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    await this.closeAllInstances();
  }
} 