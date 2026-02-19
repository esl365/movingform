document.addEventListener('DOMContentLoaded', function() {

  // ─── Phone Number Input Mask ───────────────────────────────────────────────

  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace') {
        const digits = this.value.replace(/\D/g, '');
        if (digits.length > 0) {
          const newDigits = digits.slice(0, -1);
          this.value = formatPhone(newDigits);
          e.preventDefault();
        }
      }
    });

    phoneInput.addEventListener('input', function(e) {
      const digits = this.value.replace(/\D/g, '').slice(0, 10);
      this.value = formatPhone(digits);
    });
  }

  function formatPhone(digits) {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return '(' + digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 10);
  }


  // ─── Time Input Mask ───────────────────────────────────────────────────────

  const timeInput = document.getElementById('preferred-time');

  if (timeInput) {
    timeInput.addEventListener('input', function(e) {
      const digits = this.value.replace(/\D/g, '').slice(0, 4);
      this.value = formatTime(digits);
    });

    timeInput.addEventListener('blur', function() {
      const digits = this.value.replace(/\D/g, '');
      if (digits.length === 0) return;

      const hours = parseInt(digits.slice(0, 2), 10);
      const minutes = digits.length >= 3 ? parseInt(digits.slice(2, 4), 10) : 0;

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


  // ─── File Upload Drag & Drop ───────────────────────────────────────────────

  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  let uploadedFiles = [];

  if (uploadArea && fileInput && fileList) {
    uploadArea.addEventListener('click', function() {
      fileInput.click();
    });

    uploadArea.addEventListener('dragenter', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
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

  function processFiles(files) {
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        continue;
      }

      if (file.size > maxSize) {
        alert('"' + file.name + '" is too large. Maximum file size is 5MB.');
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
      const item = document.createElement('div');
      item.className = 'file-item';

      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '\u00d7';
      removeBtn.type = 'button';
      removeBtn.addEventListener('click', function() {
        uploadedFiles.splice(index, 1);
        renderFileList();
      });

      const info = document.createElement('p');
      info.className = 'file-info';
      const displayName = file.name.length > 15
        ? file.name.slice(0, 12) + '...'
        : file.name;
      info.textContent = displayName + ' (' + formatFileSize(file.size) + ')';

      item.appendChild(img);
      item.appendChild(removeBtn);
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

  const allFields = document.querySelectorAll('input, select, textarea');

  allFields.forEach(function(field) {
    const eventType = (field.tagName === 'SELECT') ? 'change' : 'input';
    field.addEventListener(eventType, function() {
      this.classList.remove('error');
      const next = this.nextElementSibling;
      if (next && next.classList.contains('error-message')) {
        next.remove();
      }
    });
  });


  // ─── Form Validation ───────────────────────────────────────────────────────

  const form = document.getElementById('quotation-form');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Clear all previous errors
      form.querySelectorAll('.error').forEach(function(el) {
        el.classList.remove('error');
      });
      form.querySelectorAll('.error-message').forEach(function(el) {
        el.remove();
      });

      let hasErrors = false;

      function validate(id, testFn, message) {
        const input = document.getElementById(id);
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

      // Phone
      validate('phone', function(el) {
        return el.value.replace(/\D/g, '').length === 10;
      }, 'Please enter a valid 10-digit phone number');

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
      const movingDateInput = document.getElementById('moving-date');
      if (movingDateInput) {
        if (movingDateInput.value.trim() === '') {
          showError(movingDateInput, 'Moving date is required');
          hasErrors = true;
        } else {
          const selectedDate = new Date(movingDateInput.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const minDate = new Date(today);
          minDate.setDate(minDate.getDate() + 7);

          if (selectedDate < minDate) {
            showError(movingDateInput, 'Moving date must be at least 7 days from today');
            hasErrors = true;
          }
        }
      }

      // Preferred time
      const preferredTimeInput = document.getElementById('preferred-time');
      if (preferredTimeInput) {
        if (preferredTimeInput.value.trim() === '') {
          showError(preferredTimeInput, 'Preferred time is required');
          hasErrors = true;
        } else {
          const digits = preferredTimeInput.value.replace(/\D/g, '');
          const hours = parseInt(digits.slice(0, 2), 10);
          const minutes = parseInt(digits.slice(2, 4), 10);
          if (digits.length < 4 || hours > 23 || minutes > 59) {
            showError(preferredTimeInput, 'Please enter a valid time (HH:MM)');
            hasErrors = true;
          }
        }
      }

      if (hasErrors) {
        const firstError = form.querySelector('.error');
        if (firstError) {
          const offset = firstError.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
        return;
      }

      // Success
      const quotationForm = document.getElementById('quotation-form');
      const successMessage = document.getElementById('success-message');

      if (quotationForm) quotationForm.style.display = 'none';
      if (successMessage) successMessage.style.display = 'block';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ─── Show Error Helper ─────────────────────────────────────────────────────

  function showError(input, message) {
    input.classList.add('error');

    // Remove any existing error message for this field first
    const existing = input.nextElementSibling;
    if (existing && existing.classList.contains('error-message')) {
      existing.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }

});
