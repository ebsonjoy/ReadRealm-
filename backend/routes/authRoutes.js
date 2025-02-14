import express from 'express';
const router = express.Router();    
import { register,login,logoutUser,getUser,changePassword,updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/userProctect.js';


router.post('/user-register',register)
router.post('/user-login',login)
router.post('/user-logout', logoutUser)
router.get('/getUser/:userId',protect,getUser)
router.put('/profile',protect,updateUserProfile)
router.put('/change-password',protect,changePassword)

export default router 
