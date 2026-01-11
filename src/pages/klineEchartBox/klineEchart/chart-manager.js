import { chartState } from './state-manager.js';
import { UnifiedChartFactory } from './chart-factory.js';
import { CHART_CONFIG } from './chart-config.js';

// 图表管理器
export class ChartManager {
    static init() {
        const container = document.getElementById('mainChart');
        if (!container) throw new Error('图表容器未找到');
        chartState.instances.main = echarts.init(container, 'dark');
        this.setupEventListeners();
    }

    static setupEventListeners() {
        this.handleResize = this.debounce(this.handleResize.bind(this), 200);
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) setTimeout(() => this.handleResize(), 100);
        });
    }

    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    static handleResize() {
        Object.values(chartState.instances).forEach(chart => {
            if (chart) chart.resize();
        });
        if (chartState.currentData) {
            setTimeout(() => this.update(chartState.currentData), 100);
        }
    }

    static toggleVisibility(chartType, isVisible) {
        if (CHART_CONFIG[chartType] && chartType !== 'main') {
            chartState.visibility[chartType] = isVisible;
            if (chartState.currentData) {
                this.update(chartState.currentData);
                setTimeout(() => this.handleResize(), 300);
            }
        }
    }

    static async update(data) {
        if (!data) return;
        chartState.currentData = data;
        try {
            const option = UnifiedChartFactory.createOption(data);
            chartState.instances.main.setOption(option, { notMerge: true });
            chartState.instances.main.resize();
        } catch (error) {
            console.error('图表更新失败:', error);
        }
    }
}