import express from 'express';
import { postChatHandler } from './handlers/ollamaHandlers';

const router = express.Router();

router.post('/chat', postChatHandler);

export default router;