/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = await knex('meals').select()

    return { meals }
  })

  app.get('/:id', async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    return { meal }
  })

  app.post('/', async (request, reply) => {
    const postMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      is_following_diet: z.boolean().optional().default(false),
    })

    const { name, description, is_following_diet } = postMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_following_diet,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const putMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = putMealParamsSchema.parse(request.params)

    const putMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      is_following_diet: z.boolean().optional().default(false),
    })

    const { name, description, is_following_diet } = putMealBodySchema.parse(
      request.body,
    )

    await knex('meals').where('id', id).update({
      name,
      description,
      is_following_diet,
      // updated_at = new Date
    })

    return reply.status(200).send('Content updated')
  })

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    await knex('meals').where('id', id).delete()
  })
}
