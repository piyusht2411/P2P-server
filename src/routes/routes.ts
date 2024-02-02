import express, {Router, Express, Request, Response , Application} from 'express';
import {register,signIn, userInfo,signout, sendMoney, addMoney} from "../controller/allController";
import { authenticateToken } from '../middleware/authenticateToken';
import {hour, day, week, month, year,} from '../controller/filter';
//routers
const router = Router();
router.post('/register', register);
router.get('/logout', signout);
router.put('/addmoney/:id', addMoney);

router.post('/login', signIn);
router.put('/sendmoney/:id', sendMoney);
router.get('/userinfo/:id', userInfo);
router.get('/hour/:id',authenticateToken, hour);
router.get('/day/:id',authenticateToken, day);
router.get('/week/:id',authenticateToken, week);
router.get('/month/:id',authenticateToken, month);
router.get('/year/:id',authenticateToken, year);
export default router;