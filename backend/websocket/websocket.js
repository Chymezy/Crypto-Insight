import { WebSocket, WebSocketServer } from 'ws';
// import { fetchCryptoData } from '../services/cryptoApi.service.js';
import { fetchCryptoDataWithRetry } from '../services/cryptoApi.service.js';

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', async (message) => {
            const data = JSON.parse(message);
            if (data.type === 'SUBSCRIBE_PORTFOLIO') {
                // Subscribe to real-time updates for the portfolio
                // const portfolioData = await fetchCryptoData(data.coinIds);
                const portfolioData = await fetchCryptoDataWithRetry(data.coinIds);
                ws.send(JSON.stringify({ type: 'PORTFOLIO_UPDATE', data: portfolioData }));

                // Set up interval for regular updates
                const intervalId = setInterval(async () => {
                    // const updatedData = await fetchCryptoData(data.coinIds);
                    const updatedData = await fetchCryptoDataWithRetry(data.coinIds);
                    ws.send(JSON.stringify({ type: 'PORTFOLIO_UPDATE', data: updatedData }));
                }, 60000); // Update every minute

                ws.on('close', () => {
                    clearInterval(intervalId);
                });
            }
        });
    });
};