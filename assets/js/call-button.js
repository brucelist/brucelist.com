/* Smart Call Button — on touch devices, let tel: links dial.
   On desktops, intercept the click and show a modal with a copyable phone
   number, WhatsApp shortcut, email link, and a callback request form. */
(function () {
  'use strict';

  var CALLBACK_FORM_ENDPOINT = 'https://formspree.io/f/mqenaynq';

  var PHONE_DISPLAY = '403-891-2345';
  var PHONE_E164    = '+14038912345';
  var WHATSAPP_URL  = 'https://wa.me/14038912345?text=Hi%20Bruce%2C%20I%20found%20you%20online%20and%20wanted%20to%20chat.';
  var EMAIL_ADDR    = 'bruce@brucelist.com';

  var FOCUSABLE_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function isTouchDevice() {
    try {
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return true;
      }
    } catch (e) { /* ignore */ }
    var ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  }

  // ---------- Modal construction ----------
  var modal = null;
  var modalContent = null;
  var copyBtn = null;
  var lastFocusedEl = null;
  var keydownHandler = null;

  function buildModal() {
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'call-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'callModalTitle');
    modal.setAttribute('aria-hidden', 'true');
    modal.tabIndex = -1;

    modal.innerHTML =
      '<div class="call-modal-backdrop" data-call-close></div>' +
      '<div class="call-modal-dialog" role="document">' +
        '<button type="button" class="call-modal-close" aria-label="Close" data-call-close>' +
          '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '<h3 id="callModalTitle" class="call-modal-title">Call Bruce</h3>' +
        '<p class="call-modal-sub">Tap a number to copy, message on WhatsApp, email, or request a callback.</p>' +
        '<div class="call-modal-phone">' +
          '<a href="tel:' + PHONE_E164 + '" class="call-modal-number" data-call-number>' + PHONE_DISPLAY + '</a>' +
          '<button type="button" class="call-modal-copy" data-call-copy aria-label="Copy phone number">' +
            '<span class="call-copy-label">Copy</span>' +
          '</button>' +
        '</div>' +
        '<div class="call-modal-actions">' +
          '<a href="' + WHATSAPP_URL + '" class="call-modal-btn call-modal-whatsapp" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>' +
            'WhatsApp' +
          '</a>' +
          '<a href="mailto:' + EMAIL_ADDR + '" class="call-modal-btn call-modal-email">' +
            '<i class="lni lni-envelope" aria-hidden="true"></i>Email instead' +
          '</a>' +
        '</div>' +
        '<div class="call-modal-divider"><span>or request a callback</span></div>' +
        '<form class="call-modal-form" novalidate>' +
          '<div class="row g-2">' +
            '<div class="col-md-6">' +
              '<label for="cm-name" class="form-label">Name</label>' +
              '<input type="text" class="form-control" id="cm-name" name="name" required>' +
            '</div>' +
            '<div class="col-md-6">' +
              '<label for="cm-phone" class="form-label">Phone</label>' +
              '<input type="tel" class="form-control" id="cm-phone" name="phone" required>' +
            '</div>' +
            '<div class="col-12">' +
              '<label for="cm-time" class="form-label">Best time to call</label>' +
              '<input type="text" class="form-control" id="cm-time" name="best_time" placeholder="e.g. weekday evenings">' +
            '</div>' +
            '<div class="col-12 d-grid">' +
              '<button type="submit" class="btn btn-primary-brand">Request a Callback</button>' +
            '</div>' +
          '</div>' +
          '<div class="form-feedback call-modal-feedback" aria-live="polite"></div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    modalContent = modal.querySelector('.call-modal-dialog');
    copyBtn      = modal.querySelector('[data-call-copy]');

    // Close handlers
    var closeEls = modal.querySelectorAll('[data-call-close]');
    Array.prototype.forEach.call(closeEls, function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    // Copy phone number
    copyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      copyPhone();
    });

    // Callback form
    var form = modal.querySelector('.call-modal-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitCallback(form);
    });

    return modal;
  }

  function copyPhone() {
    var label = copyBtn.querySelector('.call-copy-label');
    var done = function () {
      copyBtn.classList.add('copied');
      label.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        label.textContent = 'Copy';
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PHONE_DISPLAY).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      try {
        var ta = document.createElement('textarea');
        ta.value = PHONE_DISPLAY;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (err) {
        label.textContent = 'Copy failed';
        setTimeout(function () { label.textContent = 'Copy'; }, 2000);
      }
    }
  }

  function submitCallback(form) {
    var feedback = form.querySelector('.form-feedback');
    feedback.innerHTML = '';

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : '';

    // Fire analytics regardless of endpoint state.
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'callback_request', {
        event_category: 'lead',
        event_label: 'call_modal'
      });
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    var formData = new FormData(form);
    formData.append('source', 'Call Bruce modal');

    fetch(CALLBACK_FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        form.reset();
        showFeedback(feedback, 'success',
          "Thanks! Bruce will call you back soon.");
      } else {
        showFeedback(feedback, 'error',
          'Something went wrong. Please call ' + PHONE_DISPLAY + '.');
      }
    }).catch(function () {
      showFeedback(feedback, 'error',
        'Network error. Please call ' + PHONE_DISPLAY + '.');
    }).then(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  function showFeedback(container, type, message) {
    container.innerHTML = '';
    var msg = document.createElement('div');
    msg.className = type === 'success' ? 'form-success-msg' : 'form-error-msg';
    msg.textContent = message;
    container.appendChild(msg);
  }

  // ---------- Open / close + focus trap ----------
  function openModal() {
    buildModal();
    lastFocusedEl = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('call-modal-open');

    // Move focus into the dialog (close button is a sensible first stop).
    var firstFocus = modal.querySelector('.call-modal-close');
    if (firstFocus) firstFocus.focus();

    keydownHandler = function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'Tab' || e.keyCode === 9) {
        trapFocus(e);
      }
    };
    document.addEventListener('keydown', keydownHandler);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('call-modal-open');
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function trapFocus(e) {
    var focusables = modalContent.querySelectorAll(FOCUSABLE_SELECTOR);
    if (!focusables.length) return;
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---------- Click delegation ----------
  document.addEventListener('click', function (e) {
    var target = e.target.closest && e.target.closest('[data-call-cta]');
    if (!target) return;
    if (isTouchDevice()) {
      // Let the default tel: action proceed on phones/tablets.
      return;
    }
    e.preventDefault();
    openModal();
  });
})();
