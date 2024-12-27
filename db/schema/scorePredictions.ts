import {
  pgTable,
  integer,
  uuid
} from 'drizzle-orm/pg-core';
import users from "@/db/schema/users";


const scorePredictions = pgTable('scorePredictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  season: integer('season').notNull(),
  score: integer('score').notNull(),
});

export default scorePredictions;
