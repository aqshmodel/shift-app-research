// Native GET links remain usable without JavaScript. Only the results are replaced on enhancement.
export function initializeHomeDirectory() {
  const root = document.querySelector('[data-home-directory]');
  if (!root) return;
  const form = root.querySelector('[data-home-search]');
  const results = root.querySelector('#home-results');
  const status = root.querySelector('#directory-status');
  const error = root.querySelector('#directory-error');
  const toggle = root.querySelector('#mobile-filters-toggle');
  root.dataset.enhanced = 'true';
  toggle.hidden = false;
  let pending;
  let appliedUrl = new URL(location.href);

  function setControls(params) {
    form.elements.q.value = params.get('q') || '';
    form.elements.sort.value = params.get('sort') || 'domestic';
    for (const input of form.querySelectorAll('input[type="radio"]')) input.checked = input.value === (params.get(input.name) || '');
    for (const input of form.querySelectorAll('input[type="checkbox"]')) input.checked = params.getAll(input.name).includes(input.value);
    const selected = params.getAll('feature').length + (params.get('region') ? 1 : 0) + (params.get('price') ? 1 : 0);
    root.querySelector('#mobile-filter-count').textContent = selected ? `（${selected}条件）` : '';
  }
  setControls(new URL(location.href).searchParams);
  function formUrl() {
    const url = new URL('/', location.origin);
    for (const [key, value] of new FormData(form)) if (value && !(key === 'sort' && value === 'domestic')) url.searchParams.append(key, value);
    url.hash = 'services';
    return url;
  }
  async function navigate(url, {push = true, focusResults = false, signal} = {}) {
    if (url.origin !== location.origin || url.pathname !== '/') return;
    pending?.abort();
    const controller = new AbortController();
    const requestSignal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000), ...(signal ? [signal] : [])]);
    pending = controller;
    root.setAttribute('aria-busy', 'true');
    status.textContent = '条件に合うサービスを読み込んでいます…';
    error.hidden = true;
    try {
      const response = await fetch(url, {signal: requestSignal, headers: {Accept: 'text/html'}});
      if (!response.ok) throw new Error('一覧を更新できませんでした。通信状況を確認して、もう一度お試しください。');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      requestSignal.throwIfAborted();
      const next = doc.querySelector('#home-results');
      if (!next) throw new Error('一覧を取得できませんでした。ページを再読み込みしてください。');
      results.replaceChildren(...next.childNodes);
      results.dataset.total = next.dataset.total;
      results.dataset.page = next.dataset.page;
      for (const count of root.querySelectorAll('[data-facet]')) count.textContent = doc.querySelector(`[data-facet="${count.dataset.facet}"]`).textContent;
      appliedUrl = new URL(url);
      setControls(appliedUrl.searchParams);
      status.textContent = `${next.dataset.total}件のサービス`;
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) robots.content = doc.querySelector('meta[name="robots"]').content;
      const schema = document.querySelector('script[type="application/ld+json"]');
      if (schema) schema.textContent = doc.querySelector('script[type="application/ld+json"]').textContent;
      if (push && url.href !== location.href) history.pushState(null, '', url);
      document.dispatchEvent(new Event('directory:updated'));
      if (focusResults) {
        root.querySelector('#home-results-title').focus({preventScroll: true});
        results.scrollIntoView({block: 'start', behavior: 'instant'});
      }
      return true;
    } catch (cause) {
      if (controller.signal.aborted) return false;
      if (signal?.aborted) {
        setControls(appliedUrl.searchParams);
        status.textContent = `${results.dataset.total}件のサービス`;
        return false;
      }
      // Keep the current results labelled with the conditions that actually produced them.
      setControls(appliedUrl.searchParams);
      error.textContent = cause.message || '一覧を更新できませんでした。もう一度お試しください。';
      error.hidden = false;
      status.textContent = `${results.dataset.total}件のサービス（更新前の結果）`;
      return false;
    } finally {
      if (pending === controller) root.removeAttribute('aria-busy');
    }
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    root.dataset.filtersOpen = String(open);
  });
  form.addEventListener('submit', event => {event.preventDefault(); navigate(formUrl(), {focusResults: true});});
  form.addEventListener('change', event => {
    if (event.target.matches('input[type="radio"],input[type="checkbox"],select')) navigate(formUrl());
  });
  root.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[data-directory-link]') : null;
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(new URL(anchor.href), {focusResults: anchor.hasAttribute('data-pagination')});
  });
  window.addEventListener('popstate', () => {
    if (location.pathname !== '/') return;
    if (location.search === appliedUrl.search) {
      pending?.abort();
      setControls(appliedUrl.searchParams);
      status.textContent = `${results.dataset.total}件のサービス`;
      root.removeAttribute('aria-busy');
    } else navigate(new URL(location.href), {push: false});
  });
  window.addEventListener('pagehide', () => pending?.abort());
  window.addEventListener('pageshow', event => {
    if (event.persisted && pending?.signal.aborted) {
      setControls(appliedUrl.searchParams);
      root.removeAttribute('aria-busy');
      status.textContent = `${results.dataset.total}件のサービス`;
    }
  });
  return {applySearchFilters: (filters, signal) => {
    const params = new URLSearchParams();
    for (const key of ['q', 'category', 'region', 'feature']) if (filters[key]) params.set(key, filters[key]);
    setControls(params);
    return navigate(formUrl(), {signal});
  }};
}
