import app from './app';
import { loadOrigins } from './app';

const PORT = process.env.PORT || 3000;

(async () => {
  await loadOrigins();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();