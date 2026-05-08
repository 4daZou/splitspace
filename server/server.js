/**
 * SplitSpace - server.js
 * Manual HTTP server with port normalization and error handling.
 */

const http = require('http');
const app = require('./app');

// --- Port Normalization ---
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;       // named pipe
  if (port >= 0) return port;        // valid port number
  return false;
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// --- Create HTTP Server ---
const server = http.createServer(app);

// --- Error Handler ---
function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// --- Listening Handler ---
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log(`✅ SplitSpace server listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
