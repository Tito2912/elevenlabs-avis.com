(function(){
  const GA_ID = 'G-GBJ40NV4T2';
  const CONSENT_COOKIE = 'cookie_consent';
  const CONSENT_MAX_AGE_DAYS = 365;
  const CONSENT_VALUES = {
    'ad_storage': 'granted',
    'analytics_storage': 'granted',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  let analyticsLoaded = false;
  let consentUpgraded = false;

  function injectAnalytics(){
    if (analyticsLoaded) { return; }
    analyticsLoaded = true;
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    script.onload = function(){
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { 'anonymize_ip': true });
    };
    document.head.appendChild(script);
  }

  function enableAnalytics(){
    if (!consentUpgraded) {
      window.gtag('consent', 'update', CONSENT_VALUES);
      consentUpgraded = true;
    }
    injectAnalytics();
  }

  function setCookie(name, value, days){
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax;Secure`;
  }

  function getCookie(name){
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (let cookie of cookies){
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) { return cookieValue; }
    }
    return null;
  }

  function hideBanner(){
    const banner = document.getElementById('cookie-banner');
    if (banner) { banner.style.display = 'none'; }
  }

  function showBanner(){
    const banner = document.getElementById('cookie-banner');
    if (banner) { banner.style.display = 'flex'; }
  }

  function acceptCookies(){
    setCookie(CONSENT_COOKIE, '1', CONSENT_MAX_AGE_DAYS);
    hideBanner();
    enableAnalytics();
  }

  window.addEventListener('load', function(){
    const consentGiven = getCookie(CONSENT_COOKIE) === '1';
    const button = document.getElementById('cookie-accept');
    if (button) { button.addEventListener('click', acceptCookies); }
    if (consentGiven) {
      hideBanner();
      enableAnalytics();
    } else {
      showBanner();
    }
  });

  function initLiteYoutube(){
    const wrappers = document.querySelectorAll('.lite-youtube');
    if (!wrappers.length) { return; }
    wrappers.forEach(function(wrapper){
      const button = wrapper.querySelector('.lite-youtube__button');
      if (!button) { return; }
      const videoId = wrapper.dataset.videoId;
      const videoTitle = wrapper.dataset.videoTitle || 'Video YouTube';
      const loadVideo = function(){
        if (wrapper.dataset.loaded === '1') { return; }
        wrapper.dataset.loaded = '1';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.title = videoTitle;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        wrapper.innerHTML = '';
        wrapper.appendChild(iframe);
      };
      button.addEventListener('click', loadVideo);
      button.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          loadVideo();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiteYoutube);
  } else {
    initLiteYoutube();
  }

  function initMobileMenu(){
    const header = document.querySelector('header');
    if (!header) { return; }

    const toggle = header.querySelector('.menu-toggle');
    if (!toggle) { return; }

    const navId = toggle.getAttribute('aria-controls');
    const nav = navId ? document.getElementById(navId) : header.querySelector('nav');
    if (!nav) { return; }

    header.classList.add('has-menu');

    const setOpen = function(open){
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    setOpen(false);

    toggle.addEventListener('click', function(){
      const isOpen = header.classList.contains('nav-open');
      setOpen(!isOpen);
    });

    nav.addEventListener('click', function(event){
      const link = event.target.closest('a');
      if (!link) { return; }
      setOpen(false);
    });

    document.addEventListener('click', function(event){
      if (!header.classList.contains('nav-open')) { return; }
      if (event.target.closest('header')) { return; }
      setOpen(false);
    });

    document.addEventListener('keydown', function(event){
      if (event.key !== 'Escape') { return; }
      setOpen(false);
    });

    window.addEventListener('resize', function(){
      if (window.innerWidth > 768) {
        setOpen(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  document.addEventListener('click', function(event){
    const link = event.target.closest('.language-switcher a');
    if (!link) { return; }
    try {
      localStorage.setItem('lang_redirect_done', '1');
    } catch (err) {
      /* localStorage may be blocked */
    }
  });
})();
