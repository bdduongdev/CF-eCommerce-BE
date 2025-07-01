import express from 'express';
import { 
    addToCart,
    getCart,
    removeFromCart,
    updateCartItemQuantity,
    checkoutSelectedCartItems
} from '../controllers/CartController.js';
import { verifyToken, isCustomer } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { addToCartSchema } from '../validations/cart.validation.js';

const router = express.Router();

router.use(verifyToken, isCustomer);

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addToCart);
router.put('/update/:cartItemId', updateCartItemQuantity);
router.delete('/remove/:cartItemId', removeFromCart);
router.post('/checkout', checkoutSelectedCartItems);

export default router;
