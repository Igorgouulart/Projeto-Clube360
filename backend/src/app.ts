import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import { apiRateLimit } from './middlewares/rate-limit.middleware';
import routes from './routes';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'tauri://localhost'
        : ['http://localhost:1420', 'http://localhost:8080'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(apiRateLimit);

app.use('/api', routes);

// Deve ser o último middleware
app.use(errorMiddleware);

export default app;
