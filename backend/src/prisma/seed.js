const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Mantemos apenas os usuários para garantir o seu acesso ao sistema
const USUARIOS = [
  { nome: 'Almiro Gonçalves', email: 'almiro-gs@hotmail.com', senha: 'ags@Eletronica73', role: 'ADMIN' },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados AGS Eletrônica (Modo Produção/Limpo)...\n');

  // ─── Limpar dados existentes (Efeito Cascata) ────────────────────
  console.log('🗑️  Limpando dados existentes...');
  await prisma.auditLog.deleteMany();
  await prisma.historicoMovimentacao.deleteMany();
  await prisma.itemOrcamento.deleteMany();
  await prisma.fotoEquipamento.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.equipamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.bancoDefeitos.deleteMany();
  await prisma.padraoDefeitoModelo.deleteMany();
  await prisma.usuario.deleteMany();

  // ─── Criar Usuários Essenciais ───────────────────────────────────
  console.log('👤 Criando usuários...');
  const usuarios = [];
  for (const u of USUARIOS) {
    const hash = await bcrypt.hash(u.senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome: u.nome, email: u.email, senha: hash, role: u.role, ativo: true },
    });
    usuarios.push(usuario);
    console.log(`   ✓ ${u.nome} | ${u.email} (${u.role})`);
  }

  // ─── Resumo ──────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║               🌱 SEED CONCLUÍDO COM SUCESSO          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Banco de dados inicializado e pronto para uso real. ║');
  console.log('║                                                      ║');
  console.log('║  Login Admin:                                        ║');
  console.log('║  Email: almiro-gs@hotmail.com                        ║');
  console.log('║  Senha: ags@Eletronica73                             ║');
  console.log('╚══════════════════════════════════════════════════════╝');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });