import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (_req: Request, res: Response) => {
  res.send('Charronix Backend Live 🚀');
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Charronix server running on port ${PORT}`);
});
