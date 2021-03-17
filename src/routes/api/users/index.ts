import express from 'express';

import { userAuthRequired } from '../../../middleware/auth';

import profile from './profile';

const usersRouter = express.Router();

usersRouter.route('/profile')
    .get(userAuthRequired, profile);

export default usersRouter;