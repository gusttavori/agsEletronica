const { Router } = require('express');
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = Router();

/**
 * @swagger
 * /api/upload/{equipamentoId}:
 *   post:
 *     tags: [Upload]
 *     summary: Faz upload de foto de equipamento
 *     parameters:
 *       - in: path
 *         name: equipamentoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *               tipo:
 *                 type: string
 *                 description: "Tipo da foto (frontal, traseira, defeito)"
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Foto enviada com sucesso
 */
router.post(
  '/:equipamentoId',
  verifyToken,
  upload.single('foto'),
  uploadController.uploadPhoto
);

/**
 * @swagger
 * /api/upload/{id}:
 *   delete:
 *     tags: [Upload]
 *     summary: Exclui uma foto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foto excluída com sucesso
 */
router.delete('/:id', verifyToken, uploadController.deletePhoto);

/**
 * @swagger
 * /api/upload/equipamento/{equipamentoId}:
 *   get:
 *     tags: [Upload]
 *     summary: Lista fotos de um equipamento
 *     parameters:
 *       - in: path
 *         name: equipamentoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de fotos
 */
router.get('/equipamento/:equipamentoId', verifyToken, uploadController.getPhotos);

module.exports = router;
