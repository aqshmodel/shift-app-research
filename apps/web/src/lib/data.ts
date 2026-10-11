import { env } from 'cloudflare:workers';
import { createResearchRepository, type Database } from './repository';
export { compactAssessment } from './repository';
type Research = ReturnType<typeof createResearchRepository>;
export function getResearch(locals: object): Research {
  const request = locals as { research?: Research };
  return request.research ??= createResearchRepository((env as unknown as { DB: Database }).DB);
}
