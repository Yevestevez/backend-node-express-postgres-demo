import * as z from 'zod';

export const AnimalSchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    englishName: z.string().nonempty(),
    sciName: z.string().nonempty(),
    group: z.string().nonempty(),
    image: z.string().url(),
    diet: z.string(),
    lifestyle: z.enum(['Diurno', 'Nocturno']),
    location: z.string(),
    slogan: z.string(),
});

export const AnimalSchemaDTO = z.object({
    name: z.string().nonempty(),
    englishName: z.string().nonempty(),
    sciName: z.string().nonempty(),
    group: z.string().nonempty(),
    image: z.string().url(),
    diet: z.string(),
    lifestyle: z.enum(['Diurno', 'Nocturno']),
    location: z.string(),
    slogan: z.string(),
});

export const AnimalSchemaUpdateDTO = z.object({
    name: z.string().nonempty().optional(),
    englishName: z.string().nonempty().optional(),
    sciName: z.string().nonempty().optional(),
    group: z.string().nonempty().optional(),
    image: z.string().url().optional(),
    diet: z.string().optional(),
    lifestyle: z.enum(['Diurno', 'Nocturno']).optional(),
    location: z.string().optional(),
    slogan: z.string().optional(),
});

export type Animal = z.infer<typeof AnimalSchema>;
export type AnimalDTO = z.infer<typeof AnimalSchemaDTO>;
export type AnimalUpdateDTO = z.infer<typeof AnimalSchemaUpdateDTO>;
