// Verification Routes
import { Router } from 'express';
import { verificationController } from '../controllers/verificationController';

const router = Router();

// Create new verification record
router.post('/create', verificationController.createVerification.bind(verificationController));

// Verify hash (QR code resolution)
router.get('/:hash', verificationController.verifyHash.bind(verificationController));

// Get verification by record ID
router.get('/record/:recordId', verificationController.getVerificationByRecordId.bind(verificationController));

export default router;
