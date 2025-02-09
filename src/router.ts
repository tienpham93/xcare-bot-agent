import express from 'express';
import { postGenerateHandler } from './handlers/ollamaHandlers';
import { getTicketsHandler, postLoginHandler } from './handlers/dataHandlers';

const router = express.Router();

router.post('/agent/generate', postGenerateHandler);

router.post('/agent/login', postLoginHandler);
router.post('/agent/tickets', getTicketsHandler);

export default router;