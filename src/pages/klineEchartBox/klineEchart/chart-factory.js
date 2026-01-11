import { CONFIG } from './constants.js';
import { CHART_CONFIG, LINE_CONFIGS } from './chart-config.js';
import { chartState } from './state-manager.js';

// 统一图表工厂
export class UnifiedChartFactory {
    static getBaseConfig() {
        return {
            backgroundColor: CONFIG.CHART.COLORS.backgroundcanvas,
            animation: false,
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                borderWidth: CONFIG.CHART.STYLES.border.width,
                borderColor: CONFIG.CHART.COLORS.border.tooltip,
                backgroundColor: CONFIG.CHART.COLORS.background.tooltip,
                textStyle: { color: CONFIG.CHART.COLORS.text.tooltip }
            },
            grid: CONFIG.CHART.GRID,
            xAxis: {
                type: 'category',
                axisLabel: { color: CONFIG.CHART.COLORS.text.primary }
            },
            yAxis: {
                scale: true,
                axisLabel: { color: CONFIG.CHART.COLORS.text.primary }
            }
        };
    }

    static createOption(data) {
        const processedData = this.processAllData(data);
        const grids = this.calculateGrids();
        const xAxes = this.createXAxes(grids, processedData.timeData);
        const yAxes = this.createYAxes(grids);
        const series = this.createSeries(processedData, grids.length);

        const totalDataPoints = processedData.timeData.length;
        const dataZoom = this.getDataZoomConfig(
            Array.from({ length: xAxes.length }, (_, i) => i),
            totalDataPoints
        );

        const graphic = this.createChartTitles(grids);

        return {
            ...this.getBaseConfig(),
            legend: {
                data: this.getLegendData(),
                textStyle: { color: CONFIG.CHART.COLORS.text.primary }
            },
            grid: grids,
            xAxis: xAxes,
            yAxis: yAxes,
            dataZoom,
            series,
            graphic: graphic.length > 0 ? graphic : undefined
        };
    }

    static processAllData(data) {
        const processedData = {
            timeData: data.kline.map(item => item[0])
        };

        // 统一处理所有线配置需要的数据源
        Object.values(LINE_CONFIGS).forEach(lineConfig => {
            const dataSource = lineConfig.dataSource;
            if (!processedData[dataSource] && data[dataSource]) {
                processedData[dataSource] = lineConfig.processor(data);
            }
        });

        return processedData;
    }

    static createSeries(processedData, gridCount) {
        const series = [];
        
        chartState.visibleCharts.forEach((chartType, gridIndex) => {
            if (gridIndex < gridCount) {
                const chartConfig = CHART_CONFIG[chartType];
                const chartSeries = this.createChartSeries(chartConfig, processedData, gridIndex);
                series.push(...chartSeries);
            }
        });

        return series;
    }

    static createChartSeries(chartConfig, processedData, gridIndex) {
        const series = [];
        
        chartConfig.lines.forEach(lineKey => {
            const lineConfig = LINE_CONFIGS[lineKey];
            if (!lineConfig) return;
            
            const lineData = processedData[lineConfig.dataSource];
            if (!lineData) return;
            
            const seriesItem = {
                name: lineConfig.name,
                type: lineConfig.type,
                xAxisIndex: gridIndex,
                yAxisIndex: gridIndex,
                data: lineData.map(item => lineConfig.dataMapper(item)),
                ...lineConfig.style
            };
            
            series.push(seriesItem);
        });
        
        return series;
    }

    static calculateGrids() {
        const container = document.querySelector('.chart-container');
        const containerHeight = container ? container.clientHeight - 50 : 550;

        const visibleCount = chartState.totalVisibleCharts;
        const { mainRatio, subRatio } = this.getLayoutRatios(visibleCount);
        const splitHeight = 5 * Math.max(0, visibleCount - 1);
        const availableHeight = containerHeight - splitHeight;

        const grids = [];
        let currentTop = 2;

        chartState.visibleCharts.forEach((chartType, index) => {
            const config = CHART_CONFIG[chartType];
            const isMainChart = config.type === 'main';
            const ratio = isMainChart ? mainRatio : subRatio;
            
            if (index > 0) currentTop += 1;

            const backgroundColor = index % 2 === 0
                ? CONFIG.CHART.COLORS.grid.areaEven
                : CONFIG.CHART.COLORS.grid.areaOdd;

            grids.push(this.createGrid(
                index,
                currentTop,
                availableHeight * ratio,
                isMainChart ? 'transparent' : backgroundColor
            ));
            currentTop += ratio * 100;
        });

        return grids;
    }

    static getLayoutRatios(visibleCount) {
        return CONFIG.CHART.LAYOUT.RATIOS[visibleCount] || CONFIG.CHART.LAYOUT.RATIOS.default;
    }

    static createGrid(index, top, height, backgroundColor = 'transparent') {
        return {
            ...CONFIG.CHART.GRID,
            top: `${top}%`,
            height: `${height}px`,
            backgroundColor
        };
    }

    static createXAxes(grids, timeData) {
        return grids.map((grid, index) => {
            const chartType = chartState.visibleCharts[index];
            const config = CHART_CONFIG[chartType];
            
            return {
                type: 'category',
                gridIndex: index,
                boundaryGap: false,
                axisLine: {
                    onZero: false,
                    show: index > 0,
                    lineStyle: { color: CONFIG.CHART.COLORS.border.axis }
                },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: {
                    color: CONFIG.CHART.COLORS.text.primary,
                    show: config.showXAxisLabel || index === grids.length - 1
                },
                data: timeData
            };
        });
    }

    static createYAxes(grids) {
        return grids.map((grid, index) => ({
            type: 'value',
            gridIndex: index,
            scale: true,
            position: 'right',
            splitLine: {
                lineStyle: { color: CONFIG.CHART.COLORS.grid.line }
            },
            splitArea: {
                show: true,
                areaStyle: {
                    color: [
                        CONFIG.CHART.COLORS.grid.areaEven,
                        CONFIG.CHART.COLORS.grid.areaOdd
                    ]
                }
            },
            axisLabel: {
                color: CONFIG.CHART.COLORS.text.primary,
                inside: false,
                margin: 8
            },
            axisLine: {
                show: true,
                lineStyle: { color: CONFIG.CHART.COLORS.border.axis }
            }
        }));
    }

    static getDataZoomConfig(xAxisIndexes = [0], totalDataPoints = 0) {
        const defaultVisibleCount = CONFIG.CHART.VISIBLECOUT;
        let start = 0;
        if (totalDataPoints > defaultVisibleCount) {
            start = ((totalDataPoints - defaultVisibleCount) / totalDataPoints) * 100;
        }

        return [
            {
                type: 'inside',
                xAxisIndex: xAxisIndexes,
                start: start,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                xAxisIndex: xAxisIndexes,
                bottom: '0.5%',
                height: CONFIG.CHART.STYLES.dataZoom.height,
                backgroundColor: CONFIG.CHART.COLORS.background.dataZoom.slider,
                borderColor: CONFIG.CHART.COLORS.border.dataZoom,
                fillerColor: CONFIG.CHART.COLORS.dataZoom.filler,
                dataBackground: {
                    areaStyle: { color: CONFIG.CHART.COLORS.dataZoom.dataArea },
                    lineStyle: { color: CONFIG.CHART.COLORS.dataZoom.dataLine }
                },
                selectedDataBackground: {
                    areaStyle: { color: CONFIG.CHART.COLORS.dataZoom.dataAreaSelected },
                    lineStyle: { color: CONFIG.CHART.COLORS.dataZoom.dataLineSelected }
                },
                handleSize: CONFIG.CHART.STYLES.dataZoom.handleSize,
                handleStyle: {
                    color: CONFIG.CHART.COLORS.dataZoom.handle,
                    borderColor: CONFIG.CHART.COLORS.dataZoom.handleBorder,
                    borderWidth: CONFIG.CHART.STYLES.border.width
                },
                moveHandleSize: CONFIG.CHART.STYLES.dataZoom.moveHandleSize,
                moveHandleStyle: {
                    color: CONFIG.CHART.COLORS.dataZoom.moveHandle
                },
                textStyle: {
                    color: CONFIG.CHART.COLORS.text.primary,
                    fontSize: CONFIG.CHART.STYLES.dataZoom.fontSize
                },
                emphasis: {
                    handleStyle: {
                        color: CONFIG.CHART.COLORS.dataZoom.handleHover,
                        borderColor: CONFIG.CHART.COLORS.dataZoom.handleBorderHover
                    }
                }
            }
        ];
    }

    static createChartTitles(grids) {
        const titles = [];
        const titleStyle = CONFIG.CHART.STYLES.chartTitle;
        
        chartState.visibleCharts.forEach((chartType, index) => {
            const config = CHART_CONFIG[chartType];
            const grid = grids[index];
            
            if (config && grid) {
                titles.push({
                    type: 'text',
                    left: titleStyle.left,
                    top: `${parseFloat(grid.top) + titleStyle.topOffset}%`,
                    style: {
                        text: config.name,
                        fill: CONFIG.CHART.COLORS.text.primary,
                        font: titleStyle.font,
                        backgroundColor: titleStyle.backgroundColor,
                        padding: titleStyle.padding,
                        borderColor: CONFIG.CHART.COLORS.border.axis,
                        borderWidth: titleStyle.borderWidth,
                        borderRadius: titleStyle.borderRadius
                    },
                    z: titleStyle.zIndex
                });
            }
        });

        return titles;
    }

    static getLegendData() {
        const legends = [];
        
        chartState.visibleCharts.forEach(chartType => {
            const config = CHART_CONFIG[chartType];
            if (config.legend) {
                legends.push(...config.legend);
            }
        });

        return legends;
    }
}