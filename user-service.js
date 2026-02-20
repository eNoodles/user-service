const port = 3100;

import express from 'express';
import { loadRoutes } from './loadRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

await loadRoutes(app);

app.use((req, res) => {
  console.log(`No handler found for ${req.method} ${req.path}`);
  res.status(404).send('NOT FOUND');
});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});
