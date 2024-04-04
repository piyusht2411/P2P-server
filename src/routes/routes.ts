import express, {Router, Express, Request, Response , Application} from 'express';
import {register,signIn, userInfo,signout, sendMoney, addMoney, sendMailApi} from "../controller/allController";
import { authenticateToken } from '../middleware/authenticateToken';
import {hour, day, week, month, year,} from '../controller/filter';
//routers
const router = Router();
router.post('/register', register);
router.get('/logout', signout);
router.put('/addmoney/:id',authenticateToken, addMoney);

router.post('/login', signIn);
router.put('/sendmoney/:id',authenticateToken, sendMoney);
router.get('/userinfo/:id',authenticateToken, userInfo);
router.get('/hour/:id',authenticateToken, hour);
router.get('/day/:id',authenticateToken, day);
router.get('/week/:id',authenticateToken, week);
router.get('/month/:id',authenticateToken, month);
router.get('/year/:id',authenticateToken, year);
router.post('/sendmail', sendMailApi);
export default router;