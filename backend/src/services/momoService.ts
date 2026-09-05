export type EscrowStatus = 'PENDING_DEPOSIT' | 'LOCKED' | 'VERIFIED' | 'DISBURSED' | 'DISPUTED';

export interface EscrowRecord {
  jobId: string;
  employerPhone: string;
  workerPhone: string;
  amountUGX: number;
  platformFeeUGX: number; // 1.5% tech fee
  netPayoutUGX: number;
  status: EscrowStatus;
  depositRefId?: string;
  payoutRefId?: string;
  updatedAt: string;
}

export interface MomoPushResponse {
  success: boolean;
  referenceId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message: string;
}

export class MomoService {
  private escrowStore: Map<string, EscrowRecord> = new Map();
  private readonly FEE_PERCENTAGE = 0.015; // 1.5% IMANI Platform Fee

  /**
   * Calculates platform fee and net worker payout.
   */
  private calculateBreakdown(grossAmount: number) {
    const platformFeeUGX = Math.round(grossAmount * this.FEE_PERCENTAGE);
    const netPayoutUGX = grossAmount - platformFeeUGX;
    return { platformFeeUGX, netPayoutUGX };
  }

  /**
   * Simulates triggering an MTN MoMo / Airtel Money Payment Prompt (Collection Push API).
   */
  public async requestDepositPush(
    jobId: string,
    employerPhone: string,
    workerPhone: string,
    amountUGX: number
  ): Promise<MomoPushResponse> {
    const referenceId = `MTN-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const { platformFeeUGX, netPayoutUGX } = this.calculateBreakdown(amountUGX);

    // Create Escrow Record in PENDING_DEPOSIT state
    const record: EscrowRecord = {
      jobId,
      employerPhone,
      workerPhone,
      amountUGX,
      platformFeeUGX,
      netPayoutUGX,
      status: 'PENDING_DEPOSIT',
      depositRefId: referenceId,
      updatedAt: new Date().toISOString()
    };

    this.escrowStore.set(jobId, record);

    // Simulate instant USSD PIN confirmation for hackathon demo
    record.status = 'LOCKED';
    record.updatedAt = new Date().toISOString();
    this.escrowStore.set(jobId, record);

    return {
      success: true,
      referenceId,
      status: 'SUCCESS',
      message: `Prompt sent to ${employerPhone}. UGX ${amountUGX.toLocaleString()} locked in IMANI Escrow Vault.`
    };
  }

  /**
   * Verifies work completion via transaction reference check & updates state to VERIFIED.
   */
  public markJobVerified(jobId: string, momoReferenceInput: string): EscrowRecord {
    const record = this.escrowStore.get(jobId);
    if (!record) throw new Error(`Escrow record for Job ID ${jobId} not found.`);

    if (record.status !== 'LOCKED') {
      throw new Error(`Cannot verify job in current state: ${record.status}`);
    }

    record.status = 'VERIFIED';
    record.updatedAt = new Date().toISOString();
    this.escrowStore.set(jobId, record);

    return record;
  }

  /**
   * Releases locked funds to worker's Mobile Money wallet via Disbursement API.
   */
  public async releaseDisbursal(jobId: string): Promise<{ record: EscrowRecord; payoutRef: string }> {
    const record = this.escrowStore.get(jobId);
    if (!record) throw new Error(`Escrow record for Job ID ${jobId} not found.`);

    if (record.status !== 'VERIFIED' && record.status !== 'LOCKED') {
      throw new Error(`Cannot disburse funds in status: ${record.status}`);
    }

    const payoutRef = `PAYOUT-UGX-${Math.floor(100000 + Math.random() * 900000)}`;
    
    record.status = 'DISBURSED';
    record.payoutRefId = payoutRef;
    record.updatedAt = new Date().toISOString();
    this.escrowStore.set(jobId, record);

    return { record, payoutRef };
  }

  /**
   * Places escrow funds into dispute state.
   */
  public flagDispute(jobId: string): EscrowRecord {
    const record = this.escrowStore.get(jobId);
    if (!record) throw new Error(`Escrow record for Job ID ${jobId} not found.`);

    record.status = 'DISPUTED';
    record.updatedAt = new Date().toISOString();
    this.escrowStore.set(jobId, record);

    return record;
  }

  /**
   * Retrieves escrow status for a given job.
   */
  public getEscrowDetails(jobId: string): EscrowRecord | undefined {
    return this.escrowStore.get(jobId);
  }
}

export const momoService = new MomoService();