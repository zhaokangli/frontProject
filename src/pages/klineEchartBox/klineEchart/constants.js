// 配置常量
export const CONFIG = {
    CHART: {
        LAYOUT: {
            RATIOS: {
                1: { mainRatio: 1, subRatio: 0 },
                2: { mainRatio: 0.7, subRatio: 0.28 },
                3: { mainRatio: 0.6, subRatio: 0.18 },
                4: { mainRatio: 0.55, subRatio: 0.14 },
                5: { mainRatio: 0.45, subRatio: 0.12 },
                default: { mainRatio: 0.5, subRatio: 0.155}
            }
        },
        COLORS: {
            positive: '#4caf50',
            negative: '#f44336',
            backgroundcanvas: 'transparent',
            grid: {
                areaEven: 'rgba(70,70,70,0.2)',
                areaOdd: 'rgba(80,80,80,0.2)',
                line: 'rgba(255,255,255,0.15)',
                subChartEven: 'rgba(70,70,70,0.2)',
                subChartOdd: 'rgba(80,80,80,0.2)'
            },
            kdj: ['#ff9800', '#2196f3', '#e91e63'],
            macd: ['#ff9800', '#2196f3', '#f44336'],
            zxdq: '#ffffff',
            zxdk: '#ffeb3b',
            dzx20: ['#00bcd4', '#ff5722', '#ffeb3b', '#ffeb3b'],
            dzx20Lines: '#ffeb3b',
            text: {
                primary: '#e0e0e0',
                secondary: '#ccc',
                tooltip: '#e0e0e0'
            },
            border: {
                tooltip: '#777',
                axis: '#1e1919',
                dataZoom: '#555'
            },
            background: {
                tooltip: 'rgba(40,40,40,0.8)',
                dataZoom: {
                    main: '#333',
                    slider: '#1a1a1a',
                    data: '#555'
                }
            },
            dataZoom: {
                filler: 'rgba(187, 134, 252, 0.2)',
                fillerSelected: 'rgba(187, 134, 252, 0.4)',
                handle: 'rgba(187, 134, 252, 0.8)',
                handleBorder: 'rgba(187, 134, 252, 1)',
                handleHover: 'rgba(187, 134, 252, 1)',
                handleBorderHover: 'rgba(59, 59, 59, 0.8)',
                moveHandle: 'rgba(100, 100, 100, 0.8)',
                dataLine: 'rgba(200, 200, 200, 0.3)',
                dataLineSelected: 'rgba(187, 134, 252, 0.8)',
                dataArea: 'rgba(100, 100, 100, 0.3)',
                dataAreaSelected: 'rgba(187, 134, 252, 0.4)'
            }
        },
        GRID: {
            left: '0%',
            right: '6%',
            backgroundColor: 'transparent'
        },
        STYLES: {
            line: {
                width: 1,
                zxdqWidth: 2,
                zxdkWidth: 2
            },
            border: {
                width: 1
            },
            dataZoom: {
                height: 15,
                handleSize: '70%',
                moveHandleSize: 6,
                fontSize: 10
            },
            // 新增图表标题样式配置
            chartTitle: {
                font: 'bold 12px "Microsoft YaHei"',
                backgroundColor: 'rgba(40, 40, 40, 0.7)',
                padding: [2, 6, 2, 6],
                borderWidth: 1,
                borderRadius: 3,
                left: '1%',
                topOffset: 1, // 相对于grid顶部的偏移百分比
                zIndex: 100
            }
        },
        VISIBLECOUT: 50,
    },
    DATA: {
        DECIMAL_PLACES: 2
    }
};