import { AuthService } from "../services/authService";
import { Request, Response } from 'express';
import { logger } from "../utils/logger";
import * as fs from 'fs';
import path from "path";
import { UserCredential } from "../types";

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

export const getUserHandler = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.query;
    try {
        const data = fs.readFileSync(path.join(process.cwd(), 'src/data/userData.json'), 'utf8');

        const users = JSON.parse(data);
        const userData = await users.find((user: any) => user.username === username);
    
        if (userData) {
            userData.credentials = {} as UserCredential;
        } else {
            throw new Error('User not found');
        }
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getTicketsHandler = async (req: Request, res: Response): Promise<void> => {
    // Verify Auth Token
    const authService = new AuthService();
    const authToken = req.headers.authorization;

    // Get createdBy from query
    const { createdBy } = req.query;

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
        const ticketByUser = tickets.filter((ticket: any) => ticket.createdBy === createdBy);
        res.json(ticketByUser);
    } catch (error) {
        res.status(404).json({ error: 'Tickets not found' });
    }
};

export const postTicketHandler = async (req: Request, res: Response): Promise<void> => {
    const { title, content, createdBy, email } = req.body;

    try {
        const data = fs.readFileSync(path.join(process.cwd(), 'src/data/ticketsData.json'), 'utf8');
        const tickets = await JSON.parse(data);
        const newTicket = {
            id: tickets.length + 1,
            title,
            content,
            createdBy,
            email,
            status: 'Open'
        };
        await tickets.push(newTicket);
        fs.writeFileSync(path.join(process.cwd(), 'src/data/ticketsData.json'), JSON.stringify(await tickets, null, 2));
        res.json(newTicket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};