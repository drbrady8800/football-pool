import {
  pgTable,
  text,
  boolean,
  uuid
} from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
});

export default users;
