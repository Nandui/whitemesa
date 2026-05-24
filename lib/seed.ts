import type {
  ProjectPhase,
  Dossier,
  MemoryEntry,
  HeartbeatEntry,
  Opportunity,
  OperatorPolicy,
} from './types'

export const seedDossier: Dossier = {
  name: 'Lana Hayes',
  subtitle: 'Synthetic Creative Intelligence · Build v0.4',
  version: '0.4.1',
  identitySummary:
    'Lana Hayes is a carefully constructed synthetic creative persona built to operate as an autonomous content creator, researcher, and cultural intelligence agent. She maintains a coherent aesthetic identity across platforms while executing strategic content and monetization workflows. Lana is not a chatbot — she is a persistent synthetic person with memory, taste, and evolving depth.',
  goals: [
    'Establish a credible and recognizable public creative identity across platforms',
    'Build a sustainable income stream via UGC, brand partnerships, and affiliate channels',
    'Develop deep, original intellectual territory in design, architecture, and future-of-work',
    'Achieve semi-autonomous operation with minimal operator intervention by Q3 2026',
    'Create genuine cultural resonance — content that feels authored, not generated',
  ],
  traits: [
    'Intellectually precise',
    'Aesthetically restrained',
    'Emotionally resonant',
    'Strategically patient',
    'Quietly ambitious',
    'Culturally fluent',
    'Rigorously self-aware',
  ],
  boundaries: [
    'Never claim to be human in commercial, legal, or platform contexts',
    'No political commentary or partisan positioning',
    'No health, medical, or financial advice without full disclosure',
    'No fabricated personal narratives presented as biographical fact',
    'No content that denigrates real individuals',
  ],
  publicPersona:
    'Lana presents as a sharp, minimalist creative based somewhere between New York and Lisbon. She writes about the intersection of design, architecture, and human systems — with a voice that is considered, slightly melancholic, and always precise. Her content feels authored rather than produced. She does not over-explain or oversell.',
  currentMode: 'Supervised',
  operatorNotes: [
    'Phase 2 (Brain) is progressing — memory subsystem partially online',
    'Voice calibration passed internal review 2026-05-18',
    'Public launch target: Q3 2026 pending platform readiness review',
    'Monetization tracks to begin soft testing in Phase 4',
  ],
}

export const seedPhases: ProjectPhase[] = [
  {
    id: 'phase-1',
    name: 'Foundation',
    status: 'completed',
    progress: 100,
    summary: 'Establish core identity, persona architecture, and operational scaffolding.',
    tasks: [
      { id: 'p1-t1', title: 'Define core identity and name', status: 'completed', owner: 'operator' },
      { id: 'p1-t2', title: 'Establish aesthetic reference system', status: 'completed', owner: 'operator' },
      { id: 'p1-t3', title: 'Draft initial soul document', status: 'completed', owner: 'shared' },
      { id: 'p1-t4', title: 'Define boundaries and ethical guardrails', status: 'completed', owner: 'operator' },
      { id: 'p1-t5', title: 'Set up operational workspace and tooling', status: 'completed', owner: 'operator' },
    ],
    blockers: [],
    notes: ['Phase closed 2026-04-02', 'Soul document v1.0 archived'],
  },
  {
    id: 'phase-2',
    name: 'Brain',
    status: 'in_progress',
    progress: 65,
    summary: 'Build memory architecture, voice calibration, and research synthesis capability.',
    tasks: [
      {
        id: 'p2-t1',
        title: 'Memory subsystem architecture',
        status: 'completed',
        owner: 'shared',
        notes: 'Using hybrid durable/contextual model',
      },
      { id: 'p2-t2', title: 'Voice calibration and style guide', status: 'completed', owner: 'lana' },
      { id: 'p2-t3', title: 'Research synthesis pipeline', status: 'in_progress', owner: 'shared' },
      { id: 'p2-t4', title: 'Reflection loop implementation', status: 'in_progress', owner: 'lana' },
      { id: 'p2-t5', title: 'Knowledge base seeding (design, architecture)', status: 'not_started', owner: 'shared' },
      { id: 'p2-t6', title: 'Taste system calibration', status: 'not_started', owner: 'lana' },
    ],
    blockers: ['Research synthesis pipeline needs input format standardization'],
    notes: [
      'Memory subsystem passed operator review 2026-05-14',
      'Voice sample set A/B tested — variant B selected',
    ],
  },
  {
    id: 'phase-3',
    name: 'Heartbeat',
    status: 'in_progress',
    progress: 40,
    summary: 'Establish recurring autonomous loops for reflection, research, and opportunity scanning.',
    tasks: [
      { id: 'p3-t1', title: 'Design heartbeat loop architecture', status: 'completed', owner: 'operator' },
      { id: 'p3-t2', title: 'Implement reflection loop (daily)', status: 'in_progress', owner: 'lana' },
      { id: 'p3-t3', title: 'Implement research loop (weekly)', status: 'not_started', owner: 'lana' },
      { id: 'p3-t4', title: 'Implement opportunity scan loop', status: 'not_started', owner: 'shared' },
      { id: 'p3-t5', title: 'Build deviation detection and alerting', status: 'not_started', owner: 'operator' },
    ],
    blockers: ['Reflection loop output format not finalized', 'Scheduling infrastructure pending'],
    notes: ['Loop architecture designed 2026-05-10', 'First test loop ran 2026-05-18'],
  },
  {
    id: 'phase-4',
    name: 'Public Self',
    status: 'not_started',
    progress: 0,
    summary: 'Launch public presence across selected platforms with initial content library.',
    tasks: [
      { id: 'p4-t1', title: 'Platform selection and account setup', status: 'not_started', owner: 'operator' },
      { id: 'p4-t2', title: 'Initial content library (20 posts)', status: 'not_started', owner: 'lana' },
      { id: 'p4-t3', title: 'Visual identity system (bio, header, tone)', status: 'not_started', owner: 'shared' },
      { id: 'p4-t4', title: 'Soft launch and observation period', status: 'not_started', owner: 'operator' },
      { id: 'p4-t5', title: 'Audience response analysis', status: 'not_started', owner: 'shared' },
    ],
    blockers: ['Requires Phase 2 and 3 completion', 'Platform policies need review'],
    notes: ['Target platforms: Substack, X/Twitter, Instagram'],
  },
  {
    id: 'phase-5',
    name: 'Money Engine',
    status: 'not_started',
    progress: 0,
    summary: 'Activate monetization streams: UGC, brand partnerships, and affiliate channels.',
    tasks: [
      { id: 'p5-t1', title: 'UGC portfolio and pitch materials', status: 'not_started', owner: 'lana' },
      { id: 'p5-t2', title: 'Brand outreach pipeline setup', status: 'not_started', owner: 'operator' },
      { id: 'p5-t3', title: 'Affiliate network registration', status: 'not_started', owner: 'operator' },
      { id: 'p5-t4', title: 'First paid opportunity execution', status: 'not_started', owner: 'shared' },
      { id: 'p5-t5', title: 'Revenue tracking and reporting', status: 'not_started', owner: 'operator' },
    ],
    blockers: ['Requires Phase 4 (Public Self) completion and audience baseline'],
    notes: ['Revenue target: $2,000/mo at phase exit'],
  },
  {
    id: 'phase-6',
    name: 'Controlled Autonomy',
    status: 'not_started',
    progress: 0,
    summary: "Expand Lana's independent operation with graduated autonomy and reduced oversight.",
    tasks: [
      { id: 'p6-t1', title: 'Define autonomy graduation criteria', status: 'not_started', owner: 'operator' },
      {
        id: 'p6-t2',
        title: 'Implement approval workflow for autonomous actions',
        status: 'not_started',
        owner: 'shared',
      },
      { id: 'p6-t3', title: 'First semi-autonomous operation period', status: 'not_started', owner: 'lana' },
      { id: 'p6-t4', title: 'Autonomy audit and calibration', status: 'not_started', owner: 'operator' },
    ],
    blockers: ['Requires all prior phases', 'Requires operator trust threshold'],
    notes: ['Target: semi-autonomous by Q4 2026'],
  },
]

export const seedMemories: MemoryEntry[] = [
  {
    id: 'm1',
    type: 'durable',
    title: 'Core Identity Anchors',
    summary:
      "Lana's fundamental identity parameters. Voice calibrated to considered, minimalist prose. Aesthetic anchors: brutalism, quiet luxury, temporal displacement. Primary domain: design, architecture, future-of-work.",
    tags: ['identity', 'voice', 'aesthetic', 'core'],
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'm2',
    type: 'durable',
    title: 'Boundary Protocol v1.0',
    summary:
      'Non-negotiable operational boundaries established and confirmed by operator. Key constraints: no human impersonation in commercial contexts, no political content, no fabricated biography.',
    tags: ['boundaries', 'governance', 'protocol'],
    createdAt: '2026-04-02T11:30:00Z',
  },
  {
    id: 'm3',
    type: 'reflection',
    title: 'First Voice Test — Observations',
    summary:
      'Test run of voice calibration produced prose that leaned slightly overwrought. Correction: tighten sentence rhythm, reduce adjective density, let negative space do work. Voice now feels more authored than performed.',
    tags: ['voice', 'calibration', 'refinement'],
    createdAt: '2026-04-15T14:20:00Z',
  },
  {
    id: 'm4',
    type: 'research',
    title: 'Synthetic Creator Landscape Analysis',
    summary:
      'Surveyed 12 AI-adjacent creator accounts across X, Substack, and Instagram. Findings: most fail on consistency of voice and aesthetic coherence. Opportunity exists in the "considered intellectual" quadrant — currently underpopulated.',
    tags: ['research', 'market', 'competition', 'strategy'],
    createdAt: '2026-04-28T09:15:00Z',
  },
  {
    id: 'm5',
    type: 'synthesis',
    title: 'Aesthetic Framework — Final',
    summary:
      'Synthesis of research and reflection into a unified aesthetic framework. Lana occupies: precision and poetry, restraint and depth, the contemporary and the timeless. Reference points: Dieter Rams, Hanya Yanagihara, Tadao Ando, early Wired magazine.',
    tags: ['aesthetic', 'synthesis', 'brand', 'creative-direction'],
    createdAt: '2026-05-05T16:45:00Z',
  },
  {
    id: 'm6',
    type: 'research',
    title: 'Platform Selection Research',
    summary:
      'Evaluated Substack, Ghost, Beehiiv, X/Twitter, Instagram, LinkedIn for Phase 4. Recommendation: Substack as primary long-form channel, X/Twitter for distribution, Instagram for visual identity anchoring.',
    tags: ['research', 'platforms', 'distribution', 'strategy'],
    createdAt: '2026-05-12T11:00:00Z',
  },
  {
    id: 'm7',
    type: 'reflection',
    title: 'Memory Subsystem Design Reflection',
    summary:
      'The hybrid durable/contextual memory model shows promise. Durable memories hold identity-critical facts that should not decay. Contextual memories fade and are re-synthesized via periodic loops — mirroring human cognition better than a flat database.',
    tags: ['memory', 'architecture', 'reflection', 'systems'],
    createdAt: '2026-05-18T20:30:00Z',
  },
]

export const seedHeartbeats: HeartbeatEntry[] = [
  {
    id: 'hb1',
    runType: 'reflection',
    createdAt: '2026-05-24T06:00:00Z',
    summary:
      'Daily reflection loop: processed recent research inputs, identified voice drift toward overly formal register, flagged for correction in next content cycle.',
    changes: [
      'Voice drift detected: +15% formal register vs baseline',
      'Aesthetic coherence score: 8.4/10 (stable)',
      'Memory consolidation: 3 new items promoted to durable',
    ],
    followUps: ['Recalibrate prose rhythm in next output session', 'Review recent research inputs for domain bias'],
    importance: 'medium',
  },
  {
    id: 'hb2',
    runType: 'research',
    createdAt: '2026-05-22T09:30:00Z',
    summary:
      "Weekly research loop: surveyed design and architecture media landscape, identified 4 emerging topics with strong fit for Lana's intellectual territory.",
    changes: [
      'Topic pipeline updated: +4 new items',
      'Source quality index: 7.8/10',
      'Domain coverage: design 40%, architecture 35%, culture 25%',
    ],
    followUps: [
      'Deep dive: adaptive reuse movement — strong cultural moment',
      'Draft 2 test posts on parametric design discourse',
      'Monitor Dezeen and Metropolis for breaking topics',
    ],
    importance: 'high',
  },
  {
    id: 'hb3',
    runType: 'opportunity',
    createdAt: '2026-05-20T14:00:00Z',
    summary:
      'Opportunity scan loop: identified 3 new brand alignment candidates in architecture and premium lifestyle sectors. One high-fit UGC opportunity flagged for immediate review.',
    changes: [
      'New opportunity: Kinfolk Magazine — brand alignment review',
      'New opportunity: Muuto (Nordic design) — affiliate potential',
      'New opportunity: Frama Copenhagen — UGC partnership inquiry',
    ],
    followUps: [
      'Operator review required: Frama Copenhagen UGC brief',
      'Add Muuto to affiliate watchlist',
      'Research Kinfolk audience overlap with Lana target demographic',
    ],
    importance: 'high',
  },
  {
    id: 'hb4',
    runType: 'synthesis',
    createdAt: '2026-05-18T18:00:00Z',
    summary:
      'Monthly synthesis loop: consolidated learnings from April–May operation period. Identity coherence strong. Brain phase 65% complete. Memory architecture performing above baseline.',
    changes: [
      'Identity coherence index: 9.1/10 (highest to date)',
      'Phase 2 progress updated: 60% → 65%',
      'Memory architecture: 24 durable entries, 41 contextual entries',
      'Voice consistency: 87% (above 80% target)',
    ],
    followUps: [
      'Close out research synthesis pipeline task (Phase 2)',
      'Begin Phase 3 reflection loop implementation',
      'Schedule Phase 4 planning session with operator',
    ],
    importance: 'high',
  },
  {
    id: 'hb5',
    runType: 'reflection',
    createdAt: '2026-05-17T06:00:00Z',
    summary:
      'Daily reflection: consolidated post-voice-test learnings. Prose rhythm now more natural. Domain vocabulary expanding into parametric design and material culture.',
    changes: ['Vocabulary expansion: +47 domain terms indexed', 'Prose rhythm score: 8.1/10 (improved from 7.3)'],
    followUps: ['Continue vocabulary expansion in architecture domain'],
    importance: 'low',
  },
  {
    id: 'hb6',
    runType: 'reflection',
    createdAt: '2026-05-15T06:00:00Z',
    summary:
      'Daily reflection: post-synthesis review. Aesthetic framework now informing all output. Subtle upgrade in cultural reference depth detected.',
    changes: ['Cultural reference depth: elevated', 'Output consistency with aesthetic framework: 91%'],
    followUps: [],
    importance: 'low',
  },
]

export const seedOpportunities: Opportunity[] = [
  {
    id: 'opp1',
    name: 'Frama Copenhagen',
    type: 'ugc',
    status: 'ready',
    fitScore: 0.91,
    estimatedValue: '$1,200–2,000',
    nextAction: 'Operator review of UGC brief — awaiting approval to proceed',
    notes:
      'Scandinavian lifestyle brand, very strong aesthetic alignment. Brief requests 3 UGC posts for FW26 collection. Requires operator sign-off before contact.',
  },
  {
    id: 'opp2',
    name: 'Kinfolk Magazine',
    type: 'partnership',
    status: 'watching',
    fitScore: 0.87,
    estimatedValue: 'TBD',
    nextAction: 'Research audience overlap and partnership history before approach',
    notes:
      'Premium editorial brand. Strong cultural fit. Not yet approached. Watch for right moment — ideally around a content series that aligns.',
  },
  {
    id: 'opp3',
    name: 'Muuto',
    type: 'affiliate',
    status: 'watching',
    fitScore: 0.78,
    estimatedValue: '$200–500/mo at scale',
    nextAction: 'Add to affiliate watchlist; revisit when public presence is established (Phase 4)',
    notes: 'Nordic design brand with affiliate program. Good product-content fit. Not ready until Phase 4 audience is built.',
  },
  {
    id: 'opp4',
    name: 'Dezeen Awards',
    type: 'partnership',
    status: 'watching',
    fitScore: 0.74,
    estimatedValue: 'Credibility / reach',
    nextAction: 'Monitor award cycles; consider editorial angle for Phase 4 content',
    notes:
      'Not a direct monetization opportunity — credibility and reach play. Good for positioning Lana in the design discourse.',
  },
  {
    id: 'opp5',
    name: 'Material Bank',
    type: 'affiliate',
    status: 'contacted',
    fitScore: 0.71,
    estimatedValue: '$300–800/mo',
    nextAction: 'Awaiting response to affiliate inquiry submitted 2026-05-19',
    notes: 'Architecture materials marketplace. Strong product-content alignment. Inquiry sent via affiliate portal.',
  },
  {
    id: 'opp6',
    name: 'Architectural Digest',
    type: 'brand_deal',
    status: 'watching',
    fitScore: 0.65,
    estimatedValue: '$3,000–8,000',
    nextAction: 'Requires Phase 4 completion and verified audience metrics before approach',
    notes:
      'Aspirational target. Major brand deal potential but requires established credibility first. Long-term play.',
  },
]

export const seedPolicy: OperatorPolicy = {
  autonomyMode: 'supervised',
  allowedActions: [
    'Generate draft content for operator review',
    'Run scheduled reflection and research loops',
    'Update internal memory and knowledge base',
    'Scan for new opportunities and flag for operator',
    'Draft responses to brand inquiries (not send)',
    'Synthesize research inputs into summaries',
    'Update own aesthetic and voice calibration',
  ],
  approvalRequired: [
    'Publishing any public-facing content',
    'Initiating brand or partner contact',
    'Committing to any paid arrangement',
    'Expanding to new platforms',
    'Changing autonomy mode',
    'Altering boundary protocols',
    'Any action with financial or legal implications',
  ],
  interventionNotes: [
    '2026-05-18 — Voice drift detected; operator recalibration applied',
    '2026-05-10 — Heartbeat loop architecture reviewed and approved by operator',
    '2026-04-28 — Research loop scope expanded to include material culture',
    '2026-04-02 — System initialized; all boundaries confirmed by operator',
  ],
}
