import * as relations from '@/db/schema/_relations';
import games from '@/db/schema/games';
import picks from '@/db/schema/picks';
import teams from '@/db/schema/teams';
import users from '@/db/schema/users';
import scorePredictions from '@/db/schema/scorePredictions';

const schema = { games, picks, teams, users, scorePredictions, ...relations };

export default schema;
