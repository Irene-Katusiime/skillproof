export interface CreditDataInput {
  annualIncome: number;
  totalDebt: number;
  paymentHistoryScore: number; // Scale 0 - 100 (percentage of on-time payments)
  creditHistoryMonths: number;
  activeAccounts: number;
  recentInquiries: number;
  requestedAmount: number;
}

export interface AssessmentResult {
  creditScore: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  debtToIncomeRatio: number;
  maxApprovedLimit: number;
  decision: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
  breakdown: {
    paymentHistoryPoints: number;
    debtRatioPoints: number;
    creditAgePoints: number;
    inquiriesPenalty: number;
  };
  reasons: string[];
}

export class CreditEngineService {
  /**
   * Calculates a standard credit score (Range: 300 - 850) and risk profile.
   */
  public evaluateCreditRisk(data: CreditDataInput): AssessmentResult {
    const reasons: string[] = [];

    // 1. Debt-to-Income Ratio (DTI) Calculation
    const monthlyIncome = data.annualIncome / 12;
    const debtToIncomeRatio = monthlyIncome > 0 
      ? Number(((data.totalDebt / data.annualIncome) * 100).toFixed(2)) 
      : 100;

    // 2. Score Components (Weight Breakdown)
    // A. Payment History (35% weight -> Max 192.5 pts)
    const paymentHistoryPoints = Math.min(192.5, (data.paymentHistoryScore / 100) * 192.5);

    // B. Debt-to-Income / Credit Utilization (30% weight -> Max 165 pts)
    let debtRatioPoints = 0;
    if (debtToIncomeRatio <= 20) debtRatioPoints = 165;
    else if (debtToIncomeRatio <= 35) debtRatioPoints = 130;
    else if (debtToIncomeRatio <= 50) debtRatioPoints = 80;
    else debtRatioPoints = 20;

    // C. Length of Credit History (15% weight -> Max 82.5 pts)
    let creditAgePoints = 0;
    if (data.creditHistoryMonths >= 72) creditAgePoints = 82.5;
    else if (data.creditHistoryMonths >= 36) creditAgePoints = 60;
    else if (data.creditHistoryMonths >= 12) creditAgePoints = 35;
    else creditAgePoints = 15;

    // D. Credit Inquiries Penalty (10% weight -> Max 55 pts base minus penalties)
    const inquiriesPenalty = Math.min(55, data.recentInquiries * 12);
    const inquiryPoints = Math.max(0, 55 - inquiriesPenalty);

    // Base minimum credit score is 300
    const rawScore = 300 + paymentHistoryPoints + debtRatioPoints + creditAgePoints + inquiryPoints;
    const creditScore = Math.min(850, Math.round(rawScore));

    // 3. Determine Risk Tier & Maximum Credit Line
    let riskTier: AssessmentResult['riskTier'];
    let maxApprovedLimit = 0;

    if (creditScore >= 740) {
      riskTier = 'LOW';
      maxApprovedLimit = monthlyIncome * 5;
    } else if (creditScore >= 670) {
      riskTier = 'MEDIUM';
      maxApprovedLimit = monthlyIncome * 3;
    } else if (creditScore >= 580) {
      riskTier = 'HIGH';
      maxApprovedLimit = monthlyIncome * 1.5;
    } else {
      riskTier = 'CRITICAL';
      maxApprovedLimit = 0;
    }

    // 4. Decision Logic & Reason Flags
    if (debtToIncomeRatio > 50) {
      reasons.push('High Debt-to-Income ratio exceeds acceptable limits.');
    }
    if (data.paymentHistoryScore < 70) {
      reasons.push('Substantial history of missed or late payments.');
    }
    if (data.recentInquiries > 4) {
      reasons.push('High number of recent credit inquiries detected.');
    }

    let decision: AssessmentResult['decision'];
    if (riskTier === 'CRITICAL' || debtToIncomeRatio > 60) {
      decision = 'REJECTED';
    } else if (riskTier === 'HIGH' || data.requestedAmount > maxApprovedLimit) {
      decision = 'MANUAL_REVIEW';
    } else {
      decision = 'APPROVED';
    }

    return {
      creditScore,
      riskTier,
      debtToIncomeRatio,
      maxApprovedLimit: Math.round(maxApprovedLimit),
      decision,
      breakdown: {
        paymentHistoryPoints: Math.round(paymentHistoryPoints),
        debtRatioPoints: Math.round(debtRatioPoints),
        creditAgePoints: Math.round(creditAgePoints),
        inquiriesPenalty: Math.round(inquiriesPenalty)
      },
      reasons
    };
  }
}

export const creditEngineService = new CreditEngineService();