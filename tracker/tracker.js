(function () {
  'use strict';

  var SESSION_STORAGE_KEY = 'session_id';
  var EVENTS_ENDPOINT = 'http://localhost:5000/api/events';

  function generateSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function getSessionId() {
    try {
      var existingSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);

      if (existingSessionId) {
        return existingSessionId;
      }

      var newSessionId = generateSessionId();
      window.localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);

      return newSessionId;
    } catch (error) {
      return generateSessionId();
    }
  }

  var sessionId = getSessionId();

  function trackEvent(type, metadata) {
    try {
      var event = Object.assign(
        {
          session_id: sessionId,
          event_type: type,
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        },
        metadata || {}
      );

      if (!navigator.sendBeacon) {
        return;
      }

      var payload = new Blob([JSON.stringify(event)], {
        type: 'application/json'
      });

      navigator.sendBeacon(EVENTS_ENDPOINT, payload);
    } catch (error) {
      // Tracking should never affect the host page.
    }
  }

  window.addEventListener('load', function () {
    trackEvent('page_view');
  });

  document.addEventListener('click', function (event) {
    trackEvent('click', {
      coordinates: {
        x: event.clientX,
        y: event.clientY
      }
    });
  });
})();
