import crypto from 'crypto'

export type ConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export interface ProjectConfirmation {
  token: string
  workerId: string
  projectId: string
  status: ConfirmationStatus
  createdAt: string
  respondedAt?: string
}

const confirmations = new Map<string, ProjectConfirmation>()

export function createConfirmation(
  workerId: string,
  projectId: string
): ProjectConfirmation {
  const token = crypto.randomBytes(32).toString('hex')

  const confirmation: ProjectConfirmation = {
    token,
    workerId,
    projectId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }

  confirmations.set(token, confirmation)

  return confirmation
}

export function getConfirmation(
  token: string
): ProjectConfirmation | undefined {
  return confirmations.get(token)
}

export function respondToConfirmation(
  token: string,
  response: 'yes' | 'no'
): ProjectConfirmation | undefined {
  const confirmation = confirmations.get(token)

  if (!confirmation) {
    return undefined
  }

  if (confirmation.status !== 'PENDING') {
    return confirmation
  }

  confirmation.status = response === 'yes'
    ? 'CONFIRMED'
    : 'REJECTED'

  confirmation.respondedAt = new Date().toISOString()

  confirmations.set(token, confirmation)

  return confirmation
}

export function getWorkerConfirmations(
  workerId: string
): ProjectConfirmation[] {
  return Array.from(confirmations.values()).filter(
    confirmation => confirmation.workerId === workerId
  )
}
