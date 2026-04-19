import debug from 'debug';
import { Router } from 'express';
import type { Pool } from 'pg';

import { env } from '../../config/env.ts';
import {
    AnimalSchemaDTO,
    AnimalSchemaUpdateDTO,
    type Animal,
} from '../schemas/animal.ts';
import { HttpError } from '../../errors/http-error.ts';
import { SqlError } from '../../errors/sql-error.ts';

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

        let rows: Animal[];

        try {
            ({ rows } = await pool.query<Animal>(q, [id]));
        } catch (error) {
            const finalError = new HttpError(
                500,
                'Internal Server Error',
                (error as Error).message,
            );
            finalError.cause = error;
            throw finalError;
        }

        if (rows.length === 0) {
            throw new SqlError(`Animal with id ${id} not found`, {
                code: 'NOT_FOUND',
                sqlState: 'SELECT_FAILED',
                sqlMessage: `No animal found with id ${id}`,
            });
        }

        return res.json(rows[0]);
    });

    router.post('/', async (req, res) => {
        const parsed = AnimalSchemaDTO.safeParse(req.body);

        if (!parsed.success) {
            throw new HttpError(
                400,
                'BadRequest',
                parsed.error.issues[0]?.message,
            );
        }

        const data = parsed.data;
        const q = `
            INSERT INTO animals (name, english_name, sci_name, diet, lifestyle, location, slogan, group_name, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        try {
            const { rows } = await pool.query<Animal>(q, [
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

            return res.status(201).json(rows[0]);
        } catch (error) {
            const finalError = new HttpError(
                500,
                'InternalServerError',
                (error as Error).message,
            );
            finalError.cause = error;
            throw finalError;
        }
    });

    router.patch('/:id', async (req, res) => {
        const { id } = req.params;

        const parsed = AnimalSchemaUpdateDTO.safeParse(req.body);

        if (!parsed.success) {
            throw new HttpError(
                400,
                'BadRequest',
                parsed.error.issues[0]?.message,
            );
        }

        const data = parsed.data;

        const q = `
            UPDATE animals SET
                name = COALESCE($2, name),
                english_name = COALESCE($3, english_name),
                sci_name = COALESCE($4, sci_name),
                diet = COALESCE($5, diet),
                lifestyle = COALESCE($6, lifestyle),
                location = COALESCE($7, location),
                slogan = COALESCE($8, slogan),
                group_name = COALESCE($9, group_name),
                image = COALESCE($10, image)
            WHERE id = $1
            RETURNING *
        `;

        let rows: Animal[];

        try {
            ({ rows } = await pool.query<Animal>(q, [
                id,
                data.name,
                data.englishName,
                data.sciName,
                data.diet,
                data.lifestyle,
                data.location,
                data.slogan,
                data.group,
                data.image,
            ]));
        } catch (error) {
            const finalError = new HttpError(
                500,
                'Internal Server Error',
                (error as Error).message,
            );
            finalError.cause = error;
            throw finalError;
        }

        if (rows.length === 0) {
            throw new SqlError(`Animal with id ${id} not found`, {
                code: 'NOT_FOUND',
                sqlState: 'UPDATE_FAILED',
                sqlMessage: `No animal found with id ${id}`,
            });
        }

        return res.json(rows[0] as Animal);
    });

    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        const q = `DELETE FROM animals WHERE id = $1 RETURNING *`;

        let rows: Animal[];

        try {
            ({ rows } = await pool.query<Animal>(q, [id]));
        } catch (error) {
            const finalError = new HttpError(
                500,
                'Internal Server Error',
                (error as Error).message,
            );
            finalError.cause = error;
            throw finalError;
        }

        if (rows.length === 0) {
            throw new SqlError(`Animal with id ${id} not found`, {
                code: 'NOT_FOUND',
                sqlState: 'DELETE_FAILED',
                sqlMessage: `No animal found with id ${id}`,
            });
        }

        return res.json(rows[0]);
    });

    return router;
};
