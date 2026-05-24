export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed'
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed'
export type TaskOwner = 'operator' | 'lana' | 'shared'
export type AutonomyMode = 'contained' | 'supervised' | 'semi_autonomous' | 'open'
export type OpportunityStatus = 'watching' | 'ready' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type OpportunityType = 'ugc' | 'brand_deal' | 'affiliate' | 'partnership' | 'other'
export type MemoryType = 'durable' | 'reflection' | 'research' | 'synthesis'
export type HeartbeatType = 'reflection' | 'research' | 'opportunity' | 'synthesis'
export type ImportanceLevel = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  owner: TaskOwner
  notes?: string
}

export interface ProjectPhase {
  id: string
  name: string
  status: PhaseStatus
  progress: number
  summary: string
  tasks: Task[]
  blockers: string[]
  notes: string[]
}

export interface Dossier {
  name: string
  subtitle: string
  version: string
  identitySummary: string
  goals: string[]
  traits: string[]
  boundaries: string[]
  publicPersona: string
  currentMode: string
  operatorNotes: string[]
}

export interface MemoryEntry {
  id: string
  type: MemoryType
  title: string
  summary: string
  tags: string[]
  createdAt: string
}

export interface HeartbeatEntry {
  id: string
  runType: HeartbeatType
  createdAt: string
  summary: string
  changes: string[]
  followUps: string[]
  importance: ImportanceLevel
}

export interface Opportunity {
  id: string
  name: string
  type: OpportunityType
  status: OpportunityStatus
  fitScore: number
  estimatedValue?: string
  nextAction: string
  notes: string
}

export interface OperatorPolicy {
  autonomyMode: AutonomyMode
  allowedActions: string[]
  approvalRequired: string[]
  interventionNotes: string[]
}
