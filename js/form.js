document.addEventListener('DOMContentLoaded', function() {

  // ─── Set minimum moving date (today + 7 days) ──────────────────────────────

  var movingDateInput = document.getElementById('moving-date');
  if (movingDateInput) {
    var minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    var yyyy = minDate.getFullYear();
    var mm = String(minDate.getMonth() + 1).padStart(2, '0');
    var dd = String(minDate.getDate()).padStart(2, '0');
    movingDateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  }

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


  // ─── Time Input Mask ───────────────────────────────────────────────────────

  var timeInput = document.getElementById('preferred-time');

  if (timeInput) {
    timeInput.addEventListener('input', function() {
      var digits = this.value.replace(/\D/g, '').slice(0, 4);
      this.value = formatTime(digits);
    });

    timeInput.addEventListener('blur', function() {
      var digits = this.value.replace(/\D/g, '');
      if (digits.length === 0) return;

      var hours = parseInt(digits.slice(0, 2), 10);
      var minutes = digits.length >= 3 ? parseInt(digits.slice(2, 4), 10) : 0;

      if (hours > 23 || minutes > 59) {
        showError(this, 'Please enter a valid time (HH:MM)');
      }
    });
  }

  function formatTime(digits) {
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + ' : ' + digits.slice(2, 4);
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
    'current-address': function(el) { return el.value.trim() !== '' ? '' : 'Current address is required'; },
    'new-address': function(el) { return el.value.trim() !== '' ? '' : 'New address is required'; },
    'moving-date': function(el) {
      if (el.value.trim() === '') return 'Moving date is required';
      var selectedDate = new Date(el.value);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 7);
      if (selectedDate < minDate) return 'Moving date must be at least 7 days from today';
      return '';
    },
    'preferred-time': function(el) {
      if (el.value.trim() === '') return 'Preferred time is required';
      var digits = el.value.replace(/\D/g, '');
      if (digits.length < 4) return 'Please enter a valid time (HH:MM)';
      var hours = parseInt(digits.slice(0, 2), 10);
      var minutes = parseInt(digits.slice(2, 4), 10);
      if (hours > 23 || minutes > 59) return 'Please enter a valid time (HH:MM)';
      return '';
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
      form.querySelectorAll('.error-message').forEach(function(el) {
        el.remove();
      });

      // Clear submit error
      var submitErrorDiv = document.getElementById('submit-error');
      if (submitErrorDiv) submitErrorDiv.textContent = '';

      var hasErrors = false;

      function validate(id, testFn, message) {
        var input = document.getElementById(id);
        if (!input) return;
        if (!testFn(input)) {
          showError(input, message);
          hasErrors = true;
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

      // Moving date
      var movingDateInput = document.getElementById('moving-date');
      if (movingDateInput) {
        if (movingDateInput.value.trim() === '') {
          showError(movingDateInput, 'Moving date is required');
          hasErrors = true;
        } else {
          var selectedDate = new Date(movingDateInput.value);
          var today = new Date();
          today.setHours(0, 0, 0, 0);
          var minDate = new Date(today);
          minDate.setDate(minDate.getDate() + 7);

          if (selectedDate < minDate) {
            showError(movingDateInput, 'Moving date must be at least 7 days from today');
            hasErrors = true;
          }
        }
      }

      // Preferred time
      var preferredTimeInput = document.getElementById('preferred-time');
      if (preferredTimeInput) {
        if (preferredTimeInput.value.trim() === '') {
          showError(preferredTimeInput, 'Preferred time is required');
          hasErrors = true;
        } else {
          var digits = preferredTimeInput.value.replace(/\D/g, '');
          var hours = parseInt(digits.slice(0, 2), 10);
          var minutes = parseInt(digits.slice(2, 4), 10);
          if (digits.length < 4 || hours > 23 || minutes > 59) {
            showError(preferredTimeInput, 'Please enter a valid time (HH:MM)');
            hasErrors = true;
          }
        }
      }

      if (hasErrors) {
        var firstError = form.querySelector('.error');
        if (firstError) {
          var offset = firstError.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
        return;
      }

      // Success - send via EmailJS
      var submitBtn = form.querySelector('.submit-btn');
      submitBtn.disabled = true;
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
        items_list: document.getElementById('items-list').value.trim() || 'None listed'
      };

      emailjs.send('service_zu5cwsu', 'template_rlol0sd', templateParams, 'ntC0ghWITIauoKO8h')
        .then(function() {
          var quotationForm = document.getElementById('quotation-form');
          var successMessage = document.getElementById('success-message');
          var requiredLegend = document.querySelector('.required-legend');
          var progressBarEl = document.querySelector('.progress-bar');

          if (quotationForm) quotationForm.style.display = 'none';
          if (requiredLegend) requiredLegend.style.display = 'none';
          if (progressBarEl) progressBarEl.style.display = 'none';

          if (successMessage) {
            successMessage.style.display = 'block';
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                successMessage.classList.add('visible');
              });
            });
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(function(error) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'SUBMIT';
          var errDiv = document.getElementById('submit-error');
          if (errDiv) {
            errDiv.textContent = 'Failed to send. Please try again.' + (error.text ? ' ' + error.text : '');
          }
        });
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
