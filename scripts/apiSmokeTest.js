const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: 3001,
      timeout: 10000,
      ...options,
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on('timeout', () => {
      req.destroy(new Error(`HTTP request to ${options.path || '/'} timed out after 10000ms`));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  let serverInstance = null;

  // Check if server is running, if not start it for the test duration
  try {
    await request({ path: '/health', method: 'GET' });
    console.log('Server is already running on port 3001');
  } catch (_err) {
    console.log('Server is not running. Starting Express server for smoke test...');
    const { startServer, server } = require('../server/index');
    await startServer();
    serverInstance = server;
  }

  try {
    console.log('Checking /health');
    const health = await request({ path: '/health', method: 'GET' });
    console.log('health', health.statusCode, health.body.slice(0, 200));

    if (health.statusCode !== 200) {
      throw new Error(`Health check returned unexpected status: ${health.statusCode}`);
    }

    console.log('POST /api/interview/start');
    const startBody = JSON.stringify({ role: 'Frontend Engineer', level: 'Senior' });
    const start = await request(
      {
        path: '/api/interview/start',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(startBody),
        },
      },
      startBody
    );
    console.log('start', start.statusCode, start.body.slice(0, 300));

    console.log('POST /api/interview/respond');
    const respondBody = JSON.stringify({
      role: 'Frontend Engineer',
      level: 'Senior',
      rawTranscript: 'My answer uses caching and TTLs',
      history: [],
    });
    const resp = await request(
      {
        path: '/api/interview/respond',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(respondBody),
        },
      },
      respondBody
    );
    console.log('respond', resp.statusCode, resp.body.slice(0, 400));

    console.log('Smoke test complete');
    process.exitCode = 0;
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exitCode = 2;
  } finally {
    if (serverInstance) {
      console.log('Closing temporary server instance...');
      await new Promise((resolve) => {
        serverInstance.close(() => {
          console.log('Temporary server closed.');
          resolve();
        });
      }).catch(() => {});

      try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
          await mongoose.connection.close().catch(() => {});
        }
      } catch (_) {}
    }
  }
}

run()
  .then(() => {
    process.exit(process.exitCode || 0);
  })
  .catch((err) => {
    console.error('Unhandled smoke test error:', err);
    process.exit(2);
  });
