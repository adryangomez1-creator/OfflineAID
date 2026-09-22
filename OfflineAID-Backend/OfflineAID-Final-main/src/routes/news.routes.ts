import { Router, type Router as ExpressRouter } from 'express';
import { fetchGuatemalaAlerts } from '../../api_noticias/src/services/newsService.js';

const router: ExpressRouter = Router();
const NEWS_API_KEY = process.env.NEWSDATA_API_KEY ?? process.env.NEWS_API_KEY;

router.get('/news', async (_req, res): Promise<void> => {
  try {
    const alerts = await fetchGuatemalaAlerts(NEWS_API_KEY);
    res.json({
      unreadCount: alerts.filter(alert => alert.isUnread).length,
      count: alerts.length,
      country: 'gt',
      source: NEWS_API_KEY ? 'newsdata.io + google-news-rss' : 'google-news-rss',
      alerts
    });
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(502).json({
      unreadCount: 0,
      count: 0,
      country: 'gt',
      source: NEWS_API_KEY ? 'newsdata.io + google-news-rss' : 'google-news-rss',
      alerts: [],
      error: error instanceof Error ? error.message : 'No se pudieron recuperar las noticias.'
    });
  }
});

export default router;