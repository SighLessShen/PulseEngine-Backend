import express from 'express';

import competitions from './competitions';
import users from './users';

const apiRouter = express.Router();

apiRouter.use('/competitions', competitions);
apiRouter.use('/users', users);

export default apiRouter;