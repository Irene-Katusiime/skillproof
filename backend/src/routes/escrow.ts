import { Router, Request, Response } from 'express';
import { momoService } from '../services/momoService';

const router = Router();

/**
 * @route POST /api/escrow/deposit
 * @desc Client triggers deposit into IMANI Escrow Vault
 */
router.post('/deposit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, employerPhone, workerPhone, amountUGX } = req.body;

    if (!jobId || !employerPhone || !workerPhone || !amountUGX) {
      res.status(400).json({ success: false, error: 'Missing parameters: jobId, employerPhone, workerPhone, amountUGX.' });
      return;
    }

    const response = await momoService.requestDepositPush(
      jobId,
      employerPhone,
      workerPhone,
      Number(amountUGX)
    );

    const escrowDetails = momoService.getEscrowDetails(jobId);

    res.status(200).json({
      success: true,
      message: response.message,
      depositRef: response.referenceId,
      escrow: escrowDetails
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to trigger deposit.' });
  }
});

/**
 * @route POST /api/escrow/release
 * @desc Client approves work via WhatsApp verification link -> Disburses MoMo payout to worker
 */
router.post('/release', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ success: false, error: 'jobId is required.' });
      return;
    }

    const { record, payoutRef } = await momoService.releaseDisbursal(jobId);

    res.status(200).json({
      success: true,
      message: `UGX ${record.netPayoutUGX.toLocaleString()} disbursed to worker wallet (${record.workerPhone}).`,
      payoutReference: payoutRef,
      escrow: record
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to release disbursal.' });
  }
});

/**
 * @route POST /api/escrow/dispute
 * @desc Freeze funds in escrow vault for mediation
 */
router.post('/dispute', (req: Request, res: Response): void => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ success: false, error: 'jobId is required.' });
      return;
    }

    const record = momoService.flagDispute(jobId);

    res.status(200).json({
      success: true,
      message: 'Escrow funds frozen in DISPUTED state.',
      escrow: record
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/escrow/:jobId
 * @desc Query status of an active escrow vault
 */
router.get('/:jobId', (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const record = momoService.getEscrowDetails(jobId);

  if (!record) {
    res.status(404).json({ success: false, error: 'Escrow record not found.' });
    return;
  }

  res.status(200).json({ success: true, escrow: record });
});

export default router;