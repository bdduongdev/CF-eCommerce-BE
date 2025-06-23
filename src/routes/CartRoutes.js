import express from 'express';
import { 
    addToCart,
    getCart,
    removeFromCart,
    updateCartItemQuantity
} from '../controllers/CartController.js';
import { verifyToken, isCustomer } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { addToCartSchema } from '../validations/cart.validation.js';

const router = express.Router();

// All routes require user to be logged in and to be a customer
router.use(verifyToken, isCustomer);

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addToCart);
router.put('/update/:cartItemId', updateCartItemQuantity);
router.delete('/remove/:cartItemId', removeFromCart);

export default router;
