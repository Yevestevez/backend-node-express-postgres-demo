import debug from 'debug';
import { Router } from 'express';
import type { Pool } from 'pg';

import { env } from '../../config/env.ts';

// import { PotatoesController } from '../controller/potatoes-controller.ts';

// const router = (controller: AnimalsController) => {
//     const router = Router();
//     log('Animals Router created');

//     router.get('/', controller.getAll);
//     router.get('/:id', controller.getById);
//     router.post('/', controller.create);
//     router.patch('/:id', controller.updateById);
//     router.delete('/:id', controller.deleteById);

//     return router;
// };

export const animalsRouter = (pool: Pool) => {
    const log = debug(`${env.PROJECT_NAME}:animals-router`);
    log('Starting Animals Router');

    const router = Router();
    log(pool.ending);

    router.get('/', async (_req, res) => {
        return res.json({
            message: 'List of animals',
        });
    });

    router.get('/:id', async (req, res) => {
        const { id } = req.params;

        return res.json({
            message: `Details of animal with id ${id}`,
        });
    });

    return router;
};
