// 内容脚本 - 用于在页面中注入功能
// 这个文件主要用于未来扩展功能，比如在页面上显示提醒等

console.log('自律助手已加载');

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showReminder') {
    // 在页面上显示提醒
    showReminder();
  }
});

// 在页面上显示提醒的函数
function showReminder() {
  const reminder = document.createElement('div');
  reminder.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.5s ease-out;
  `;
  
  reminder.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">自律提醒</div>
    <div>这个网站可能会影响你的效率</div>
  `;
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(reminder);
  
  // 3秒后自动移除
  setTimeout(() => {
    reminder.style.animation = 'slideOut 0.5s ease-in';
    reminder.style.animationFillMode = 'forwards';
    
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(slideOutStyle);
    
    setTimeout(() => {
      if (reminder.parentNode) {
        reminder.parentNode.removeChild(reminder);
      }
    }, 500);
  }, 3000);
} 

// 获取主域名
function getRootDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

// 异步获取阻止列表
function getBlockedUrlsAsync(callback) {
  chrome.storage.local.get('blockedUrls', function(result) {
    const urls = result.blockedUrls || [];
    callback(urls);
  });
}

// 异步检查URL是否在阻止列表中
function isUrlBlockedAsync(url, callback) {
  const currentDomain = getRootDomain(url);
  if (!currentDomain) return callback(false);
  getBlockedUrlsAsync(function(blockedUrls) {
    const blocked = blockedUrls.some(item => {
      if (typeof item === 'string') {
        return item === currentDomain;
      } else if (item && typeof item.url === 'string') {
        return item.url === currentDomain;
      }
      return false;
    });
    callback(blocked);
  });
}

// 跳转到提示页面
function redirectToMessage() {
  const messageUrl = chrome.runtime.getURL('message.html');
  window.location.href = messageUrl;
}

// 每秒检测当前页面url（异步）
function startSelfDisciplineChecker() {
  setInterval(() => {
    const url = window.location.href;
    const domain = getRootDomain(url);
    console.log('[自律助手] 当前页面主域名:', domain);
    isUrlBlockedAsync(url, function(blocked) {
      console.log('[自律助手] 是否在阻止列表:', blocked);
      if (blocked) {
        redirectToMessage();
      }
    });
  }, 1000);
}

// 页面加载完毕后启动定时器（只在普通网页执行）
if (window.location.protocol !== 'chrome-extension:') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSelfDisciplineChecker);
  } else {
    startSelfDisciplineChecker();
  }
} else {
  console.log('[自律助手] 当前为扩展页面，跳过检测');
} 