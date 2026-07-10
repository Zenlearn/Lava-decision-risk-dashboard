import { Router, Request, Response } from 'express';
import logger from '../configs/logger.config';
import { getEnvVar } from '../helpers/env';

const analyticsRouter = Router();
const PATHWAYS_BACKEND_URL = getEnvVar('PATHWAYS_BACKEND_URL', 'http://app3001:3001');

/**
 * Proxy /api/v1/analytics/* to PathwaysBackend/analytics/*
 * Forwards the 'token' cookie so PathwaysBackend can authenticate the request.
 */
analyticsRouter.all('/*', async (req: Request, res: Response): Promise<void> => {
	try {
		const targetUrl = `${PATHWAYS_BACKEND_URL}/analytics${req.path}`;
		const token = req.cookies?.token;

		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...(req.ip ? { 'X-Forwarded-For': req.ip } : {}),
		};

		// Forward the token cookie to the backend
		if (token) {
			headers['Cookie'] = `token=${token}`;
		}

		const fetchOptions: RequestInit = {
			method: req.method,
			headers,
		};

		if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
			fetchOptions.body = JSON.stringify(req.body);
		}

		const upstreamResponse = await fetch(targetUrl, fetchOptions);
		
		const contentType = upstreamResponse.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await upstreamResponse.json();
			res.status(upstreamResponse.status).json(data);
		} else {
			const text = await upstreamResponse.text();
			res.status(upstreamResponse.status).send(text);
		}
	} catch (err: any) {
		logger.error('Analytics proxy: failed to reach PathwaysBackend', {
			error: err.message,
			path: req.path
		});
		res.status(503).json({
			message: 'Service temporarily unavailable.',
		});
	}
});

export default analyticsRouter;
