/* Multi-step home valuation form. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var form = document.getElementById('valuationForm');
  if (!form) return;

  var TOTAL_STEPS = 3;
  var currentStep = 1;

  var stepEls = form.querySelectorAll('.valuation-step');
  var progressEls = document.querySelectorAll('#progressSteps .step');

  function showStep(stepNum) {
    Array.prototype.forEach.call(stepEls, function (el) {
      var s = el.getAttribute('data-step');
      el.classList.toggle('active', s === String(stepNum));
    });

    Array.prototype.forEach.call(progressEls, function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.remove('active', 'complete');
      if (stepNum === 'success') {
        el.classList.add('complete');
      } else if (s < stepNum) {
        el.classList.add('complete');
      } else if (s === stepNum) {
        el.classList.add('active');
      }
    });

    // Scroll to top of card on step change for better UX
    var card = form.closest('.valuation-card');
    if (card && typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function validateStep(stepNum) {
    var stepEl = form.querySelector('.valuation-step[data-step="' + stepNum + '"]');
    if (!stepEl) return true;
    var fields = stepEl.querySelectorAll('input, select, textarea');
    var valid = true;
    Array.prototype.forEach.call(fields, function (field) {
      // Use the browser's built-in validity check for required + pattern + type.
      if (field.willValidate && !field.checkValidity()) {
        field.classList.add('is-invalid');
        if (valid) {
          // Focus first invalid field
          field.focus();
        }
        valid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });
    return valid;
  }

  // Clear is-invalid on input
  form.addEventListener('input', function (e) {
    if (e.target && e.target.classList) {
      e.target.classList.remove('is-invalid');
    }
  });

  form.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'next') {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) {
        currentStep += 1;
        showStep(currentStep);
      }
    } else if (action === 'prev') {
      if (currentStep > 1) {
        currentStep -= 1;
        showStep(currentStep);
      }
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    if (window.LeadForms && typeof window.LeadForms.submitForm === 'function') {
      window.LeadForms.submitForm(form, function () {
        form.reset();
        currentStep = 1;
        showStep('success');
      });
    } else {
      // Fallback: native submit
      form.submit();
    }
  });

  // Initialize
  showStep(currentStep);
})();
