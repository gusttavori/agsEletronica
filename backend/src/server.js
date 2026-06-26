const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

console.log('SERVER VERSION 123456');

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           AGS ELETRÔNICA - Backend API              ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor rodando na porta ${PORT}                  ║`);
  console.log(`║  📄 API Docs: http://localhost:${PORT}/api-docs         ║`);
  console.log(`║  🏥 Health:   http://localhost:${PORT}/api/health       ║`);
  console.log(`║  🌍 Ambiente: ${env.NODE_ENV.padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});
