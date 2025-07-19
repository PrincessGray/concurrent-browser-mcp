import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from './browser-manager.js';
import { 
  ToolResult, 
  NavigationOptions, 
  ClickOptions, 
  TypeOptions, 
  ScreenshotOptions
} from './types.js';

export class BrowserTools {
  constructor(private browserManager: BrowserManager) {}

  /**
   * 获取所有工具定义
   */
  getTools(): Tool[] {
    return [
      // 实例管理工具
      {
        name: 'browser_create_instance',
        description: '创建新的浏览器实例',
        inputSchema: {
          type: 'object',
          properties: {
            browserType: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: '浏览器类型',
              default: 'chromium'
            },
            headless: {
              type: 'boolean',
              description: '是否以无头模式运行',
              default: true
            },
            viewport: {
              type: 'object',
              properties: {
                width: { type: 'number', default: 1280 },
                height: { type: 'number', default: 720 }
              },
              description: '视口大小'
            },
            userAgent: {
              type: 'string',
              description: '用户代理字符串'
            },
            metadata: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '实例名称' },
                description: { type: 'string', description: '实例描述' },
                tags: { type: 'array', items: { type: 'string' }, description: '标签' }
              },
              description: '实例元数据'
            }
          }
        }
      },
      {
        name: 'browser_list_instances',
        description: '列出所有浏览器实例',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'browser_close_instance',
        description: '关闭指定的浏览器实例',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            }
          },
          required: ['instanceId']
        }
      },
      {
        name: 'browser_close_all_instances',
        description: '关闭所有浏览器实例',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },

      // 导航工具
      {
        name: 'browser_navigate',
        description: '导航到指定URL',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            url: {
              type: 'string',
              description: '目标URL',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            },
            waitUntil: {
              type: 'string',
              enum: ['load', 'domcontentloaded', 'networkidle'],
              description: '等待条件',
              default: 'load'
            }
          },
          required: ['instanceId', 'url']
        }
      },
      {
        name: 'browser_go_back',
        description: '返回上一页',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            }
          },
          required: ['instanceId']
        }
      },
      {
        name: 'browser_go_forward',
        description: '前进到下一页',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            }
          },
          required: ['instanceId']
        }
      },
      {
        name: 'browser_refresh',
        description: '刷新当前页面',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            }
          },
          required: ['instanceId']
        }
      },

      // 页面交互工具
      {
        name: 'browser_click',
        description: '点击页面元素',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            button: {
              type: 'string',
              enum: ['left', 'right', 'middle'],
              description: '鼠标按钮',
              default: 'left'
            },
            clickCount: {
              type: 'number',
              description: '点击次数',
              default: 1
            },
            delay: {
              type: 'number',
              description: '点击延迟（毫秒）',
              default: 0
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector']
        }
      },
      {
        name: 'browser_type',
        description: '在元素中输入文本',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            text: {
              type: 'string',
              description: '要输入的文本',
            },
            delay: {
              type: 'number',
              description: '输入延迟（毫秒）',
              default: 0
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector', 'text']
        }
      },
      {
        name: 'browser_fill',
        description: '填充表单字段',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            value: {
              type: 'string',
              description: '要填充的值',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector', 'value']
        }
      },
      {
        name: 'browser_select_option',
        description: '选择下拉选项',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            value: {
              type: 'string',
              description: '要选择的值',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector', 'value']
        }
      },

      // 页面信息工具
      {
        name: 'browser_get_page_info',
        description: '获取页面详细信息，包括完整的HTML内容、页面统计信息和元数据',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            }
          },
          required: ['instanceId']
        }
      },
      {
        name: 'browser_get_element_text',
        description: '获取元素文本',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector']
        }
      },
      {
        name: 'browser_get_element_attribute',
        description: '获取元素属性',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            attribute: {
              type: 'string',
              description: '属性名称',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector', 'attribute']
        }
      },

      // 截图工具
      {
        name: 'browser_screenshot',
        description: '截取页面截图',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            fullPage: {
              type: 'boolean',
              description: '是否截取整个页面',
              default: false
            },
            selector: {
              type: 'string',
              description: '元素选择器（截取特定元素）'
            },
            type: {
              type: 'string',
              enum: ['png', 'jpeg'],
              description: '图片格式',
              default: 'png'
            },
            quality: {
              type: 'number',
              description: '图片质量（1-100，仅jpeg有效）',
              minimum: 1,
              maximum: 100,
              default: 80
            }
          },
          required: ['instanceId']
        }
      },

      // 等待工具
      {
        name: 'browser_wait_for_element',
        description: '等待元素出现',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            selector: {
              type: 'string',
              description: '元素选择器',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId', 'selector']
        }
      },
      {
        name: 'browser_wait_for_navigation',
        description: '等待页面导航完成',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒）',
              default: 30000
            }
          },
          required: ['instanceId']
        }
      },

      // 执行 JavaScript 工具
      {
        name: 'browser_evaluate',
        description: '执行 JavaScript 代码',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            script: {
              type: 'string',
              description: 'JavaScript 代码',
            }
          },
          required: ['instanceId', 'script']
        }
      },

      // 内容提取工具
      {
        name: 'browser_get_markdown',
        description: '获取页面内容的Markdown格式表示，对大模型友好',
        inputSchema: {
          type: 'object',
          properties: {
            instanceId: {
              type: 'string',
              description: '实例ID'
            },
            includeLinks: {
              type: 'boolean',
              description: '是否包含链接',
              default: true
            },
            maxLength: {
              type: 'number',
              description: '最大内容长度（字符数）',
              default: 10000
            },
            selector: {
              type: 'string',
              description: '可选的CSS选择器，只提取特定元素的内容'
            }
          },
          required: ['instanceId']
        }
      }
    ];
  }

  /**
   * 执行工具
   */
  async executeTools(name: string, args: any): Promise<ToolResult> {
    try {
      switch (name) {
        case 'browser_create_instance':
          return await this.browserManager.createInstance(
            {
              browserType: args.browserType || 'chromium',
              headless: args.headless ?? true,
              viewport: args.viewport || { width: 1280, height: 720 },
              userAgent: args.userAgent
            },
            args.metadata
          );

        case 'browser_list_instances':
          return this.browserManager.listInstances();

        case 'browser_close_instance':
          return await this.browserManager.closeInstance(args.instanceId);

        case 'browser_close_all_instances':
          return await this.browserManager.closeAllInstances();

        case 'browser_navigate':
          return await this.navigate(args.instanceId, args.url, {
            timeout: args.timeout || 30000,
            waitUntil: args.waitUntil || 'load'
          });

        case 'browser_go_back':
          return await this.goBack(args.instanceId);

        case 'browser_go_forward':
          return await this.goForward(args.instanceId);

        case 'browser_refresh':
          return await this.refresh(args.instanceId);

        case 'browser_click':
          return await this.click(args.instanceId, args.selector, {
            button: args.button || 'left',
            clickCount: args.clickCount || 1,
            delay: args.delay || 0,
            timeout: args.timeout || 30000
          });

        case 'browser_type':
          return await this.type(args.instanceId, args.selector, args.text, {
            delay: args.delay || 0,
            timeout: args.timeout || 30000
          });

        case 'browser_fill':
          return await this.fill(args.instanceId, args.selector, args.value, args.timeout || 30000);

        case 'browser_select_option':
          return await this.selectOption(args.instanceId, args.selector, args.value, args.timeout || 30000);

        case 'browser_get_page_info':
          return await this.getPageInfo(args.instanceId);

        case 'browser_get_element_text':
          return await this.getElementText(args.instanceId, args.selector, args.timeout || 30000);

        case 'browser_get_element_attribute':
          return await this.getElementAttribute(args.instanceId, args.selector, args.attribute, args.timeout || 30000);

        case 'browser_screenshot':
          return await this.screenshot(args.instanceId, {
            fullPage: args.fullPage || false,
            type: args.type || 'png',
            quality: args.quality || 80
          }, args.selector);

        case 'browser_wait_for_element':
          return await this.waitForElement(args.instanceId, args.selector, args.timeout || 30000);

        case 'browser_wait_for_navigation':
          return await this.waitForNavigation(args.instanceId, args.timeout || 30000);

        case 'browser_evaluate':
          return await this.evaluate(args.instanceId, args.script);

        case 'browser_get_markdown':
          return await this.getMarkdown(args.instanceId, {
            includeLinks: args.includeLinks ?? true,
            maxLength: args.maxLength || 10000,
            selector: args.selector
          });

        default:
          return {
            success: false,
            error: `Unknown tool: ${name}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Tool execution failed: ${error instanceof Error ? error.message : error}`
      };
    }
  }

  // 实现各个工具的具体方法
  private async navigate(instanceId: string, url: string, options: NavigationOptions): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const gotoOptions: any = {
        waitUntil: options.waitUntil
      };
      if (options.timeout) {
        gotoOptions.timeout = options.timeout;
      }
      await instance.page.goto(url, gotoOptions);
      return {
        success: true,
        data: { url: instance.page.url(), title: await instance.page.title() },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Navigation failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async goBack(instanceId: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.goBack();
      return {
        success: true,
        data: { url: instance.page.url() },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Go back failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async goForward(instanceId: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.goForward();
      return {
        success: true,
        data: { url: instance.page.url() },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Go forward failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async refresh(instanceId: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.reload();
      return {
        success: true,
        data: { url: instance.page.url() },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Refresh failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async click(instanceId: string, selector: string, options: ClickOptions): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const clickOptions: any = {
        button: options.button
      };
      if (options.clickCount) clickOptions.clickCount = options.clickCount;
      if (options.delay) clickOptions.delay = options.delay;
      if (options.timeout) clickOptions.timeout = options.timeout;
      await instance.page.click(selector, clickOptions);
      return {
        success: true,
        data: { selector, clicked: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Click failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async type(instanceId: string, selector: string, text: string, options: TypeOptions): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const typeOptions: any = {};
      if (options.delay) typeOptions.delay = options.delay;
      if (options.timeout) typeOptions.timeout = options.timeout;
      await instance.page.type(selector, text, typeOptions);
      return {
        success: true,
        data: { selector, text, typed: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Type failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async fill(instanceId: string, selector: string, value: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.fill(selector, value, { timeout });
      return {
        success: true,
        data: { selector, value, filled: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Fill failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async selectOption(instanceId: string, selector: string, value: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.selectOption(selector, value, { timeout });
      return {
        success: true,
        data: { selector, value, selected: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Select option failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async getPageInfo(instanceId: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const url = instance.page.url();
      const title = await instance.page.title();
      const content = await instance.page.content();
      
      // 获取额外的页面信息
      const viewport = instance.page.viewportSize();
      const loadState = await instance.page.evaluate(() => document.readyState);
      
      // 获取页面的一些基本统计信息
      const pageStats = await instance.page.evaluate(() => {
        const links = document.querySelectorAll('a[href]').length;
        const images = document.querySelectorAll('img').length;
        const forms = document.querySelectorAll('form').length;
        const scripts = document.querySelectorAll('script').length;
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
        
        return {
          linksCount: links,
          imagesCount: images,
          formsCount: forms,
          scriptsCount: scripts,
          stylesheetsCount: stylesheets
        };
      });
      
      return {
        success: true,
        data: { 
          url, 
          title, 
          content,  // 返回完整的HTML内容
          contentLength: content.length,
          viewport,
          loadState,
          stats: pageStats,
          timestamp: new Date().toISOString()
        },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Get page info failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async getElementText(instanceId: string, selector: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const text = await instance.page.textContent(selector, { timeout });
      return {
        success: true,
        data: { selector, text },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Get element text failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async getElementAttribute(instanceId: string, selector: string, attribute: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const value = await instance.page.getAttribute(selector, attribute, { timeout });
      return {
        success: true,
        data: { selector, attribute, value },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Get element attribute failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async screenshot(instanceId: string, options: ScreenshotOptions, selector?: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      let screenshotData: Buffer;
      
      if (selector) {
        const element = await instance.page.$(selector);
        if (!element) {
          return { success: false, error: `Element not found: ${selector}`, instanceId };
        }
        screenshotData = await element.screenshot({
          type: options.type,
          quality: options.type === 'jpeg' ? options.quality : undefined
        });
      } else {
        screenshotData = await instance.page.screenshot({
          fullPage: options.fullPage,
          type: options.type,
          quality: options.type === 'jpeg' ? options.quality : undefined,
          clip: options.clip
        });
      }

      return {
        success: true,
        data: { 
          screenshot: screenshotData.toString('base64'),
          type: options.type,
          selector
        },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Screenshot failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async waitForElement(instanceId: string, selector: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.waitForSelector(selector, { timeout });
      return {
        success: true,
        data: { selector, found: true },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Wait for element failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async waitForNavigation(instanceId: string, timeout: number): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      await instance.page.waitForNavigation({ timeout });
      return {
        success: true,
        data: { url: instance.page.url() },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Wait for navigation failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async evaluate(instanceId: string, script: string): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      const result = await instance.page.evaluate(script);
      return {
        success: true,
        data: { script, result },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Evaluate failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }

  private async getMarkdown(instanceId: string, options: {
    includeLinks: boolean;
    maxLength: number;
    selector?: string;
  }): Promise<ToolResult> {
    const instance = this.browserManager.getInstance(instanceId);
    if (!instance) {
      return { success: false, error: `Instance ${instanceId} not found` };
    }

    try {
      // JavaScript函数来提取页面内容并转换为Markdown
      const markdownContent = await instance.page.evaluate((opts) => {
        const { includeLinks, maxLength, selector } = opts;
        
        // 选择要处理的根元素
        const rootElement = selector ? document.querySelector(selector) : document.body;
        if (!rootElement) {
          return '未找到指定的元素或页面内容';
        }

        // HTML到Markdown转换函数
        function htmlToMarkdown(element: any, depth = 0) {
          let markdown = '';
          const indent = '  '.repeat(depth);
          
          for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent?.trim();
              if (text) {
                markdown += text + ' ';
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              const tagName = el.tagName.toLowerCase();
              
              switch (tagName) {
                case 'h1':
                  markdown += `\n\n# ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h2':
                  markdown += `\n\n## ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h3':
                  markdown += `\n\n### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h4':
                  markdown += `\n\n#### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h5':
                  markdown += `\n\n##### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h6':
                  markdown += `\n\n###### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'p':
                  const pText = htmlToMarkdown(el, depth);
                  if (pText.trim()) {
                    markdown += `\n\n${pText.trim()}\n`;
                  }
                  break;
                case 'br':
                  markdown += '\n';
                  break;
                case 'strong':
                case 'b':
                  markdown += `**${el.textContent?.trim()}**`;
                  break;
                case 'em':
                case 'i':
                  markdown += `*${el.textContent?.trim()}*`;
                  break;
                case 'code':
                  markdown += `\`${el.textContent?.trim()}\``;
                  break;
                case 'pre':
                  markdown += `\n\`\`\`\n${el.textContent?.trim()}\n\`\`\`\n`;
                  break;
                case 'a':
                  const href = el.getAttribute('href');
                  const linkText = el.textContent?.trim();
                  if (includeLinks && href && linkText) {
                    if (href.startsWith('http')) {
                      markdown += `[${linkText}](${href})`;
                    } else {
                      markdown += linkText;
                    }
                  } else {
                    markdown += linkText || '';
                  }
                  break;
                case 'ul':
                case 'ol':
                  markdown += '\n';
                  const listItems = el.querySelectorAll('li');
                  listItems.forEach((li, index) => {
                    const bullet = tagName === 'ul' ? '-' : `${index + 1}.`;
                    markdown += `${indent}${bullet} ${li.textContent?.trim()}\n`;
                  });
                  markdown += '\n';
                  break;
                case 'blockquote':
                  const quoteText = el.textContent?.trim();
                  if (quoteText) {
                    markdown += `\n> ${quoteText}\n\n`;
                  }
                  break;
                case 'div':
                case 'section':
                case 'article':
                case 'main':
                  // 递归处理容器元素
                  markdown += htmlToMarkdown(el, depth);
                  break;
                case 'table':
                  // 简化表格处理
                  const rows = el.querySelectorAll('tr');
                  if (rows.length > 0) {
                    markdown += '\n\n';
                    rows.forEach((row, rowIndex) => {
                      const cells = row.querySelectorAll('td, th');
                      const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');
                      markdown += '| ' + cellTexts.join(' | ') + ' |\n';
                      if (rowIndex === 0) {
                        markdown += '|' + ' --- |'.repeat(cells.length) + '\n';
                      }
                    });
                    markdown += '\n';
                  }
                  break;
                case 'script':
                case 'style':
                case 'nav':
                case 'footer':
                case 'aside':
                  // 忽略这些元素
                  break;
                default:
                  // 对于其他元素，继续递归处理子元素
                  markdown += htmlToMarkdown(el, depth);
                  break;
              }
            }
          }
          
          return markdown;
        }

        // 提取页面标题
        const title = document.title;
        const url = window.location.href;
        
        // 生成Markdown内容
        let content = `# ${title}\n\n**URL:** ${url}\n\n`;
        content += htmlToMarkdown(rootElement);
        
        // 清理多余的空行和空格
        content = content
          .replace(/\n{3,}/g, '\n\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        
        // 截断内容如果超过最大长度
        if (content.length > maxLength) {
          content = content.substring(0, maxLength) + '\n\n[内容已截断...]';
        }
        
        return content;
      }, options);

      return {
        success: true,
        data: { 
          markdown: markdownContent,
          length: markdownContent.length,
          truncated: markdownContent.length >= options.maxLength,
          url: instance.page.url(),
          title: await instance.page.title()
        },
        instanceId
      };
    } catch (error) {
      return {
        success: false,
        error: `Get markdown failed: ${error instanceof Error ? error.message : error}`,
        instanceId
      };
    }
  }
} 