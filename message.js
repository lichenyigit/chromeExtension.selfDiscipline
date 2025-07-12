// 更新统计数据
function updateStats() {
  const today = new Date().toDateString();
  chrome.storage.local.get(['blockedStats'], (result) => {
    const stats = result.blockedStats || {
      todayCount: 0,
      totalCount: 0,
      savedTime: 0,
      lastDate: null
    };
    // 检查是否是今天
    if (stats.lastDate !== today) {
      stats.todayCount = 0;
      stats.lastDate = today;
    }
    // 增加今天的计数
    stats.todayCount++;
    stats.totalCount++;
    stats.savedTime += 3; // 每次阻止激活3分钟内啡肽
    // 保存统计数据
    chrome.storage.local.set({ blockedStats: stats }, () => {
      document.getElementById('todayCount').textContent = stats.todayCount;
      document.getElementById('totalCount').textContent = stats.totalCount;
      document.getElementById('savedTime').textContent = stats.savedTime;
    });
  });
}
// 页面加载时更新统计
document.addEventListener('DOMContentLoaded', updateStats); 