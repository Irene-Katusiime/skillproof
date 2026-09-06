import { Router, Request, Response } from 'express'
import {
  createConfirmation,
  getConfirmation,
  respondToConfirmation,
  getWorkerConfirmations,
} from '../services/projectConfirmation.service'

const router = Router()

/**
 * Worker creates a shareable confirmation link.
 */
router.post(
  '/projects/:projectId/confirmation-link',
  (req: Request, res: Response): void => {
    const { projectId } = req.params
    const { workerId } = req.body

    if (!projectId || !workerId) {
      res.status(400).json({
        success: false,
        error: 'workerId and projectId are required.',
      })
      return
    }

    const confirmation = createConfirmation(workerId, projectId)

    res.status(201).json({
      success: true,
      token: confirmation.token,
      confirmation,
    })
  }
)

/**
 * Public endpoint.
 * Former clients do NOT need an account.
 */
router.get(
  '/project-confirmation/:token',
  (req: Request, res: Response): void => {
    const confirmation = getConfirmation(req.params.token)

    if (!confirmation) {
      res.status(404).json({
        success: false,
        error: 'Confirmation link is invalid or expired.',
      })
      return
    }

    res.status(200).json({
      success: true,
      confirmation: {
        token: confirmation.token,
        workerId: confirmation.workerId,
        projectId: confirmation.projectId,
        status: confirmation.status,
        createdAt: confirmation.createdAt,
        respondedAt: confirmation.respondedAt,
      },
    })
  }
)

/**
 * Former client responds YES or NO.
 */
router.post(
  '/project-confirmation/:token/respond',
  (req: Request, res: Response): void => {
    const { response } = req.body

    if (response !== 'yes' && response !== 'no') {
      res.status(400).json({
        success: false,
        error: 'Response must be yes or no.',
      })
      return
    }

    const confirmation = respondToConfirmation(
      req.params.token,
      response
    )

    if (!confirmation) {
      res.status(404).json({
        success: false,
        error: 'Confirmation link is invalid or expired.',
      })
      return
    }

    res.status(200).json({
      success: true,
      confirmation,
    })
  }
)

/**
 * Used by the worker dashboard to synchronize
 * confirmations made by former clients.
 */
router.get(
  '/project-confirmations/worker/:workerId',
  (req: Request, res: Response): void => {
    const confirmations = getWorkerConfirmations(
      req.params.workerId
    )

    res.status(200).json({
      success: true,
      confirmations,
    })
  }
)

export default router
