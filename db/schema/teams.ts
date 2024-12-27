import {
  json,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  mascot: text('mascot').notNull(),
  conference: text('conference').notNull(),
  division: text('division').notNull(),
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color').notNull(),
  logoUrl: text('logo_url').notNull(),
  location: json('location').notNull(),
});

export default teams;
