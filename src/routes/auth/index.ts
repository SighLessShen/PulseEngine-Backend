import express from 'express';

import register from './register';
import login from './login';

const authRouter = express.Router();

authRouter.route('/register')
    .post(register);

authRouter.route('/login')
    .post(login);

export default authRouter;