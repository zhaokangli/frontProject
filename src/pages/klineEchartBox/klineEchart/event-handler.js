import { ChartManager } from './chart-manager.js';
import { CHART_CONFIG } from './chart-config.js';
import { chartState } from './state-manager.js';

// 事件处理器
export class EventHandler {
    static init() {
        this.bindButtonEvents();
        this.initChartSwitches();
    }

    static bindButtonEvents() {
        const buttons = {
            resetBtn: this.handleReset.bind(this),
            fullscreenBtn: this.handleFullscreen.bind(this)
        };
        Object.entries(buttons).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener('click', handler);
        });
    }

    static initChartSwitches() {
        Object.keys(CHART_CONFIG).forEach(chartType => {
            if (chartType !== 'main') {
                const switchId = `${chartType}Switch`;
                const element = document.getElementById(switchId);
                if (element) {
                    element.addEventListener('change', (e) => {
                        ChartManager.toggleVisibility(chartType, e.target.checked);
                    });
                }
            }
        });
    }

    static handleReset() {
        Object.keys(CHART_CONFIG).forEach(key => {
            chartState.visibility[key] = CHART_CONFIG[key].alwaysVisible || true;
        });
        Object.keys(CHART_CONFIG).forEach(chartType => {
            if (chartType !== 'main') {
                const element = document.getElementById(`${chartType}Switch`);
                if (element) element.checked = true;
            }
        });
        if (chartState.currentData) {
            setTimeout(() => {
                ChartManager.update(chartState.currentData);
                ChartManager.handleResize();
            }, 100);
        }
    }

    static handleFullscreen() {
        const container = document.querySelector('.chart-container');
        const methods = ['requestFullscreen', 'webkitRequestFullscreen', 'msRequestFullscreen'];
        for (const method of methods) {
            if (container[method]) {
                container[method]();
                break;
            }
        }
    }
}