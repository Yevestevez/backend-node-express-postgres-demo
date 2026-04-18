import debug from 'debug';
import { Router } from 'express';
import type { Pool } from 'pg';

import { env } from '../../config/env.ts';
import {
    AnimalSchemaDTO,
    type Animal,
    type AnimalDTO,
} from '../schemas/animal.ts';
import { HttpError } from '../../errors/http-error.ts';

export const animalsRouter = (pool: Pool) => {
    const log = debug(`${env.PROJECT_NAME}:animals-router`);
    log('Starting Animals Router');

    const router = Router();

    router.get('/', async (_req, res) => {
        const q = `SELECT * FROM animals`;
        const { rows } = await pool.query<Animal>(q);

        return res.json(rows);
    });

    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        log(id);
        const q = `SELECT * FROM animals WHERE id = $1`;

        try {
            const { rows } = await pool.query<AnimalDTO>(q, [id]);

            return res.json(rows);
        } catch (error) {
            const finalError = new HttpError(
                404,
                'NotFound',
                (error as Error).message,
            );
            finalError.cause = error;
            throw finalError;
        }
    });

    router.post('/', async (req, res, next) => {
        const data = AnimalSchemaDTO.parse(req.body);
        const q = `
            INSERT INTO animals (name, english_name, sci_name, diet, lifestyle, location, slogan, group_name, image)
            VALUES
            (name = $1, english_name = $2, sci_name = $3, diet = $4, lifestyle = $5, location = $6, slogan = $7, group_name = $8, image = $9)
            RETURNING *
        `;
        try {
            const { rows } = await pool.query(q, [
                data.name,
                data.englishName,
                data.sciName,
                data.diet,
                data.lifestyle,
                data.location,
                data.slogan,
                data.group,
                data.image,
            ]);
            return res.json(rows);
        } catch (error) {
            next(error);
        }
    });

    return router;
};
