import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import type { Pool } from 'pg';

import { createApp } from '../../app.ts';
import { connectDB } from '../../config/db-config.ts';
import type { Animal } from '../schemas/animal.ts';

describe('Animals router', () => {
    let pool: Pool;
    let server: Server;
    let baseUrl: string;

    before(async () => {
        pool = await connectDB();
        server = createServer(createApp(pool));
        await new Promise<void>((resolve) => server.listen(0, resolve));
        const { port } = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
        await new Promise<void>((resolve, reject) =>
            server.close((err) => (err ? reject(err) : resolve())),
        );
        await pool.end();
    });

    beforeEach(async () => {
        await pool.query(`DROP TABLE IF EXISTS animals;`);
        await pool.query(`
            CREATE TABLE animals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                english_name VARCHAR(255) NOT NULL,
                sci_name VARCHAR(255) NOT NULL,
                diet TEXT,
                lifestyle VARCHAR(20) CHECK (lifestyle IN ('Diurno', 'Nocturno')),
                location TEXT,
                slogan TEXT,
                group_name VARCHAR(255),
                image TEXT
            );
        `);
        await pool.query(`
            INSERT INTO animals (name, english_name, sci_name, diet, lifestyle, location, slogan, group_name, image)
            VALUES 
            ('Tigre', 'Tiger', 'Panthera tigris', 'Carnívoro', 'Nocturno', 'Asia', 'El rey de la selva', 'Felinos', 'https://example.com/tiger.jpg'),
            ('Elefante', 'Elephant', 'Loxodonta africana', 'Herbívoro', 'Diurno', 'África', 'El gigante gentil de la sabana', 'Proboscídeos', 'https://example.com/elephant.jpg'),
            ('Canguro', 'Kangaroo', 'Macropus rufus', 'Herbívoro', 'Diurno', 'Australia', 'El saltarín del outback australiano', 'Marsupiales', 'https://example.com/kangaroo.jpg'),
            ('Panda', 'Panda', 'Ailuropoda melanoleuca', 'Herbívoro', 'Diurno', 'China', 'El oso de bambú', 'Ursidae', 'https://example.com/panda.jpg'),
            ('Águila', 'Eagle', 'Aquila chrysaetos', 'Carnívoro', 'Diurno', 'Global', 'El rey de los cielos', 'Accipitridae', 'https://example.com/eagle.jpg');
        `);
    });

    afterEach(async () => {
        await pool.query(`DROP TABLE IF EXISTS animals;`);
    });

    describe('Read operations', () => {
        it('Should return all animals', async () => {
            const res = await fetch(`${baseUrl}/api/animals`);

            assert.strictEqual(res.status, 200);

            const body = (await res.json()) as Animal[];

            assert.strictEqual(Array.isArray(body), true);
            assert.strictEqual(body.length, 5);
            assert.strictEqual(body[0]?.id, 1);
            assert.strictEqual(body[0]?.name, 'Tigre');
            assert.strictEqual(body[1]?.id, 2);
            assert.strictEqual(body[1]?.name, 'Elefante');
            assert.strictEqual(body[2]?.id, 3);
            assert.strictEqual(body[2]?.name, 'Canguro');
            assert.strictEqual(body[3]?.id, 4);
            assert.strictEqual(body[3]?.name, 'Panda');
            assert.strictEqual(body[4]?.id, 5);
            assert.strictEqual(body[4]?.name, 'Águila');
        });

        it('Should return a single animal by id', async () => {
            const res = await fetch(`${baseUrl}/api/animals/1`);

            assert.strictEqual(res.status, 200);

            const body = (await res.json()) as Animal;

            assert.strictEqual(body.id, 1);
            assert.strictEqual(body.name, 'Tigre');
            assert.strictEqual(body.englishName, 'Tiger');
            assert.strictEqual(body.sciName, 'Panthera tigris');
            assert.strictEqual(body.diet, 'Carnívoro');
            assert.strictEqual(body.lifestyle, 'Nocturno');
            assert.strictEqual(body.location, 'Asia');
            assert.strictEqual(body.slogan, 'El rey de la selva');
            assert.strictEqual(body.group, 'Felinos');
            assert.strictEqual(body.image, 'https://example.com/tiger.jpg');
        });

        it('Should return 404 for non-existing animal', async () => {
            const res = await fetch(`${baseUrl}/api/animals/999`);

            assert.strictEqual(res.status, 404);

            const body = (await res.json()) as {
                message: string;
                code: string;
                sqlState: string;
                sqlMessage: string;
                statusMessage: string;
            };

            assert.strictEqual(body.message, 'Animal with id 999 not found');
            assert.strictEqual(body.code, 'NOT_FOUND');
            assert.strictEqual(body.sqlState, 'SELECT_FAILED');
            assert.strictEqual(body.sqlMessage, 'No animal found with id 999');
            assert.strictEqual(body.statusMessage, 'Not Found');
        });
    });

    describe('Create operation', () => {
        it('Should create a new animal', async () => {
            const newAnimal = {
                name: 'León',
                englishName: 'Lion',
                sciName: 'Panthera leo',
                diet: 'Carnívoro',
                lifestyle: 'Nocturno',
                location: 'África',
                slogan: 'El rey de la selva',
                group: 'Felinos',
                image: 'https://example.com/lion.jpg',
            };

            const res = await fetch(`${baseUrl}/api/animals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAnimal),
            });

            assert.strictEqual(res.status, 201);

            const body = (await res.json()) as Animal;

            assert.strictEqual(body.id, 6);
            assert.strictEqual(body.name, 'León');
            assert.strictEqual(body.englishName, 'Lion');
            assert.strictEqual(body.sciName, 'Panthera leo');
            assert.strictEqual(body.diet, 'Carnívoro');
            assert.strictEqual(body.lifestyle, 'Nocturno');
            assert.strictEqual(body.location, 'África');
            assert.strictEqual(body.slogan, 'El rey de la selva');
            assert.strictEqual(body.group, 'Felinos');
            assert.strictEqual(body.image, 'https://example.com/lion.jpg');
        });
    });

    describe('Update Operations', () => {
        it('Should update an existing animal', async () => {
            const updatedAnimal = {
                name: 'Águila actualizada',
                englishName: 'Updated Eagle',
                sciName: 'Aquila chrysaetos',
                diet: 'Carnívoro',
                lifestyle: 'Diurno',
                location: 'Global',
                slogan: 'El rey de los cielos actualizado',
                group: 'Accipitridae',
                image: 'https://example.com/updated-eagle.jpg',
            };

            const res = await fetch(`${baseUrl}/api/animals/5`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedAnimal),
            });

            assert.strictEqual(res.status, 200);

            const body = (await res.json()) as Animal;
            console.log(body);

            assert.strictEqual(body.id, 5);
            assert.strictEqual(body.name, 'Águila actualizada');
            assert.strictEqual(body.englishName, 'Updated Eagle');
            assert.strictEqual(body.sciName, 'Aquila chrysaetos');
            assert.strictEqual(body.diet, 'Carnívoro');
            assert.strictEqual(body.lifestyle, 'Diurno');
            assert.strictEqual(body.location, 'Global');
            assert.strictEqual(body.slogan, 'El rey de los cielos actualizado');
            assert.strictEqual(body.group, 'Accipitridae');
            assert.strictEqual(
                body.image,
                'https://example.com/updated-eagle.jpg',
            );
        });
    });
});
