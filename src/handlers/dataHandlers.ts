import { AuthService } from "../services/authService";
import { Request, Response } from 'express';
import { logger } from "../utils/logger";
import * as fs from 'fs';
import path from "path";

export const postLoginHandler = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    const authService = new AuthService(username, password);

    try {
        const userData = await authService.getUserDataAndToken();
        res.json(userData);
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

export const getTicketsHandler = async (req: Request, res: Response): Promise<void> => {
    
    // Verify Auth Token
    const authService = new AuthService();
    const authToken = req.headers.authorization;

    if (authToken) {
        authService.verifyTokenFromHeader(authToken);
    } else {
        logger.error('Unauthorized request');
        res.status(401).json({ error: 'Unauthorized request' });
        return;
    }

    try {
        // Get ticket form json file
        const data = fs.readFileSync(path.join(process.cwd(), 'src/data/ticketsData.json'), 'utf8');
        const tickets = JSON.parse(data);
        res.json(tickets);
    } catch (error) {
        res.status(404).json({ error: 'Tickets not found' });
    }
};