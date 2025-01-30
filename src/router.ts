import express from 'express';
import { postChatHandler, postGenerateHandler } from './handlers/ollamaHandlers';

const router = express.Router();

router.post('/chat', postChatHandler);
router.post('/generate', postGenerateHandler);

export default router;