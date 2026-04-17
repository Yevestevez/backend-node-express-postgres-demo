import debug from 'debug';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import type { Pool } from 'pg';

import { env } from './config/env.ts';
import { animalsRouter } from './animals/router/animals-router.ts';

export const createApp = (pool: Pool) => {
    const log = debug(`${env.PROJECT_NAME}:app`);
    log('Starting Express app...');
    const app = express();

    app.disable('x-powered-by');
    app.use(morgan('dev'));
    app.use(
        cors({
            origin: '*',
        }),
    );
    app.use(express.json());
    app.use(express.urlencoded());

    app.use('api/animals', animalsRouter(pool));

    app.use((_req, res) => {
        res.status(404);
        res.statusMessage = 'Not Found';
        res.json({
            message: 'Resource not found',
        });
        return;
    });

    return app;
};
