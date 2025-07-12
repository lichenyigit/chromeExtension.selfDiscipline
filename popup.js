// 获取主域名
function getRootDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    // 返回完整的主机名，包括 www 前缀
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// 加载阻止的URL列表
function loadBlockedUrls() {
  try {
    chrome.storage.local.get('blockedUrls', function(result) {
      const urls = result.blockedUrls || [];
      const urlList = document.getElementById('urlList');
      urlList.innerHTML = '';
      if (urls && urls.length > 0) {
        urls.forEach((urlItem, idx) => {
          const urlDiv = document.createElement('div');
          urlDiv.className = 'url-item';
          urlDiv.innerHTML = `
            <div class="url-info">
              <div class="url-domain">${typeof urlItem === 'string' ? urlItem : urlItem.url}</div>
              <div class="url-description">${urlItem.description || '无描述'}</div>
            </div>
            <button class="btn-delete" data-id="${idx}">删除</button>
          `;
          urlList.appendChild(urlDiv);
        });
      } else {
        urlList.innerHTML = '<div class="no-urls">暂无阻止的网站</div>';
      }
    });
  } catch (error) {
    console.error('加载URL列表失败:', error);
  }
}

// 添加新的阻止URL
function addBlockedUrl() {
  const urlInput = document.getElementById('urlInput');
  const descriptionInput = document.getElementById('descriptionInput');
  const url = urlInput.value.trim();
  const description = descriptionInput.value.trim() || '此网站有恶魔😈';
  if (!url) {
    alert('请输入网站地址');
    return;
  }
  chrome.storage.local.get('blockedUrls', function(result) {
    const urls = result.blockedUrls || [];
    urls.push({ url, description });
    chrome.storage.local.set({ blockedUrls: urls }, function() {
      urlInput.value = '';
      descriptionInput.value = '';
      loadBlockedUrls();
      alert('添加成功！');
    });
  });
}

// 复制当前网址
function copyCurrentUrl() {
  try {
    // 获取当前活动标签页的URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        console.log('当前标签页URL:', tabs[0].url);
        const rootDomain = getRootDomain(tabs[0].url);
        console.log('提取的主域名:', rootDomain);
        document.getElementById('urlInput').value = rootDomain;
      }
    });
  } catch (error) {
    console.error('获取当前URL失败:', error);
  }
}

// 删除阻止的URL
function deleteBlockedUrl(idx) {
  chrome.storage.local.get('blockedUrls', function(result) {
    const urls = result.blockedUrls || [];
    urls.splice(idx, 1);
    chrome.storage.local.set({ blockedUrls: urls }, function() {
      loadBlockedUrls();
    });
  });
}

// 清除所有数据
function clearAllData() {
  if (confirm('确定要清除所有保存的数据吗？此操作不可恢复！')) {
    chrome.storage.local.clear(function() {
      loadBlockedUrls();
      alert('所有数据已清除！');
    });
  }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // 加载URL列表
  loadBlockedUrls();
  
  // 添加按钮事件
  document.getElementById('addBtn').addEventListener('click', addBlockedUrl);
  
  // 复制当前网址按钮事件
  document.getElementById('copyCurrentBtn').addEventListener('click', copyCurrentUrl);
  
  // 删除按钮事件（委托）
  document.getElementById('urlList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const idx = e.target.getAttribute('data-id');
      if (confirm('确定要删除这个阻止网站吗？')) {
        deleteBlockedUrl(idx);
      }
    }
  });
  
  // 清除所有数据按钮事件
  document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
  
  // 回车键提交表单
  document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBlockedUrl();
    }
  });
}); 