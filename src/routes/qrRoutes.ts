// QR Code Routes
import { Router } from 'express';
import { verificationController } from '../controllers/verificationController';

const router = Router();

// Get QR code image
router.get('/:hash', verificationController.getQRCode.bind(verificationController));

export default router;
