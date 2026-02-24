document.addEventListener('DOMContentLoaded', function() {

  // ─── Set minimum moving date (today) ───────────────────────────────────────

  var movingDateInput = document.getElementById('moving-date');
  if (movingDateInput) {
    var minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    var yyyy = minDate.getFullYear();
    var mm = String(minDate.getMonth() + 1).padStart(2, '0');
    var dd = String(minDate.getDate()).padStart(2, '0');
    movingDateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  }

  // ─── Form Dirty Flag & beforeunload Warning ──────────────────────────────

  var formDirty = false;
  var quotationFormEl = document.getElementById('quotation-form');
  if (quotationFormEl) {
    quotationFormEl.addEventListener('change', function() { formDirty = true; });
    quotationFormEl.addEventListener('input', function() { formDirty = true; });
  }

  window.addEventListener('beforeunload', function(e) {
    if (formDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });


  // ─── Phone Number Input Mask (Korean format: XXX-XXXX-XXXX) ─────────────

  var phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace') {
        var digits = this.value.replace(/\D/g, '');
        if (digits.length > 0) {
          var newDigits = digits.slice(0, -1);
          this.value = formatPhone(newDigits);
          e.preventDefault();
        }
      }
    });

    phoneInput.addEventListener('input', function() {
      var digits = this.value.replace(/\D/g, '').slice(0, 11);
      this.value = formatPhone(digits);
    });
  }

  function formatPhone(digits) {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return digits.slice(0, 3) + '-' + digits.slice(3);
    return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7, 11);
  }


  // ─── File Upload ───────────────────────────────────────────────────────────

  var uploadArea = document.getElementById('upload-area');
  var fileInput = document.getElementById('file-input');
  var fileList = document.getElementById('file-list');
  var uploadError = document.getElementById('upload-error');
  var uploadedFiles = [];

  if (uploadArea && fileInput && fileList) {
    uploadArea.addEventListener('click', function() {
      fileInput.click();
    });

    // Keyboard support: Enter/Space opens file dialog
    uploadArea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    uploadArea.addEventListener('dragenter', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      processFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function() {
      processFiles(this.files);
      this.value = '';
    });
  }

  function showUploadError(message) {
    if (uploadError) {
      uploadError.textContent = message;
      setTimeout(function() {
        uploadError.textContent = '';
      }, 5000);
    }
  }

  function processFiles(files) {
    var maxSize = 5 * 1024 * 1024;

    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      if (!file.type.startsWith('image/')) {
        showUploadError('"' + file.name + '" is not a supported image format.');
        continue;
      }

      if (file.size > maxSize) {
        showUploadError('"' + file.name + '" is too large. Maximum file size is 5 MB.');
        continue;
      }

      uploadedFiles.push(file);
    }

    renderFileList();
  }

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';

    uploadedFiles.forEach(function(file, index) {
      var item = document.createElement('div');
      item.className = 'file-item';

      var thumbnail = document.createElement('div');
      thumbnail.className = 'file-thumbnail';

      var img = document.createElement('img');
      img.alt = file.name;
      var reader = new FileReader();
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      var removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '\u00d7';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', 'Remove ' + file.name);
      removeBtn.addEventListener('click', function() {
        uploadedFiles.splice(index, 1);
        renderFileList();
      });

      thumbnail.appendChild(img);
      thumbnail.appendChild(removeBtn);

      var info = document.createElement('p');
      info.className = 'file-info';
      var displayName = file.name.length > 15
        ? file.name.slice(0, 12) + '...'
        : file.name;
      info.textContent = displayName + ' (' + formatFileSize(file.size) + ')';

      item.appendChild(thumbnail);
      item.appendChild(info);
      fileList.appendChild(item);
    });
  }

  function formatFileSize(bytes) {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(1) + ' KB';
  }


  // ─── Clear Errors on Input ─────────────────────────────────────────────────

  var allFields = document.querySelectorAll('input, select, textarea');

  allFields.forEach(function(field) {
    var eventType = (field.tagName === 'SELECT') ? 'change' : 'input';
    field.addEventListener(eventType, function() {
      clearError(this);
    });
  });

  // Clear radio group errors on selection
  document.querySelectorAll('input[name="travel-truck"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      var errEl = document.getElementById('travel-truck-error');
      if (errEl) errEl.textContent = '';
    });
  });
  document.querySelectorAll('input[name="help-carry"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      var errEl = document.getElementById('help-carry-error');
      if (errEl) errEl.textContent = '';
    });
  });

  function clearError(input) {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    var next = input.nextElementSibling;
    if (next && next.classList.contains('error-message')) {
      next.remove();
    }
  }


  // ─── Inline Blur Validation ────────────────────────────────────────────────

  var blurValidations = {
    'first-name': function(el) { return el.value.trim() !== '' ? '' : 'First name is required'; },
    'last-name': function(el) { return el.value.trim() !== '' ? '' : 'Last name is required'; },
    'phone': function(el) {
      var digits = el.value.replace(/\D/g, '');
      return (digits.length >= 10 && digits.length <= 11) ? '' : 'Please enter a valid phone number (10\u201311 digits)';
    },
    'items-list': function(el) { return el.value.trim() !== '' ? '' : 'Please list the items to be moved'; },
    'current-address': function(el) { return el.value.trim() !== '' ? '' : 'Current address is required'; },
    'new-address': function(el) { return el.value.trim() !== '' ? '' : 'New address is required'; },
    'moving-date': function(el) {
      if (el.value.trim() === '') return 'Moving date is required';
      var selectedDate = new Date(el.value);
      var minAllowed = new Date();
      minAllowed.setDate(minAllowed.getDate() + 7);
      minAllowed.setHours(0, 0, 0, 0);
      if (selectedDate < minAllowed) return 'Moving date must be at least 7 days from today';
      return '';
    },
    'preferred-time': function(el) {
      return el.value.trim() !== '' ? '' : 'Preferred time is required';
    }
  };

  var selectValidations = {
    'current-elevator': 'Please select an option',
    'new-elevator': 'Please select an option'
  };

  Object.keys(blurValidations).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function() {
        if (this.value === '' && !this.dataset.touched) {
          this.dataset.touched = 'true';
          return;
        }
        this.dataset.touched = 'true';
        var msg = blurValidations[id](this);
        if (msg) {
          showError(this, msg);
        } else {
          clearError(this);
        }
      });
    }
  });

  Object.keys(selectValidations).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', function() {
        if (this.value === '') {
          showError(this, selectValidations[id]);
        } else {
          clearError(this);
        }
      });
    }
  });


  // ─── Progress Bar IntersectionObserver ──────────────────────────────────────

  var progressSteps = document.querySelectorAll('.progress-step');
  var progressConnectors = document.querySelectorAll('.progress-connector');
  var sections = document.querySelectorAll('.form-section');

  if (progressSteps.length > 0 && sections.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var sectionId = entry.target.id;
          var stepIndex = -1;
          progressSteps.forEach(function(step, i) {
            if (step.dataset.section === sectionId) {
              stepIndex = i;
            }
          });
          if (stepIndex >= 0) {
            updateProgressBar(stepIndex);
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }

  function updateProgressBar(activeIndex) {
    progressSteps.forEach(function(step, i) {
      step.classList.remove('active', 'completed');
      if (i < activeIndex) {
        step.classList.add('completed');
      } else if (i === activeIndex) {
        step.classList.add('active');
      }
    });
    progressConnectors.forEach(function(connector, i) {
      connector.classList.toggle('completed', i < activeIndex);
    });
  }


  // ─── Form Submission ───────────────────────────────────────────────────────

  var form = document.getElementById('quotation-form');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Clear all previous errors
      form.querySelectorAll('.error').forEach(function(el) {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      });
      form.querySelectorAll('.error-message:not(.radio-error)').forEach(function(el) {
        el.remove();
      });

      // Clear radio errors
      var travelTruckErrorEl = document.getElementById('travel-truck-error');
      var helpCarryErrorEl = document.getElementById('help-carry-error');
      if (travelTruckErrorEl) travelTruckErrorEl.textContent = '';
      if (helpCarryErrorEl) helpCarryErrorEl.textContent = '';

      // Clear submit error
      var submitErrorDiv = document.getElementById('submit-error');
      if (submitErrorDiv) submitErrorDiv.textContent = '';

      var hasErrors = false;
      var errorCount = 0;

      function validate(id, testFn, message) {
        var input = document.getElementById(id);
        if (!input) return;
        if (!testFn(input)) {
          showError(input, message);
          hasErrors = true;
          errorCount++;
        }
      }

      // First name
      validate('first-name', function(el) {
        return el.value.trim() !== '';
      }, 'First name is required');

      // Last name
      validate('last-name', function(el) {
        return el.value.trim() !== '';
      }, 'Last name is required');

      // Phone (10-11 digits for Korean numbers)
      validate('phone', function(el) {
        var digits = el.value.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
      }, 'Please enter a valid phone number (10\u201311 digits)');

      // Items list
      validate('items-list', function(el) {
        return el.value.trim() !== '';
      }, 'Please list the items to be moved');

      // Current address
      validate('current-address', function(el) {
        return el.value.trim() !== '';
      }, 'Current address is required');

      // Current elevator
      validate('current-elevator', function(el) {
        return el.value !== '';
      }, 'Please select an option');

      // New address
      validate('new-address', function(el) {
        return el.value.trim() !== '';
      }, 'New address is required');

      // New elevator
      validate('new-elevator', function(el) {
        return el.value !== '';
      }, 'Please select an option');

      // Moving date (7-day minimum)
      var movingDateInput = document.getElementById('moving-date');
      if (movingDateInput) {
        if (movingDateInput.value.trim() === '') {
          showError(movingDateInput, 'Moving date is required');
          hasErrors = true;
          errorCount++;
        } else {
          var selectedDate = new Date(movingDateInput.value);
          var minAllowed = new Date();
          minAllowed.setDate(minAllowed.getDate() + 7);
          minAllowed.setHours(0, 0, 0, 0);
          if (selectedDate < minAllowed) {
            showError(movingDateInput, 'Moving date must be at least 7 days from today');
            hasErrors = true;
            errorCount++;
          }
        }
      }

      // Preferred time
      var preferredTimeInput = document.getElementById('preferred-time');
      if (preferredTimeInput) {
        if (preferredTimeInput.value.trim() === '') {
          showError(preferredTimeInput, 'Preferred time is required');
          hasErrors = true;
          errorCount++;
        }
      }

      // Travel truck radio
      var travelTruckChecked = document.querySelector('input[name="travel-truck"]:checked');
      if (!travelTruckChecked) {
        if (travelTruckErrorEl) travelTruckErrorEl.textContent = 'Please select an option';
        hasErrors = true;
        errorCount++;
      }

      // Help carry radio
      var helpCarryChecked = document.querySelector('input[name="help-carry"]:checked');
      if (!helpCarryChecked) {
        if (helpCarryErrorEl) helpCarryErrorEl.textContent = 'Please select an option';
        hasErrors = true;
        errorCount++;
      }

      if (hasErrors) {
        if (submitErrorDiv) {
          submitErrorDiv.textContent = errorCount + ' field' + (errorCount > 1 ? 's' : '') + ' need' + (errorCount === 1 ? 's' : '') + ' attention. Please review and correct before submitting.';
        }
        var firstError = form.querySelector('.error, .radio-error:not(:empty)');
        if (firstError) {
          var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          var offset = firstError.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offset, behavior: reducedMotion ? 'auto' : 'smooth' });
        }
        return;
      }

      // Success - send via EmailJS
      var submitBtn = form.querySelector('.submit-btn');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = '<span class="spinner"></span> SENDING...';

      var travelTruck = document.querySelector('input[name="travel-truck"]:checked');
      var helpCarry = document.querySelector('input[name="help-carry"]:checked');

      var templateParams = {
        from_name: document.getElementById('first-name').value.trim() + ' ' + document.getElementById('last-name').value.trim(),
        phone: document.getElementById('phone').value,
        current_address: document.getElementById('current-address').value.trim(),
        current_elevator: document.getElementById('current-elevator').value,
        new_address: document.getElementById('new-address').value.trim(),
        new_elevator: document.getElementById('new-elevator').value,
        moving_date: document.getElementById('moving-date').value,
        preferred_time: document.getElementById('preferred-time').value,
        travel_truck: travelTruck ? travelTruck.value : 'Not specified',
        help_carry: helpCarry ? helpCarry.value : 'Not specified',
        items_list: document.getElementById('items-list').value.trim()
      };

      emailjs.send('service_zu5cwsu', 'template_rlol0sd', templateParams, 'ntC0ghWITIauoKO8h')
        .then(function() {
          formDirty = false;

          var quotationForm = document.getElementById('quotation-form');
          var successMessage = document.getElementById('success-message');
          var requiredLegend = document.querySelector('.required-legend');
          var progressBarEl = document.querySelector('.progress-bar');

          if (quotationForm) quotationForm.style.display = 'none';
          if (requiredLegend) requiredLegend.style.display = 'none';
          if (progressBarEl) progressBarEl.style.display = 'none';

          if (successMessage) {
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                successMessage.classList.add('visible');
                successMessage.focus();
              });
            });
          }
          var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        })
        .catch(function(error) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.innerHTML = 'SUBMIT';
          var errDiv = document.getElementById('submit-error');
          if (errDiv) {
            errDiv.textContent = 'Failed to send. Please try again.' + (error.text ? ' ' + error.text : '');
          }
        });
    });
  }


  // ─── QR Code Lightbox ──────────────────────────────────────────────────────

  var lightbox = document.getElementById('qr-lightbox');
  var lightboxImg = document.getElementById('qr-lightbox-img');
  var lightboxClose = document.querySelector('.qr-lightbox-close');
  var lightboxPreviousFocus = null;

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.contact-qr').forEach(function(img) {
      img.addEventListener('click', function() {
        lightboxPreviousFocus = this;
        lightboxImg.src = this.src;
        lightboxImg.alt = this.alt;
        lightbox.classList.add('open');
        if (lightboxClose) lightboxClose.focus();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      if (lightboxPreviousFocus) {
        lightboxPreviousFocus.focus();
        lightboxPreviousFocus = null;
      }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
      // Tab trap: keep focus on close button while lightbox is open
      if (e.key === 'Tab' && lightbox.classList.contains('open')) {
        e.preventDefault();
        if (lightboxClose) lightboxClose.focus();
      }
    });
  }

  // ─── Show Error Helper ─────────────────────────────────────────────────────

  function showError(input, message) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');

    // Remove any existing error message for this field first
    var existing = input.nextElementSibling;
    if (existing && existing.classList.contains('error-message')) {
      existing.remove();
    }

    var errorId = input.id ? input.id + '-error' : 'error-' + Math.random().toString(36).slice(2, 8);
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = errorId;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    input.setAttribute('aria-describedby', errorId);
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }

});
