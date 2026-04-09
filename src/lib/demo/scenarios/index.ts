import type { DemoScenario, ScenarioId } from '@/lib/types'
import { juniorFrontendScenario } from './junior-frontend'
import { productAnalystScenario } from './product-analyst'
import { marketingManagerScenario } from './marketing-manager'

export const SCENARIOS: Record<ScenarioId, DemoScenario> = {
  'junior-frontend': juniorFrontendScenario,
  'product-analyst': productAnalystScenario,
  'marketing-manager': marketingManagerScenario,
}

export const DEFAULT_SCENARIO_ID: ScenarioId = 'junior-frontend'

export function getScenario(id: ScenarioId): DemoScenario {
  return SCENARIOS[id] ?? SCENARIOS[DEFAULT_SCENARIO_ID]
}

export { juniorFrontendScenario, productAnalystScenario, marketingManagerScenario }
