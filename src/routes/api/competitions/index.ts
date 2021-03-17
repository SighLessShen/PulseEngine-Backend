import express from 'express';

import { userAuthRequired } from '../../../middleware/auth';

import create from './create';
import adduser from './adduser';
import info from './info';
import admininfo from './admininfo';
import getallscores from './getallscores';
import getscores from './getscores';
import update from './update';

const competitionsRouter = express.Router();

competitionsRouter.route('/create')
    .post(userAuthRequired, create);

competitionsRouter.route('/adduser')
    .post(userAuthRequired, adduser);

competitionsRouter.route('/info')
    .post(userAuthRequired, info);

    competitionsRouter.route('/admininfo')
    .post(userAuthRequired, admininfo);

competitionsRouter.route('/getallscores')
    .post(userAuthRequired, getallscores);

competitionsRouter.route('/getscores')
    .post(userAuthRequired, getscores);

competitionsRouter.route('/update')
    .post(update);

export default competitionsRouter;