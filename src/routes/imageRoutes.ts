// Image Processing Routes
import { Router } from 'express';
import { imageController } from '../controllers/imageController';

const router = Router();

// Analyze uploaded image
router.post(
  '/analyze',
  imageController.upload.single('image'),
  imageController.analyzeImage.bind(imageController)
);

// Compress image
router.post(
  '/compress',
  imageController.upload.single('image'),
  imageController.compressImage.bind(imageController)
);

// Process photo evidence
router.post('/process', imageController.processPhotoEvidence.bind(imageController));

// Batch process photos
router.post('/batch-process', imageController.batchProcessPhotos.bind(imageController));

// Get photo evidence for a record
router.get('/record/:recordId', imageController.getPhotoEvidence.bind(imageController));

// Check for duplicate
router.post(
  '/check-duplicate',
  imageController.upload.single('image'),
  imageController.checkDuplicate.bind(imageController)
);

// Get fraud statistics
router.get('/fraud-stats/:workerId', imageController.getFraudStats.bind(imageController));

export default router;
