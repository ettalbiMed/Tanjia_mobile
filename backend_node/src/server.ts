import { env } from './config/env.js';
import { app } from './app.js';

app.listen(env.port, () => {
  console.log(`API running on :${env.port}`);
});
