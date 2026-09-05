import { Router, Request, Response } from 'express';
import { matchingEngineService, WorkerProfile, JobRequest } from '../services/matchingEngine';

const router = Router();

// Mock database for hackathon demo
const mockWorkers: WorkerProfile[] = [
  {
    id: 'w-101',
    name: 'Amina Cleaners',
    skills: ['Deep Cleaning', 'Home Cleaning', 'Sofa Shampooing'],
    latitude: 0.3476, // Ntinda, Kampala
    longitude: 32.5825,
    creditScore: 680,
    trustTier: 'LEVEL_2',
    isAvailable: true
  },
  {
    id: 'w-102',
    name: 'Kato Plumbing Services',
    skills: ['Plumbing', 'Pipe Threading', 'Drainage Repair'],
    latitude: 0.3136, // Nakasero, Kampala
    longitude: 32.5811,
    creditScore: 720,
    trustTier: 'LEVEL_3',
    isAvailable: true
  },
  {
    id: 'w-103',
    name: 'Irene Tailoring',
    skills: ['Garment Construction', 'Dressmaking', 'Alterations'],
    latitude: 0.3500, // Kisasi, Kampala
    longitude: 32.6000,
    creditScore: 540,
    trustTier: 'LEVEL_1',
    isAvailable: true
  }
];

const mockJobsDb: Record<string, any> = {};

/**
 * @route POST /api/jobs
 * @desc Employer posts a job request
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const { title, requiredSkill, latitude, longitude, maxRadiusKm, budgetUGX, employerName } = req.body;

    if (!title || !requiredSkill || !latitude || !longitude) {
      res.status(400).json({ success: false, error: 'Missing required job parameters.' });
      return;
    }

    const jobId = `JOB-${Date.now().toString().slice(-4)}`;
    const newJob: JobRequest & { budgetUGX: number; employerName: string; status: string } = {
      id: jobId,
      title,
      requiredSkill,
      latitude: Number(latitude),
      longitude: Number(longitude),
      maxRadiusKm: Number(maxRadiusKm || 15), // Default 15km geofence
      budgetUGX: Number(budgetUGX || 0),
      employerName: employerName || 'Anonymous Client',
      status: 'OPEN'
    };

    mockJobsDb[jobId] = newJob;

    // Run geofenced matching algorithm immediately
    const matchedWorkers = matchingEngineService.matchWorkers(newJob, mockWorkers);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully.',
      job: newJob,
      matchedCount: matchedWorkers.length,
      matches: matchedWorkers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process job posting.' });
  }
});

/**
 * @route GET /api/jobs/match
 * @desc Search matches for a location and skill on the fly
 */
router.get('/match', (req: Request, res: Response): void => {
  try {
    const { skill, lat, lng, radius } = req.query;

    if (!skill || !lat || !lng) {
      res.status(400).json({ success: false, error: 'Parameters skill, lat, and lng are required.' });
      return;
    }

    const tempJob: JobRequest = {
      id: 'TEMP-QUERY',
      title: 'Query Match',
      requiredSkill: String(skill),
      latitude: Number(lat),
      longitude: Number(lng),
      maxRadiusKm: Number(radius || 10)
    };

    const matches = matchingEngineService.matchWorkers(tempJob, mockWorkers);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to query matches.' });
  }
});

export default router;