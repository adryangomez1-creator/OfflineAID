import express, { type Express } from 'express';
import apiRoutes from './routes/api.routes.js';

const app: Express = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.get('/', (_req, res) => res.json({ mensaje: 'API OfflineAid funcionando' }));
app.use('/api', apiRoutes);

export default app;