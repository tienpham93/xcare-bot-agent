import express from 'express';
import { postGenerateHandler } from './handlers/ollamaHandlers';
import { getTicketsHandler, getUserHandler, postLoginHandler, postTicketHandler } from './handlers/dataHandlers';

const router = express.Router();

router.post('/agent/generate', postGenerateHandler);

router.post('/agent/login', postLoginHandler);
router.get('/agent/user', getUserHandler);

router.get('/agent/tickets', getTicketsHandler);
router.post('/agent/submit', postTicketHandler);

export default router;