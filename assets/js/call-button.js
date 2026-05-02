/* Smart Call Button, on touch devices, let tel: links dial.
   On desktops, intercept the click and show a modal with a copyable phone
   number, email link, and a callback request form. */
(function () {
  'use strict';

  var CALLBACK_FORM_ENDPOINT = 'https://formspree.io/f/mqenaynq';

  var PHONE_DISPLAY = '403-891-2345';
  var PHONE_E164    = '+14038912345';
  var EMAIL_ADDR    = 'bruce@brucelist.com';

  var STRINGS = {
    en: {
      close: 'Close',
      title: 'Call Bruce',
      sub: 'Tap a number to copy, send an email, or request a callback.',
      copyPhone: 'Copy phone number',
      copy: 'Copy',
      copied: 'Copied!',
      emailBtn: 'Email instead',
      divider: 'or request a callback',
      labelName: 'Name',
      labelPhone: 'Phone',
      labelTime: 'Best time to call',
      placeholderTime: 'e.g. weekday evenings',
      submitBtn: 'Request a Callback',
      sending: 'Sending...',
      success: "Thanks! Bruce will call you back, usually within a few hours.",
      errorGeneric: 'Something went wrong. Please call ' + PHONE_DISPLAY + ' or try again.',
      emailFallbackHint: 'Email did not open. Use the contact form below or call ' + PHONE_DISPLAY + '.'
    },
    fa: {
      close: 'بستن',
      title: 'تماس با بهروز',
      sub: 'برای کپی شماره، ارسال ایمیل یا درخواست تماس برگشتی، از گزینه‌های زیر استفاده کنید.',
      copyPhone: 'کپی شماره تلفن',
      copy: 'کپی',
      copied: 'کپی شد!',
      emailBtn: 'ارسال ایمیل',
      divider: 'یا درخواست تماس برگشتی',
      labelName: 'نام',
      labelPhone: 'تلفن',
      labelTime: 'بهترین زمان برای تماس',
      placeholderTime: 'مثلاً عصرهای روزهای کاری',
      submitBtn: 'درخواست تماس برگشتی',
      sending: 'در حال ارسال...',
      success: 'متشکریم! بهروز معمولاً ظرف چند ساعت با شما تماس خواهد گرفت.',
      errorGeneric: 'مشکلی پیش آمد. لطفاً با شماره ' + PHONE_DISPLAY + ' تماس بگیرید یا دوباره تلاش کنید.',
      emailFallbackHint: 'ایمیل باز نشد. از فرم تماس زیر استفاده کنید یا با ' + PHONE_DISPLAY + ' تماس بگیرید.'
    }
  };

  function getStrings() {
    var lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    return lang.indexOf('fa') === 0 ? STRINGS.fa : STRINGS.en;
  }

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
    var t = getStrings();

    modal = document.createElement('div');
    modal.className = 'call-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'callModalTitle');
    modal.setAttribute('aria-hidden', 'true');
    modal.tabIndex = -1;

    modal.innerHTML =
      '<div class="call-modal-backdrop" data-call-close></div>' +
      '<div class="call-modal-dialog">' +
        '<button type="button" class="call-modal-close" aria-label="' + t.close + '" data-call-close>' +
          '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '<h3 id="callModalTitle" class="call-modal-title">' + t.title + '</h3>' +
        '<p class="call-modal-sub">' + t.sub + '</p>' +
        '<div class="call-modal-phone">' +
          '<a href="tel:' + PHONE_E164 + '" class="call-modal-number ltr" data-call-number>' + PHONE_DISPLAY + '</a>' +
          '<button type="button" class="call-modal-copy" data-call-copy aria-label="' + t.copyPhone + '">' +
            '<span class="call-copy-label">' + t.copy + '</span>' +
          '</button>' +
        '</div>' +
        '<div class="call-modal-actions">' +
          '<a href="mailto:' + EMAIL_ADDR + '" class="call-modal-btn call-modal-email">' +
            '<i class="lni lni-envelope" aria-hidden="true"></i>' + t.emailBtn +
          '</a>' +
        '</div>' +
        '<div class="call-modal-divider"><span>' + t.divider + '</span></div>' +
        '<form class="call-modal-form" novalidate>' +
          '<div class="row g-2">' +
            '<div class="col-md-6">' +
              '<label for="cm-name" class="form-label">' + t.labelName + '</label>' +
              '<input type="text" class="form-control" id="cm-name" name="name" autocomplete="name" required>' +
            '</div>' +
            '<div class="col-md-6">' +
              '<label for="cm-phone" class="form-label">' + t.labelPhone + '</label>' +
              '<input type="tel" class="form-control" id="cm-phone" name="phone" autocomplete="tel" required>' +
            '</div>' +
            '<div class="col-12">' +
              '<label for="cm-time" class="form-label">' + t.labelTime + '</label>' +
              '<input type="text" class="form-control" id="cm-time" name="best_time" placeholder="' + t.placeholderTime + '">' +
            '</div>' +
            '<div class="col-12 d-grid">' +
              '<button type="submit" class="btn btn-primary-brand">' + t.submitBtn + '</button>' +
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

    // Email button, try mailto:, fall back to contact form if no mail client.
    var emailBtn = modal.querySelector('.call-modal-email');
    if (emailBtn) {
      emailBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleEmailClick();
      });
    }

    // Callback form
    var form = modal.querySelector('.call-modal-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitCallback(form);
    });

    return modal;
  }

  function handleEmailClick() {
    var didBlur = false;
    var onBlur = function () { didBlur = true; };
    window.addEventListener('blur', onBlur);

    window.location.href = 'mailto:' + EMAIL_ADDR;

    setTimeout(function () {
      window.removeEventListener('blur', onBlur);
      if (didBlur) return;

      // No mail client took focus, fall back to the contact form.
      closeModal();
      var contactOnPage = document.getElementById('contact');
      if (contactOnPage) {
        contactOnPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var firstInput = contactOnPage.querySelector('input, textarea, select');
        if (firstInput) {
          setTimeout(function () { firstInput.focus({ preventScroll: true }); }, 700);
        }
      } else {
        // No contact section on this page, go to the homepage's contact form.
        window.location.href = '/#contact';
      }
    }, 1200);
  }

  function copyPhone() {
    var t = getStrings();
    var label = copyBtn.querySelector('.call-copy-label');
    var done = function () {
      copyBtn.classList.add('copied');
      label.textContent = t.copied;
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        label.textContent = t.copy;
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
        label.textContent = t.copy;
      }
    }
  }

  function submitCallback(form) {
    var t = getStrings();
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
      submitBtn.textContent = t.sending;
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
        showFeedback(feedback, 'success', t.success);
      } else {
        showFeedback(feedback, 'error', t.errorGeneric);
      }
    }).catch(function () {
      showFeedback(feedback, 'error', t.errorGeneric);
    }).finally(function () {
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
