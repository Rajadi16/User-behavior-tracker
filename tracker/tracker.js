(function () {
  'use strict';

  var SESSION_STORAGE_KEY = 'session_id';
  var DEFAULT_EVENTS_ENDPOINT = 'http://localhost:5000/api/events';

  function getEventsEndpoint() {
    var currentScript = document.currentScript;

    if (currentScript && currentScript.dataset.endpoint) {
      return currentScript.dataset.endpoint;
    }

    if (currentScript && currentScript.src) {
      try {
        return new URL('/api/events', currentScript.src).toString();
      } catch (error) {
        return DEFAULT_EVENTS_ENDPOINT;
      }
    }

    return DEFAULT_EVENTS_ENDPOINT;
  }

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
  var eventsEndpoint = getEventsEndpoint();

  function cleanText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  function getDocumentSize() {
    var body = document.body || {};
    var html = document.documentElement || {};

    return {
      width: Math.max(
        body.scrollWidth || 0,
        body.offsetWidth || 0,
        html.clientWidth || 0,
        html.scrollWidth || 0,
        html.offsetWidth || 0
      ),
      height: Math.max(
        body.scrollHeight || 0,
        body.offsetHeight || 0,
        html.clientHeight || 0,
        html.scrollHeight || 0,
        html.offsetHeight || 0
      )
    };
  }

  function getViewport() {
    var documentSize = getDocumentSize();

    return {
      width: window.innerWidth || document.documentElement.clientWidth || 0,
      height: window.innerHeight || document.documentElement.clientHeight || 0,
      scroll_x: window.scrollX || window.pageXOffset || 0,
      scroll_y: window.scrollY || window.pageYOffset || 0,
      document_width: documentSize.width,
      document_height: documentSize.height
    };
  }

  function findClosest(target, selector) {
    if (!target || !target.closest) {
      return null;
    }

    return target.closest(selector);
  }

  function getProductMetadata(target) {
    var productCard = findClosest(target, '[data-track-product], .product-card');

    if (!productCard) {
      return {};
    }

    var title = productCard.dataset.trackProduct;
    var price = productCard.dataset.trackPrice;
    var category = productCard.dataset.trackCategory;
    var titleNode = productCard.querySelector('h3');
    var priceNode = productCard.querySelector('[data-price]');
    var categoryNode = productCard.querySelector('.product-meta span');

    return {
      product: cleanText(title || (titleNode && titleNode.textContent)),
      category: cleanText(category || (categoryNode && categoryNode.textContent)),
      price: Number(price || (priceNode && priceNode.dataset.price)) || undefined
    };
  }

  function inferAction(element) {
    if (!element) {
      return 'click';
    }

    if (element.dataset.trackAction) {
      return element.dataset.trackAction;
    }

    if (element.dataset.product) {
      return 'add_to_cart';
    }

    if (element.matches && element.matches('input[type="search"]')) {
      return 'search';
    }

    if (element.matches && element.matches('input[type="checkbox"]')) {
      return 'compare_toggle';
    }

    if (element.matches && element.matches('a')) {
      return 'link_click';
    }

    if (element.matches && element.matches('button')) {
      return cleanText(element.textContent).toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'button_click';
    }

    return 'click';
  }

  function getClickMetadata(target) {
    var interactiveElement = findClosest(
      target,
      '[data-track-action], [data-product], button, a, input, label, .product-card'
    );
    var section = findClosest(target, '[data-track-section], section, header, nav, aside');
    var metadata = getProductMetadata(target);

    if (!interactiveElement) {
      interactiveElement = target;
    }

    metadata.action = inferAction(interactiveElement);
    metadata.tag = interactiveElement.tagName ? interactiveElement.tagName.toLowerCase() : '';
    metadata.text = cleanText(
      interactiveElement.value ||
        (interactiveElement.getAttribute && interactiveElement.getAttribute('aria-label')) ||
        interactiveElement.textContent
    );
    metadata.section = cleanText(
      (section && section.dataset.trackSection) ||
        (section && section.id) ||
        (section && section.getAttribute('aria-label'))
    );
    metadata.href = interactiveElement.href || '';
    metadata.element_id = interactiveElement.id || '';
    metadata.element_class = cleanText(interactiveElement.className || '');

    if (interactiveElement.dataset.product) {
      metadata.product = cleanText(interactiveElement.dataset.product);
    }

    if (interactiveElement.dataset.price) {
      metadata.price = Number(interactiveElement.dataset.price) || metadata.price;
    }

    return metadata;
  }

  function trackEvent(type, metadata) {
    try {
      var event = Object.assign(
        {
          session_id: sessionId,
          event_type: type,
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
          viewport: getViewport()
        },
        metadata || {}
      );

      var body = JSON.stringify(event);
      var sentWithBeacon = false;

      if (navigator.sendBeacon) {
        var payload = new Blob([body], {
          type: 'application/json'
        });

        sentWithBeacon = navigator.sendBeacon(eventsEndpoint, payload);
      }

      if (!sentWithBeacon && window.fetch) {
        window.fetch(eventsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body,
          keepalive: true
        }).catch(function () {});
      }
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
      },
      page_coordinates: {
        x: event.pageX,
        y: event.pageY
      },
      metadata: getClickMetadata(event.target)
    });
  });
})();
