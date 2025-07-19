#!/usr/bin/env node

/**
 * 真实浏览器截图测试脚本
 * 这个脚本会真正启动浏览器并保存截图文件
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';

/**
 * 提取页面Markdown内容的函数
 */
async function extractMarkdown(page, siteName) {
  try {
    const markdownContent = await page.evaluate(() => {
      // HTML到Markdown转换函数（简化版，与MCP工具中相同的逻辑）
      function htmlToMarkdown(element, depth = 0) {
        let markdown = '';
        const indent = '  '.repeat(depth);
        
        for (const node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              markdown += text + ' ';
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
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
              case 'p':
                const pText = htmlToMarkdown(el, depth);
                if (pText.trim()) {
                  markdown += `\n\n${pText.trim()}\n`;
                }
                break;
              case 'a':
                const href = el.getAttribute('href');
                const linkText = el.textContent?.trim();
                if (href && linkText) {
                  if (href.startsWith('http')) {
                    markdown += `[${linkText}](${href})`;
                  } else {
                    markdown += linkText;
                  }
                } else {
                  markdown += linkText || '';
                }
                break;
              case 'strong':
              case 'b':
                markdown += `**${el.textContent?.trim()}**`;
                break;
              case 'em':
              case 'i':
                markdown += `*${el.textContent?.trim()}*`;
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
              case 'div':
              case 'section':
              case 'article':
              case 'main':
                markdown += htmlToMarkdown(el, depth);
                break;
              case 'script':
              case 'style':
              case 'nav':
              case 'footer':
                // 忽略这些元素
                break;
              default:
                markdown += htmlToMarkdown(el, depth);
                break;
            }
          }
        }
        
        return markdown;
      }

      // 提取页面内容
      const title = document.title;
      const url = window.location.href;
      let content = `# ${title}\n\n**URL:** ${url}\n\n`;
      content += htmlToMarkdown(document.body);
      
      // 清理内容
      content = content
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
      
      // 限制长度
      if (content.length > 2000) {
        content = content.substring(0, 2000) + '\n\n[内容已截断...]';
      }
      
      return content;
    });

    // 保存Markdown内容到文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `markdown-${siteName}-${timestamp}.md`;
    await fs.writeFile(filename, markdownContent, 'utf8');
    
    console.log(`✅ Markdown内容已保存: ${filename} (${(markdownContent.length / 1024).toFixed(2)} KB)`);
    
    return { filename, content: markdownContent };
  } catch (error) {
    console.log(`⚠️ 提取${siteName}的Markdown内容失败: ${error.message}`);
    return null;
  }
}

async function testRealScreenshot() {
  console.log('🚀 启动真实浏览器截图测试...');
  
  let browser;
  
  try {
    // 启动浏览器
    browser = await chromium.launch({ headless: true });
    console.log('✅ 浏览器已启动');
    
    // 创建页面
    const page = await browser.newPage();
    console.log('✅ 页面已创建');
    
    // 导航到测试页面
    console.log('🌐 正在导航到 https://example.com...');
    await page.goto('https://example.com');
    console.log('✅ 页面加载完成');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 提取Markdown内容
    console.log('📄 正在提取页面Markdown内容...');
    const markdownContent = await extractMarkdown(page, 'example.com');
    
    // 截图并保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    
    console.log(`📸 正在截图并保存为 ${filename}...`);
    await page.screenshot({ 
      path: filename,
      fullPage: true,
      type: 'png'
    });
    
    console.log(`✅ 截图已保存: ${filename}`);
    
    // 检查文件是否存在
    const stats = await fs.stat(filename);
    console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📂 文件位置: ${process.cwd()}/${filename}`);
    
    // 再截图几个不同的网站进行对比
    const sites = [
      { url: 'https://github.com', name: 'github' }
    ];
    
          for (const site of sites) {
        try {
          console.log(`🌐 正在访问 ${site.url}...`);
          await page.goto(site.url);
          await page.waitForLoadState('networkidle');
          
          // 提取Markdown内容
          console.log(`📄 正在提取 ${site.name} 的Markdown内容...`);
          await extractMarkdown(page, site.name);
          
          const siteFilename = `screenshot-${site.name}-${timestamp}.png`;
          await page.screenshot({ 
            path: siteFilename,
            fullPage: false, // 只截取可视区域，更快
            type: 'png'
          });
          
          const siteStats = await fs.stat(siteFilename);
          console.log(`✅ ${site.name} 截图已保存: ${siteFilename} (${(siteStats.size / 1024).toFixed(2)} KB)`);
          
        } catch (error) {
          console.log(`⚠️ ${site.name} 处理失败: ${error.message}`);
        }
      }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🛑 浏览器已关闭');
    }
  }
}

// 运行测试
testRealScreenshot().catch(console.error); 