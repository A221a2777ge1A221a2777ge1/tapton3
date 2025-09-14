import { onRequest } from 'firebase-functions/v2/https';
import next from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const server = next({
  dev: isDev,
  conf: { distDir: '.next' },
});

const nextjsHandle = server.getRequestHandler();

export const nextServer = onRequest(
    { minInstances: 1, region: 'us-central1' }, 
    (req, res) => {
        return server.prepare().then(() => nextjsHandle(req, res));
    }
);

export { migrateOnConnect } from './migrateOnConnect';
