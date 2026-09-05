import { Router, Request, Response } from 'express';
import { creditEngineService, CreditDataInput } from '../services/creditEngine';

const router = Router();

/**
 * @route POST /api/credit/assess
 * @desc Evaluate credit risk score and limit eligibility
 */
router.post('/assess', (req: Request, res: Response): void => {
  try {
    const {
      annualIncome,
      totalDebt,
      paymentHistoryScore,
      creditHistoryMonths,
      activeAccounts,
      recentInquiries,
      requestedAmount
    } = req.body;

    // Basic Input Validation
    if (
      annualIncome === undefined ||
      totalDebt === undefined ||
      paymentHistoryScore === undefined ||
      creditHistoryMonths === undefined
    ) {
      res.status(400).json({
        success: false,
        error: 'Missing required financial metrics in request body.'
      });
      return;
    }

    const inputData: CreditDataInput = {
      annualIncome: Number(annualIncome),
      totalDebt: Number(totalDebt),
      paymentHistoryScore: Number(paymentHistoryScore),
      creditHistoryMonths: Number(creditHistoryMonths),
      activeAccounts: Number(activeAccounts || 0),
      recentInquiries: Number(recentInquiries || 0),
      requestedAmount: Number(requestedAmount || 0)
    };

    const assessment = creditEngineService.evaluateCreditRisk(inputData);

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred while executing credit risk assessment.'
    });
  }
});

export default router;