// All service pages gained their complete, server-rendered research history on
// this date. Change this only for a substantial change to their shared content.
export const DETAIL_CONTENT_UPDATED = '2026-10-14';

export function detailModifiedDate(researchDate) {
  return typeof researchDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(researchDate)
    && researchDate > DETAIL_CONTENT_UPDATED ? researchDate : DETAIL_CONTENT_UPDATED;
}
