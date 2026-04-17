import * as z from 'zod';

export const AnimalSchema = z.object({
    id: z.uuid(),
    //weight: z.coerce.number(),
    //price: z.coerce.number(),
    //color: z.string().optional(),
    //owner: z.string().optional(),
});

//export const AnimalSchemaDTO = AnimalSchema.omit({ id: true });

export type Animal = z.infer<typeof AnimalSchema>;
//export type AnimalDTO = z.infer<typeof AnimalSchemaDTO>;
//export type AnimalUpdateDTO = Partial<AnimalDTO>;
