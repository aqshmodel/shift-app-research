import { env } from 'cloudflare:workers';
import { createResearchRepository, type Database } from './repository';
export { compactAssessment } from './repository';
type Research = ReturnType<typeof createResearchRepository>;
// Only fulfilled immutable snapshot data is shared. D1 promises stay request-local.
const catalogCache = new Map();
export function getResearch(locals: object): Research {
  const request = locals as { research?: Research };
  return request.research ??= createResearchRepository((env as unknown as { DB: Database }).DB, {catalogCache,
    paused: (env as any).D1_ACCESS_MODE !== 'normal'});
}
