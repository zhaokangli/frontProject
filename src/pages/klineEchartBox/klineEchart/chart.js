// 主入口文件
import { ChartManager } from './chart-manager.js';
import { EventHandler } from './event-handler.js';
import { ApiService } from './api-service.js';

// 初始化函数
async function loadDefaultStock() {
    try {
        const data = await ApiService.fetchKlineData('000001');
        ChartManager.update(data);
    } catch (error) {
        console.error('默认加载股票数据失败:', error);
    }
}

// 主初始化函数
function init() {
    document.body.style.height = '100vh';
    ChartManager.init();
    EventHandler.init();
    setTimeout(loadDefaultStock, 200);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 导出主要类供其他模块使用
export { ChartManager, EventHandler, ApiService };
export default init;