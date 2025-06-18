import express from 'express';
import { 
    getAllUsers, 
    getUserById,  
    updateUser,     
} from '../controllers/UserController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import validate from "../middlewares/validate.js";
import { userUpdateSchema } from '../validations/user.validation.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, isAdmin, validate(userUpdateSchema), updateUser);

export default router;
