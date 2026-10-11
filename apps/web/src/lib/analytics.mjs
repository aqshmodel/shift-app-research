// Basic consent mode: nothing is downloaded from Google before an explicit opt-in.
export const CONSENT_KEY = 'aqsh-shift-analytics-v1';
const HOST = 'shift.aqsh.co.jp';
const ORIGIN = `https://${HOST}`;
const MAX_AGE = 180 * 86400000;
const DENIED = { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' };
const knownPath = path => /^\/(?:$|products\/(?:$|(?:jp|us)\d{2}\/)|categories\/(?:medical|care|general|api)\/|references\/form-9\/|(?:compare|methodology|webmcp|about|privacy|terms)\/)$/.test(path);

export function safePageUrl(value) {
  try { const u = new URL(value); return u.origin === ORIGIN && knownPath(u.pathname) ? ORIGIN + u.pathname : ORIGIN + '/404/'; } catch { return ORIGIN + '/404/'; }
}
export function safeReferrer(value) {
  try { const u = new URL(value); if(u.protocol !== 'https:' && u.protocol !== 'http:') return ''; return u.hostname === HOST ? safePageUrl(value) : u.origin + '/'; } catch { return ''; }
}
export function readChoice(storage, now = Date.now()) {
  try { const value = JSON.parse(storage.getItem(CONSENT_KEY)); return value && ['granted','denied'].includes(value.state) && Number.isFinite(value.at) && now >= value.at && now - value.at < MAX_AGE ? value.state : null; } catch { return null; }
}

export function initializeAnalytics() {
  const panel = document.getElementById('analytics-consent');
  const settings = document.getElementById('analytics-settings');
  const id = panel?.dataset.measurementId;
  if(location.hostname !== HOST || !/^G-[A-Z0-9]+$/.test(id || '')) return;
  let choice = null;
  try { choice = readChoice(localStorage); } catch {}
  let started = false;
  const disabled = `ga-disable-${id}`;
  window[disabled] = true;
  const status = document.getElementById('analytics-choice');
  const close = document.getElementById('analytics-close');
  const allow = document.getElementById('analytics-allow');
  const deny = document.getElementById('analytics-deny');
  const gtag = function(){ (window.dataLayer ||= []).push(arguments); };
  window.gtag = gtag;
  gtag('consent','default',DENIED);
  gtag('set','url_passthrough',false);
  gtag('set','ads_data_redaction',true);
  function pageFields() {
    return { page_location:safePageUrl(location.href), page_referrer:safeReferrer(document.referrer),
      page_title:document.querySelector('meta[property="og:title"]')?.content || 'Aqsh シフトづくりサービス比較' };
  }
  function track(name, params = {}) {
    if(choice !== 'granted' || window[disabled] || !started) return;
    gtag('event', name, { ...pageFields(), ...params, send_to:id });
  }
  function start() {
    if(started) return;
    started = true;
    window[disabled] = false;
    gtag('consent','update',{...DENIED, analytics_storage:'granted'});
    gtag('js',new Date());
    gtag('config',id,{...pageFields(), send_page_view:false, cookie_domain:HOST,
      cookie_expires:MAX_AGE / 1000, allow_google_signals:false, allow_ad_personalization_signals:false });
    track('page_view');
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(script);
  }
  function show(open) {
    panel.hidden = !open;
    document.body.classList.toggle('consent-open',open);
    if(open) {
      status.textContent = choice === 'granted' ? '現在は計測に同意しています。いつでも変更できます。' : choice === 'denied' ? '現在は計測に同意していません。' : '';
      close.hidden = choice === null;
      document.documentElement.style.setProperty('--consent-height',`${panel.getBoundingClientRect().height}px`);
    }
  }
  function forgetCookies() {
    // Limit deletion to this application's explicitly scoped cookies.
    for(const key of ['_ga',`_ga_${id.slice(2)}`]) {
      for(const domain of ['',`; Domain=${HOST}`]) document.cookie = `${key}=; Max-Age=0; Path=/${domain}; SameSite=Lax; Secure`;
    }
  }
  function choose(next) {
    const wasStarted = started;
    choice = next;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({state:next,at:Date.now()})); } catch {}
    show(false);
    if(next === 'granted') start();
    else {
      window[disabled] = true;
      forgetCookies();
      if(wasStarted) {
        gtag('consent','update',DENIED);
        // Reload without the tag so an already loaded library cannot continue running.
        location.reload();
      }
    }
  }
  allow.addEventListener('click',()=>choose('granted'));
  deny.addEventListener('click',()=>choose('denied'));
  close.addEventListener('click',()=>{show(false);settings.focus();});
  settings.hidden = false;
  settings.addEventListener('click',()=>{show(true);deny.focus();});
  const privacySettings=document.getElementById('privacy-analytics-settings');
  if(privacySettings) {
    privacySettings.hidden=false;
    privacySettings.addEventListener('click',()=>{show(true);deny.focus();});
  }
  new ResizeObserver(()=>{
    if(!panel.hidden) document.documentElement.style.setProperty('--consent-height',`${panel.getBoundingClientRect().height}px`);
  }).observe(panel);
  window.addEventListener('storage',event=>{
    if(event.key === CONSENT_KEY && choice === 'granted') {
      let next = null;
      try { next = readChoice(localStorage); } catch {}
      if(next !== 'granted') { window[disabled]=true; forgetCookies(); location.reload(); }
    }
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted || choice !== 'granted') return;
    let current=null;
    try { current=readChoice(localStorage); } catch {}
    if(current !== 'granted') { window[disabled]=true; forgetCookies(); location.reload(); }
  });
  // Only allowlisted public identifiers and counts are sent, never form values or full link URLs.
  document.addEventListener('click',event=>{
    const target = event.target instanceof Element ? event.target : null;
    const compare = target?.closest('.compare-add');
    if(compare && /^OF-(?:JP|US)\d{2}$/.test(compare.dataset.id || '')) track('compare_select',{product_id:compare.dataset.id});
    const vendor = target?.closest('a[data-vendor-id]');
    if(vendor && /^OF-(?:JP|US)\d{2}$/.test(vendor.dataset.vendorId || '')) track('vendor_click',{product_id:vendor.dataset.vendorId});
  });
  document.addEventListener('submit',event=>{
    if(event.target?.id === 'product-search' && !event.target.hasAttribute('data-home-search')) track('catalog_search');
    if(event.target?.classList.contains('compare-form')) track('compare_submit');
  });
  document.addEventListener('directory:updated',()=>track('catalog_search'));
  if(choice === 'granted') start();
  else forgetCookies();
  show(choice === null);
  if(choice === 'granted' && location.pathname === '/compare/' && document.querySelector('.comparison-table')) track('compare_view');
}
