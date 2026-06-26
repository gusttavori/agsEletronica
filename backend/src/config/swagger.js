const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AGS Eletrônica - API',
      version: '1.0.0',
      description: 'API do sistema de gerenciamento de reparos eletrônicos AGS Eletrônica',
      contact: {
        name: 'AGS Eletrônica',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@agseletronica.com' },
            senha: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    nome: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'TECNICO', 'ATENDENTE'] },
                  },
                },
              },
            },
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string', example: 'João da Silva' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            whatsapp: { type: 'string', example: '(11) 98765-4321' },
            email: { type: 'string', example: 'joao@email.com' },
            endereco: { type: 'string', example: 'Rua das Flores, 123 - São Paulo/SP' },
            observacoes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClienteInput: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: { type: 'string', example: 'João da Silva' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            whatsapp: { type: 'string', example: '(11) 98765-4321' },
            email: { type: 'string', example: 'joao@email.com' },
            endereco: { type: 'string', example: 'Rua das Flores, 123 - São Paulo/SP' },
            observacoes: { type: 'string' },
          },
        },
        Equipamento: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clienteId: { type: 'integer' },
            categoria: { type: 'string', enum: ['TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'] },
            marca: { type: 'string', example: 'Samsung' },
            modelo: { type: 'string', example: 'UN50AU7700' },
            numeroSerie: { type: 'string' },
            dataEntrada: { type: 'string', format: 'date-time' },
            observacoes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EquipamentoInput: {
          type: 'object',
          required: ['clienteId', 'categoria', 'marca', 'modelo'],
          properties: {
            clienteId: { type: 'integer' },
            categoria: { type: 'string', enum: ['TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'] },
            marca: { type: 'string', example: 'Samsung' },
            modelo: { type: 'string', example: 'UN50AU7700' },
            numeroSerie: { type: 'string' },
            observacoes: { type: 'string' },
          },
        },
        OrdemServico: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            numeroOs: { type: 'string', example: 'AGS-2026-0001' },
            clienteId: { type: 'integer' },
            equipamentoId: { type: 'integer' },
            defeitoInformado: { type: 'string' },
            diagnostico: { type: 'string' },
            solucao: { type: 'string' },
            prioridade: { type: 'string', enum: ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'] },
            status: { type: 'string', enum: ['RECEBIDO', 'EM_DIAGNOSTICO', 'AGUARDANDO_APROVACAO', 'EM_REPARO', 'PRONTO', 'ENTREGUE'] },
            valorMaoObra: { type: 'number', format: 'decimal' },
            valorTotal: { type: 'number', format: 'decimal' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrdemServicoInput: {
          type: 'object',
          required: ['clienteId', 'equipamentoId'],
          properties: {
            clienteId: { type: 'integer' },
            equipamentoId: { type: 'integer' },
            defeitoInformado: { type: 'string' },
            diagnostico: { type: 'string' },
            solucao: { type: 'string' },
            prioridade: { type: 'string', enum: ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'] },
            valorMaoObra: { type: 'number' },
          },
        },
        StatusUpdate: {
          type: 'object',
          required: ['status', 'descricao'],
          properties: {
            status: { type: 'string', enum: ['RECEBIDO', 'EM_DIAGNOSTICO', 'AGUARDANDO_APROVACAO', 'EM_REPARO', 'PRONTO', 'ENTREGUE'] },
            descricao: { type: 'string', example: 'Equipamento recebido para diagnóstico' },
          },
        },
        ItemOrcamento: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            ordemServicoId: { type: 'integer' },
            tipo: { type: 'string', enum: ['PECA', 'MAO_DE_OBRA'] },
            descricao: { type: 'string' },
            quantidade: { type: 'integer' },
            valorUnitario: { type: 'number', format: 'decimal' },
            subtotal: { type: 'number', format: 'decimal' },
          },
        },
        ItemOrcamentoInput: {
          type: 'object',
          required: ['tipo', 'descricao', 'quantidade', 'valorUnitario'],
          properties: {
            tipo: { type: 'string', enum: ['PECA', 'MAO_DE_OBRA'] },
            descricao: { type: 'string', example: 'Capacitor 100uF' },
            quantidade: { type: 'integer', example: 2 },
            valorUnitario: { type: 'number', example: 15.50 },
          },
        },
        BancoDefeitos: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            marca: { type: 'string' },
            modelo: { type: 'string' },
            categoria: { type: 'string' },
            sintoma: { type: 'string' },
            diagnostico: { type: 'string' },
            solucao: { type: 'string' },
            pecasUtilizadas: { type: 'string' },
            observacoes: { type: 'string' },
            ordemServicoId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BancoDefeitosInput: {
          type: 'object',
          required: ['marca', 'modelo', 'categoria', 'sintoma', 'diagnostico', 'solucao'],
          properties: {
            marca: { type: 'string' },
            modelo: { type: 'string' },
            categoria: { type: 'string', enum: ['TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'] },
            sintoma: { type: 'string' },
            diagnostico: { type: 'string' },
            solucao: { type: 'string' },
            pecasUtilizadas: { type: 'string' },
            observacoes: { type: 'string' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            statusCounts: { type: 'object' },
            servicesByCategory: { type: 'array', items: { type: 'object' } },
            recentOrders: { type: 'array', items: { $ref: '#/components/schemas/OrdemServico' } },
            monthlyStats: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { background-color: #121212; } .swagger-ui .topbar .link { color: #FFD100; }',
    customSiteTitle: 'AGS Eletrônica - API Docs',
  }));
};

module.exports = setupSwagger;
