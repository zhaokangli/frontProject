// API服务
export class ApiService {
    static async fetchKlineData(code) {
        try {
            const response = await fetch(`/api/kline/${code}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('获取K线数据失败:', error);
            throw error;
        }
    }
}