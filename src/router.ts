import express from 'express';
import { postGenerateHandler } from './handlers/ollamaHandlers';

const router = express.Router();

router.post('/generate', postGenerateHandler);

export default router;