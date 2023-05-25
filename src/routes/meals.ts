/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const meals = await knex('meals').where('session_id', sessionId).select()

    return { meals }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const meal = await knex('meals')
      .where({
        id,
        session_id: sessionId,
      })
      .first()

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

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_following_diet,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
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

      const { sessionId } = request.cookies

      await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .update({
          name,
          description,
          is_following_diet,
          updated_at: knex.fn.now(),
        })

      return reply.status(200).send({
        message: 'Content updated',
      })
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      await knex('meals').where({ id, session_id: sessionId }).delete()

      return reply.status(200).send({
        message: 'Content deleted',
      })
    },
  )
}
