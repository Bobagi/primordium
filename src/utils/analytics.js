const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;

let initialized = false;

const hasWindow = typeof window !== "undefined";

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

const gtag = (...args) => {
  ensureDataLayer().push(args);
};

export const initAnalytics = () => {
  if (!hasWindow || !measurementId || initialized) return false;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: true,
  });

  initialized = true;
  return true;
};

export const trackEvent = (name, params = {}) => {
  if (!hasWindow || !measurementId) return;
  gtag("event", name, params);
};
