import express from 'express';
import os from "os";
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import { checkDatabaseConnection, isDatabaseConnected } from './server/database/client';
import { checkSupabaseConnection, initializeSupabaseStorage, isSupabaseConnected } from './server/database/supabase';
import { seedDatabaseIfNeeded } from './server/database/seed';
import { RepositoryFactory } from './server/repositories/factory';
import { httpLogger } from './server/middlewares/logging.middleware';
import { errorHandler, handleNotFound } from './server/middlewares/error.middleware';
import apiRouter from './server/routes';
import { config } from './server/config';

async function startServer() {
  const app = express();
  const PORT = config.port;

  // 1. Centralized Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allow external unsplash images and Google fonts to render inside the iframe preview
    crossOriginEmbedderPolicy: false
  }));

  // 2. Cross-Origin Resource Sharing
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // 3. Centralized Body Parsers
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // 4. Trace & Logging Middleware
  app.use(httpLogger);

  // 5. Synchronous Database & Supabase Connectivity Health Check
  console.log('🔄 Initiating database & Supabase connectivity checks...');
  try {
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      console.error('❌ PostgreSQL unreachable or missing.');
      process.exit(1);
    }
    console.log('✅ PostgreSQL Connected');
  } catch (dbErr) {
    console.error('❌ Exception checking database connectivity:', dbErr);
    process.exit(1);
  }

  try {
    const isSupaConnected = await checkSupabaseConnection();
    if (!isSupaConnected) {
      console.error('❌ Supabase API unreachable or missing.');
      process.exit(1);
    }
    console.log('✅ Supabase Connected');
    await initializeSupabaseStorage();
  } catch (supaErr) {
    console.error('❌ Exception checking Supabase connectivity:', supaErr);
    process.exit(1);
  }

  // Seed default data if needed
  await seedDatabaseIfNeeded();

  // Reset the factory repository cache to apply the correct strategy based on active connections
  RepositoryFactory.resetCache();
  console.log('✅ Database Initialized');

  // 6. Base Health Check Route
  app.get('/api/health', (req, res) => {
    let activeDatabase = 'IN_MEMORY_FALLBACK';
    if (isSupabaseConnected()) {
      activeDatabase = 'SUPABASE';
    } else if (isDatabaseConnected()) {
      activeDatabase = 'PRISMA_POSTGRES';
    }

    res.json({
      status: 'PRISTINE',
      timestamp: new Date().toISOString(),
      database: activeDatabase,
      supabaseConnected: isSupabaseConnected(),
      prismaConnected: isDatabaseConnected(),
      uptime: process.uptime()
    });
  });

  // 7. Mount Core REST API Namespace
  app.use('/api', apiRouter);

  // 8. Integration with Client Asset pipeline
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Running in development mode. Mounting Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Running in production mode. Serving static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 9. Centralized Error Handlers
  app.use(handleNotFound);
  app.use(errorHandler);

  // 10. Listen to requests
  function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const net of iface) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }

    return "127.0.0.1";
  }

  const LOCAL_IP = getLocalIPAddress();
  app.listen(PORT, "0.0.0.0", () => {
    console.clear();

    console.log("======================================");
    console.log("🚀 ChainShield Server Started");
    console.log("======================================");
    console.log(`🏠 Local Host   : http://localhost:${PORT}`);
    console.log(`🌐 Network Host : http://${LOCAL_IP}:${PORT}`);
    console.log("======================================");
  });
}

startServer().catch((err) => {
  console.error('💥 Critical failure booting ChainShield master node:', err);
  process.exit(1);
});
