// src/components/KlineEchart/KlineChart.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { CHART_CONFIG, LINE_CONFIGS } from './chart-config';
import { CONFIG } from './constants';
import { DataProcessor } from './data-processor';
import { ApiService } from './api-service';
import { useChartState } from './useChartState';
import { useChartEvents } from './useChartEvents';

// 图表工厂逻辑（内联到组件，替代原 chart-factory.js）
const createChartOption = (data, visibleCharts) => {
    // 处理数据
    const processAllData = (rawData) => {
        const processedData = {
            timeData: rawData.kline.map(item => item[0])
        };

        Object.values(LINE_CONFIGS).forEach(lineConfig => {
            const dataSource = lineConfig.dataSource;
            if (!processedData[dataSource] && rawData[dataSource]) {
                processedData[dataSource] = lineConfig.processor(rawData);
            }
        });

        return processedData;
    };

    // 计算网格布局
    const calculateGrids = () => {
        const container = document.querySelector('.chart-container');
        const containerHeight = container ? container.clientHeight - 50 : 550;
        const visibleCount = visibleCharts.length;
        
        const { mainRatio, subRatio } = CONFIG.CHART.LAYOUT.RATIOS[visibleCount] || CONFIG.CHART.LAYOUT.RATIOS.default;
        const splitHeight = 5 * Math.max(0, visibleCount - 1);
        const availableHeight = containerHeight - splitHeight;

        const grids = [];
        let currentTop = 2;

        visibleCharts.forEach((chartType, index) => {
            const config = CHART_CONFIG[chartType];
            const isMainChart = config.type === 'main';
            const ratio = isMainChart ? mainRatio : subRatio;
            
            if (index > 0) currentTop += 1;

            const backgroundColor = index % 2 === 0
                ? CONFIG.CHART.COLORS.grid.areaEven
                : CONFIG.CHART.COLORS.grid.areaOdd;

            grids.push({
                ...CONFIG.CHART.GRID,
                top: `${currentTop}%`,
                height: `${availableHeight * ratio}px`,
                backgroundColor: isMainChart ? 'transparent' : backgroundColor
            });
            currentTop += ratio * 100;
        });

        return grids;
    };

    // 创建X轴
    const createXAxes = (grids, timeData) => {
        return grids.map((grid, index) => {
            const chartType = visibleCharts[index];
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
    };

    // 创建Y轴
    const createYAxes = (grids) => {
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
    };

    // 创建数据缩放配置
    const getDataZoomConfig = (xAxesIndexes = [0], totalDataPoints = 0) => {
        const defaultVisibleCount = CONFIG.CHART.VISIBLECOUT;
        let start = 0;
        if (totalDataPoints > defaultVisibleCount) {
            start = ((totalDataPoints - defaultVisibleCount) / totalDataPoints) * 100;
        }

        return [
            {
                type: 'inside',
                xAxisIndex: xAxesIndexes,
                start: start,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                xAxisIndex: xAxesIndexes,
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
    };

    // 创建图表标题
    const createChartTitles = (grids) => {
        const titles = [];
        const titleStyle = CONFIG.CHART.STYLES.chartTitle;
        
        visibleCharts.forEach((chartType, index) => {
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
    };

    // 创建图例数据
    const getLegendData = () => {
        const legends = [];
        visibleCharts.forEach(chartType => {
            const config = CHART_CONFIG[chartType];
            if (config.legend) {
                legends.push(...config.legend);
            }
        });
        return legends;
    };

    // 创建系列数据
    const createSeries = (processedData, grids) => {
        const series = [];
        
        visibleCharts.forEach((chartType, gridIndex) => {
            if (gridIndex < grids.length) {
                const chartConfig = CHART_CONFIG[chartType];
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
            }
        });

        return series;
    };

    // 主逻辑
    const processedData = processAllData(data);
    const grids = calculateGrids();
    const xAxes = createXAxes(grids, processedData.timeData);
    const yAxes = createYAxes(grids);
    const series = createSeries(processedData, grids);
    const dataZoom = getDataZoomConfig(
        Array.from({ length: xAxes.length }, (_, i) => i),
        processedData.timeData.length
    );
    const graphic = createChartTitles(grids);

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
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        dataZoom,
        series,
        graphic: graphic.length > 0 ? graphic : undefined,
        legend: {
            data: getLegendData(),
            textStyle: { color: CONFIG.CHART.COLORS.text.primary }
        }
    };
};

// 核心组件
const KlineChart = ({ defaultCode = '000001' }) => {
    const chartRef = useRef(null);
    const {
        visibility,
        currentData,
        visibleCharts,
        setCurrentData,
        setCurrentCode,
        toggleVisibility,
        resetVisibility,
        totalVisibleCharts
    } = useChartState();

    // 初始化图表
    useEffect(() => {
        const container = document.getElementById('mainChart');
        if (container) {
            chartRef.current = echarts.init(container, 'dark');
        }

        // 清理函数
        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
                chartRef.current = null;
            }
        };
    }, []);

    // 加载默认数据
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await ApiService.fetchKlineData(defaultCode);
                setCurrentData(data);
                setCurrentCode(defaultCode);
                updateChart(data);
            } catch (error) {
                console.error('默认加载股票数据失败:', error);
            }
        };

        setTimeout(loadData, 200);
    }, [defaultCode, setCurrentData, setCurrentCode]);

    // 更新图表
    const updateChart = useCallback((data = currentData) => {
        if (!data || !chartRef.current) return;
        
        try {
            const option = createChartOption(data, visibleCharts);
            chartRef.current.setOption(option, { notMerge: true });
            chartRef.current.resize();
        } catch (error) {
            console.error('图表更新失败:', error);
        }
    }, [currentData, visibleCharts]);

    // 可见性变化时更新图表
    useEffect(() => {
        if (currentData) {
            updateChart();
            setTimeout(() => {
                if (chartRef.current) chartRef.current.resize();
            }, 300);
        }
    }, [visibility, updateChart, currentData]);

    // 事件处理
    const { handleReset, handleFullscreen } = useChartEvents({
        resetVisibility,
        toggleVisibility,
        chartRef,
        updateChart
    });

    // 样式（内联或抽离到CSS模块）
    const styles = {
        container: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'auto 1fr',
            gap: '5px',
            height: 'calc(100vh - 40px)',
            minHeight: '500px',
            background: '#1a1a1a',
            color: '#e0e0e0',
            padding: '20px'
        },
        controls: {
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            background: '#2a2a2a',
            borderRadius: '8px',
            minHeight: '60px',
            padding: '0 20px'
        },
        controlGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '10px 0'
        },
        switchLabel: {
            color: '#e0e0e0',
            fontWeight: 'bold'
        },
        switches: {
            display: 'flex',
            gap: '20px'
        },
        switch: {
            position: 'relative',
            display: 'inline-block',
            width: '70px',
            height: '24px'
        },
        switchInput: {
            opacity: 0,
            width: 0,
            height: 0
        },
        slider: {
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#555',
            transition: '.4s',
            borderRadius: '24px',
            padding: '0 8px',
            lineHeight: '24px',
            fontSize: '12px',
            color: 'white',
            textAlign: 'center'
        },
        sliderBefore: {
            position: 'absolute',
            content: '""',
            height: '16px',
            width: '16px',
            left: '14px',
            bottom: '4px',
            backgroundColor: 'white',
            transition: '.4s',
            borderRadius: '50%'
        },
        button: {
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#bb86fc',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s'
        },
        buttonHover: {
            background: '#9b5de5'
        },
        chartContainer: {
            background: '#2a2a2a',
            borderRadius: '8px',
            position: 'relative',
            height: '100%',
            minHeight: '400px'
        },
        mainChart: {
            width: '100%',
            height: '100%'
        }
    };

    return (
        <div style={styles.container}>
            {/* 控制区域 */}
            <div style={styles.controls}>
                <div style={styles.controlGroup}>
                    <label style={styles.switchLabel}>副图显示控制:</label>
                    <div style={styles.switches}>
                        {Object.keys(CHART_CONFIG).filter(key => key !== 'main').map(chartType => (
                            <label key={chartType} style={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={visibility[chartType]}
                                    onChange={(e) => toggleVisibility(chartType, e.target.checked)}
                                    style={styles.switchInput}
                                />
                                <span style={styles.slider}>
                                    {CHART_CONFIG[chartType].name}
                                </span>
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newVis = {};
                            Object.keys(visibility).forEach(key => {
                                if (key !== 'main') newVis[key] = !visibility[key];
                            });
                            setVisibility(newVis);
                        }}
                        style={styles.button}
                    >
                        全部切换
                    </button>
                </div>

                <div style={styles.controlGroup}>
                    <button onClick={handleReset} style={styles.button}>重置图表</button>
                    <button onClick={handleFullscreen} style={styles.button}>全屏</button>
                </div>
            </div>

            {/* 图表容器 */}
            <div style={styles.chartContainer} className="chart-container">
                <div id="mainChart" style={styles.mainChart}></div>
            </div>
        </div>
    );
};

export default KlineChart;