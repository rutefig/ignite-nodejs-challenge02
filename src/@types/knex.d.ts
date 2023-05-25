import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      session_id: string
      name: string
      description?: string
      created_at: string
      updated_at?: string
      is_following_diet: boolean
    }
  }
}
