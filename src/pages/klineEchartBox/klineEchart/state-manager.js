import { CHART_CONFIG } from './chart-config.js';

export class ChartState {
    constructor() {
        this.instances = {};
        this.currentCode = '';
        this.currentData = null;
        
        this.visibility = {};
        Object.keys(CHART_CONFIG).forEach(key => {
            this.visibility[key] = CHART_CONFIG[key].alwaysVisible || true;
        });
        
        // 新增线级别的可见性控制（可选）
        this.lineVisibility = {};
    }

    get visibleCharts() {
        return Object.keys(this.visibility).filter(key => this.visibility[key]);
    }

    get totalVisibleCharts() {
        return this.visibleCharts.length;
    }
}

export const chartState = new ChartState();