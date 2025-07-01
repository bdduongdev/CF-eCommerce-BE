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

router.use(verifyToken, isAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', validate(userUpdateSchema), updateUser);

export default router;
