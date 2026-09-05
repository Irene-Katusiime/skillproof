import { Router, Request, Response } from 'express';

const router = Router();

export interface SaccoMember {
  id: string;
  saccoId: string;
  nationalId: string;
  fullName: string;
  phoneNumber: string;
  primaryTrade: string;
  verifiedJobsCount: number;
  creditScore: number;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

export interface SaccoClusterStats {
  saccoId: string;
  saccoName: string;
  totalMembers: number;
  activeWorkers: number;
  clusterTotalEarningsUGX: number;
  averageCreditScore: number;
  topTradeCategory: string;
}

// Mock database for SACCO members and clusters
const saccoMembersDb: SaccoMember[] = [
  {
    id: 'mem-101',
    saccoId: 'sacco-kampala-tailors',
    nationalId: 'CM98012345ABCD',
    fullName: 'Milly Nakato',
    phoneNumber: '+256770001122',
    primaryTrade: 'Tailoring & Garment Construction',
    verifiedJobsCount: 12,
    creditScore: 680,
    status: 'ACTIVE'
  },
  {
    id: 'mem-102',
    saccoId: 'sacco-kampala-tailors',
    nationalId: 'CM97098765EFGH',
    fullName: 'Grace Akello',
    phoneNumber: '+256780003344',
    primaryTrade: 'Embroidery & Stitching',
    verifiedJobsCount: 5,
    creditScore: 540,
    status: 'ACTIVE'
  }
];

const saccoClustersDb: Record<string, string> = {
  'sacco-kampala-tailors': 'Kampala Artisans & Tailors SACCO',
  'sacco-ntinda-cleaners': 'Ntinda Domestic & Commercial Workers Cooperative'
};

/**
 * @route POST /api/sacco/bulk-onboard
 * @desc Bulk onboarding endpoint for SACCO leaders uploading CSV data or batch USSD logs
 */
router.post('/bulk-onboard', (req: Request, res: Response): void => {
  try {
    const { saccoId, members } = req.body;

    if (!saccoId || !Array.isArray(members) || members.length === 0) {
      res.status(400).json({
        success: false,
        error: 'saccoId and a non-empty array of members are required.'
      });
      return;
    }

    const processedMembers: SaccoMember[] = [];
    const errors: string[] = [];

    members.forEach((memberData, index) => {
      const { nationalId, fullName, phoneNumber, primaryTrade } = memberData;

      if (!nationalId || !fullName || !phoneNumber) {
        errors.push(`Row ${index + 1}: Missing required fields (nationalId, fullName, or phoneNumber).`);
        return;
      }

      const newMember: SaccoMember = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        saccoId,
        nationalId: String(nationalId).toUpperCase().trim(),
        fullName: String(fullName).trim(),
        phoneNumber: String(phoneNumber).trim(),
        primaryTrade: primaryTrade ? String(primaryTrade).trim() : 'General Labor',
        verifiedJobsCount: 0,
        creditScore: 300, // Base credit score for newly onboarded members
        status: 'ACTIVE'
      };

      saccoMembersDb.push(newMember);
      processedMembers.push(newMember);
    });

    res.status(201).json({
      success: true,
      message: `Successfully onboarded ${processedMembers.length} member(s).`,
      count: processedMembers.length,
      errors: errors.length > 0 ? errors : undefined,
      onboardedMembers: processedMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred during bulk member onboarding.'
    });
  }
});

/**
 * @route GET /api/sacco/stats/:saccoId
 * @desc Fetch aggregate analytics and credit health metrics for a trade union/SACCO
 */
router.get('/stats/:saccoId', (req: Request, res: Response): void => {
  try {
    const { saccoId } = req.params;
    const saccoName = saccoClustersDb[saccoId] || 'Registered Trade Union Cluster';

    const members = saccoMembersDb.filter((m) => m.saccoId === saccoId);

    if (members.length === 0) {
      res.status(200).json({
        success: true,
        stats: {
          saccoId,
          saccoName,
          totalMembers: 0,
          activeWorkers: 0,
          clusterTotalEarningsUGX: 0,
          averageCreditScore: 300,
          topTradeCategory: 'N/A'
        },
        members: []
      });
      return;
    }

    const totalMembers = members.length;
    const activeWorkers = members.filter((m) => m.status === 'ACTIVE').length;
    const totalScore = members.reduce((sum, m) => sum + m.creditScore, 0);
    const averageCreditScore = Math.round(totalScore / totalMembers);

    // Calculate cluster total estimated earnings (Mock: average UGX 150,000 per verified job)
    const totalVerifiedJobs = members.reduce((sum, m) => sum + m.verifiedJobsCount, 0);
    const clusterTotalEarningsUGX = totalVerifiedJobs * 150000;

    // Determine top trade category
    const tradeCounts: Record<string, number> = {};
    members.forEach((m) => {
      tradeCounts[m.primaryTrade] = (tradeCounts[m.primaryTrade] || 0) + 1;
    });

    let topTradeCategory = 'General Labor';
    let maxCount = 0;
    Object.entries(tradeCounts).forEach(([trade, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topTradeCategory = trade;
      }
    });

    const stats: SaccoClusterStats = {
      saccoId,
      saccoName,
      totalMembers,
      activeWorkers,
      clusterTotalEarningsUGX,
      averageCreditScore,
      topTradeCategory
    };

    res.status(200).json({
      success: true,
      stats,
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve SACCO statistics.'
    });
  }
});

export default router;