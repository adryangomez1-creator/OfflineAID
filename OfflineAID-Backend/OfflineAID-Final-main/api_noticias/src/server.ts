import express from 'express';
import type { Express } from 'express';
import { fetchGuatemalaAlerts } from './services/newsService.js';

export const app: Express = express();

const DEFAULT_PORT = 3000;
const NEWS_API_KEY = process.env.NEWSDATA_API_KEY ?? process.env.NEWS_API_KEY;

app.use(express.static('public'));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function handleNewsRequest(_req: express.Request, res: express.Response) {
  console.log(`[${new Date().toLocaleTimeString()}] Peticion recibida de noticias`);
  
  try {
    const alerts = await fetchGuatemalaAlerts(NEWS_API_KEY);
    const unreadCount = alerts.filter((alert) => alert.isUnread).length;

    res.json({
      unreadCount,
      count: alerts.length,
      country: 'gt',
      source: NEWS_API_KEY ? 'newsdata.io + google-news-rss' : 'google-news-rss',
      alerts
    });
  } catch (error) {
    console.error('Error al procesar las alertas del dashboard:', error);

    res.status(500).json({
      unreadCount: 0,
      count: 0,
      country: 'gt',
      source: 'newsdata.io',
      alerts: [],
      error: error instanceof Error ? error.message : 'No se pudieron recuperar las noticias en este momento.'
    });
  }
}

app.get('/api/news', handleNewsRequest);
app.get('/api/alerts', handleNewsRequest);

export function startServer(port = Number(process.env.PORT) || DEFAULT_PORT) {
  return app.listen(port, () => {
    console.log(`Servidor de OFFLINEAID corriendo en http://localhost:${port}`);
    console.log(`Endpoint de pruebas disponible en http://localhost:${port}/api/alerts`);
  });
}

startServer();
