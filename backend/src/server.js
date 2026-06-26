const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           AGS ELETRÔNICA - Backend API               ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor rodando na porta ${PORT}                  ║`);
  console.log(`║  🌍 Ambiente: ${env.NODE_ENV.padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});
