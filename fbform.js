const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
  const web3FormsUrl = 'https://api.web3forms.com/submit';
  const web3FormsAccessKey = '5f130b8d-92b2-4b7d-91dc-1ac7c45aa65a';
  const nameInput = document.getElementById('feedbackName');
  const emailInput = document.getElementById('feedbackEmail');
  const phoneInput = document.getElementById('feedbackPhone');
  const messageInput = document.getElementById('feedbackMessage');
  const submitButton = feedbackForm.querySelector('button[type="submit"]');
  const statusElement = document.getElementById('feedbackStatus');
  const namePattern = /^[A-Za-zА-Яа-яЁё\s]+$/u;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^\+\d \(\d{3}\) \d{3} \d{2}-\d{2}$/;
  const minMessageLength = 10;
  const defaultButtonText = submitButton ? submitButton.textContent : '';

  function setFeedbackStatus(message, type = 'info') {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = `feedback-status ${message ? `feedback-status-${type}` : ''}`;
  }

  function setFeedbackFallbackStatus() {
    if (!statusElement) {
      return;
    }

    statusElement.className = 'feedback-status feedback-status-error';
    statusElement.textContent =
      'Сервис отправки временно недоступен. Отправьте письмо напрямую или попробуйте позже.';
  }

  function setFeedbackLoading(isLoading) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Отправка...' : defaultButtonText;
  }

  function sanitizeName(value) {
    return value.replace(/[^A-Za-zА-Яа-яЁё\s]/gu, '').replace(/\s{2,}/g, ' ');
  }

  function getPhoneDigits(value) {
    return value.replace(/\D/g, '').slice(0, 11);
  }

  function formatPhone(value) {
    const digits = getPhoneDigits(value);

    if (!digits) {
      return '';
    }

    let formattedPhone = `+${digits[0]}`;

    if (digits.length > 1) {
      formattedPhone += ` (${digits.slice(1, 4)}`;
    }

    if (digits.length >= 4) {
      formattedPhone += ')';
    }

    if (digits.length > 4) {
      formattedPhone += ` ${digits.slice(4, 7)}`;
    }

    if (digits.length > 7) {
      formattedPhone += ` ${digits.slice(7, 9)}`;
    }

    if (digits.length > 9) {
      formattedPhone += `-${digits.slice(9, 11)}`;
    }

    return formattedPhone;
  }

  function setFieldValidity(input, isValid, message, shouldReport = false) {
    if (!input) {
      return isValid;
    }

    input.setCustomValidity(isValid ? '' : message);

    if (!isValid && shouldReport) {
      input.reportValidity();
    }

    return isValid;
  }

  function validateName(shouldReport = false) {
    const name = nameInput ? nameInput.value.trim() : '';
    const isValid = name.length >= 2 && namePattern.test(name);

    return setFieldValidity(
      nameInput,
      isValid,
      'Имя должно содержать только буквы кириллицы или латиницы и пробелы.',
      shouldReport,
    );
  }

  function validateEmail(shouldReport = false) {
    const email = emailInput ? emailInput.value.trim() : '';
    const isValid = email.length > 0 && emailPattern.test(email);

    return setFieldValidity(emailInput, isValid, 'Укажите корректную почту.', shouldReport);
  }

  function validatePhone(shouldReport = false) {
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const isValid = phonePattern.test(phone);

    return setFieldValidity(
      phoneInput,
      isValid,
      'Введите телефон в формате +7 (900) 000 00-00.',
      shouldReport,
    );
  }

  function validateMessage(shouldReport = false) {
    const message = messageInput ? messageInput.value.trim() : '';
    const isValid = message.length >= minMessageLength;

    return setFieldValidity(
      messageInput,
      isValid,
      `Сообщение должно быть не короче ${minMessageLength} символов.`,
      shouldReport,
    );
  }

  if (nameInput) {
    nameInput.addEventListener('beforeinput', (event) => {
      if (event.data && /[^A-Za-zА-Яа-яЁё\s]/u.test(event.data)) {
        event.preventDefault();
      }
    });

    nameInput.addEventListener('input', () => {
      nameInput.value = sanitizeName(nameInput.value);
      validateName();
    });

    nameInput.addEventListener('blur', () => validateName());
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail());
    emailInput.addEventListener('blur', () => validateEmail());
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
      validatePhone();
    });

    phoneInput.addEventListener('blur', () => validatePhone());
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => validateMessage());
    messageInput.addEventListener('blur', () => validateMessage());
  }

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (nameInput) {
      nameInput.value = sanitizeName(nameInput.value).trim();
    }

    if (phoneInput) {
      phoneInput.value = formatPhone(phoneInput.value);
    }

    const formData = new FormData(feedbackForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const botcheck = Boolean(formData.get('botcheck'));
    const hasConsent = Boolean(formData.get('consent'));

    setFeedbackStatus('');

    if (!name || !email || !phone || !message) {
      setFeedbackStatus('Заполните имя, почту, телефон и сообщение.', 'error');
      return;
    }

    if (!validateName(true)) {
      setFeedbackStatus('Имя должно содержать только буквы кириллицы или латиницы и пробелы.', 'error');
      return;
    }

    if (!validateEmail(true)) {
      setFeedbackStatus('Укажите корректную почту.', 'error');
      return;
    }

    if (!validatePhone(true)) {
      setFeedbackStatus('Введите телефон в формате +7 (900) 000 00-00.', 'error');
      return;
    }

    if (!validateMessage(true)) {
      setFeedbackStatus(`Сообщение должно быть не короче ${minMessageLength} символов.`, 'error');
      return;
    }

    if (botcheck) {
      feedbackForm.reset();
      setFeedbackStatus('Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
      return;
    }

    if (!feedbackForm.checkValidity()) {
      feedbackForm.reportValidity();
      return;
    }

    if (!hasConsent) {
      setFeedbackStatus('Подтвердите согласие на обработку персональных данных.', 'error');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackStatus('Отправляем заявку...', 'info');

    try {
      const response = await fetch(web3FormsUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: web3FormsAccessKey,
          subject: 'Заявка с сайта ООО «ЮКО»',
          from_name: 'ООО «ЮКО»',
          name,
          email,
          phone,
          message,
          consent: 'Да',
          page_url: window.location.href,
        }),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok || responseBody.success === false) {
        throw new Error(responseBody.message || 'Не удалось отправить заявку.');
      }

      feedbackForm.reset();
      setFeedbackStatus('Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
    } catch (error) {
      console.error('Feedback form submit failed:', error);
      setFeedbackFallbackStatus();
    } finally {
      setFeedbackLoading(false);
    }
  });
}
