export interface WorkerProfile {
  id: string;
  name: string;
  skills: string[]; // Normalized trade skills e.g. ["Deep Cleaning", "Sofa Shampooing"]
  latitude: number;
  longitude: number;
  creditScore: number; // 0–800 index
  trustTier: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'; // L1: Self, L2: MoMo Verified, L3: Master Vouched
  isAvailable: boolean;
}

export interface JobRequest {
  id: string;
  title: string;
  requiredSkill: string;
  latitude: number;
  longitude: number;
  maxRadiusKm: number;
  minTrustTier?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
}

export interface MatchedWorker {
  worker: WorkerProfile;
  distanceKm: number;
  matchScore: number; // Composite rank score based on proximity + credit score
}

export class MatchingEngineService {
  /**
   * Calculates the geographic distance between two points using the Haversine formula (in km).
   */
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  /**
   * Filters and ranks workers based on skill, GPS proximity, trust tier, and credit score.
   */
  public matchWorkers(job: JobRequest, workers: WorkerProfile[]): MatchedWorker[] {
    const tierWeights: Record<string, number> = {
      LEVEL_1: 1,
      LEVEL_2: 2,
      LEVEL_3: 3
    };

    const minTierWeight = job.minTrustTier ? tierWeights[job.minTrustTier] : 1;

    return workers
      .filter((worker) => {
        // 1. Availability check
        if (!worker.isAvailable) return false;

        // 2. Trade Skill match (case-insensitive)
        const hasSkill = worker.skills.some(
          (skill) => skill.toLowerCase() === job.requiredSkill.toLowerCase()
        );
        if (!hasSkill) return false;

        // 3. Trust Tier requirement check
        if (tierWeights[worker.trustTier] < minTierWeight) return false;

        // 4. GPS Geofence check
        const distance = this.calculateHaversineDistance(
          job.latitude,
          job.longitude,
          worker.latitude,
          worker.longitude
        );

        return distance <= job.maxRadiusKm;
      })
      .map((worker) => {
        const distanceKm = this.calculateHaversineDistance(
          job.latitude,
          job.longitude,
          worker.latitude,
          worker.longitude
        );

        // Calculate a composite rank score (60% Credit Score + 40% Proximity)
        const normalizedCredit = worker.creditScore / 800; // 0 to 1
        const proximityFactor = Math.max(0, 1 - distanceKm / job.maxRadiusKm); // 1 = closest, 0 = at radius boundary
        const matchScore = Math.round((normalizedCredit * 0.6 + proximityFactor * 0.4) * 100);

        return {
          worker,
          distanceKm,
          matchScore
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore); // Rank highest score first
  }
}

export const matchingEngineService = new MatchingEngineService();