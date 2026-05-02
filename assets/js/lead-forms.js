/* Lead capture forms — AJAX submission to Formspree with inline feedback. */
(function () {
  'use strict';

  function showFeedback(form, type, message) {
    var feedback = form.querySelector('.form-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      form.appendChild(feedback);
    }
    feedback.innerHTML = '';
    var msg = document.createElement('div');
    msg.className = type === 'success' ? 'form-success-msg' : 'form-error-msg';
    msg.textContent = message;
    feedback.appendChild(msg);
  }

  function submitForm(form, onSuccess) {
    var endpoint = form.getAttribute('action') || '';
    var feedback = form.querySelector('.form-feedback');
    if (feedback) feedback.innerHTML = '';

    // If the placeholder action is still in place, fail gracefully without a network call.
    if (endpoint.indexOf('YOUR_FORM_ID') !== -1) {
      showFeedback(form, 'error',
        'This form is not yet connected. (Formspree endpoint not configured.)');
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    var formData = new FormData(form);

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          if (typeof onSuccess === 'function') {
            onSuccess(form);
          } else {
            form.reset();
            showFeedback(form, 'success',
              "Thanks! Bruce will be in touch shortly. For anything urgent, call 403-891-2345.");
          }
        } else {
          response.json().then(function (data) {
            var msg = (data && data.errors && data.errors.length)
              ? data.errors.map(function (e) { return e.message; }).join(', ')
              : 'Something went wrong. Please try again or call 403-891-2345.';
            showFeedback(form, 'error', msg);
          }).catch(function () {
            showFeedback(form, 'error',
              'Something went wrong. Please try again or call 403-891-2345.');
          });
        }
      })
      .catch(function () {
        showFeedback(form, 'error',
          'Network error. Please check your connection or call 403-891-2345.');
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
  }

  // Wire up basic lead forms
  var forms = document.querySelectorAll('form.lead-form');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitForm(form);
    });
  });

  // Expose helper for the multi-step valuation form
  window.LeadForms = { submitForm: submitForm, showFeedback: showFeedback };
})();
