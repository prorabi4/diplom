const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
  const recipientEmail = 'ivan.chervinskiy2000@gmail.com';
  const submitButton = feedbackForm.querySelector('button[type="submit"]');
  const statusElement = document.getElementById('feedbackStatus');
  const formSubmitUrl = `https://formsubmit.co/ajax/${recipientEmail}`;
  const phonePattern = /^[+\d][\d\s().-]{6,24}$/;
  const defaultButtonText = submitButton ? submitButton.textContent : '';

  function setFeedbackStatus(message, type = 'info') {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = `feedback-status ${message ? `feedback-status-${type}` : ''}`;
  }

  function setFeedbackLoading(isLoading) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Отправка...' : defaultButtonText;
  }

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(feedbackForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const honey = String(formData.get('_honey') || '').trim();
    const hasConsent = Boolean(formData.get('consent'));

    setFeedbackStatus('');

    if (!name || !email || !phone || !message) {
      setFeedbackStatus('Заполните имя, почту, телефон и сообщение.', 'error');
      return;
    }

    if (honey) {
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

    if (!phonePattern.test(phone)) {
      setFeedbackStatus('Укажите корректный номер телефона.', 'error');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackStatus('Отправляем заявку...', 'info');

    try {
      const response = await fetch(formSubmitUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          consent: 'Да',
          _replyto: email,
          _subject: 'Заявка с сайта ООО «ЮКО»',
          _template: 'table',
          _captcha: 'false',
          _url: window.location.href,
        }),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok || responseBody.success === false) {
        throw new Error(responseBody.message || 'Не удалось отправить заявку.');
      }

      feedbackForm.reset();
      setFeedbackStatus('Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
    } catch (error) {
      console.error(error);
      setFeedbackStatus(error.message || 'Не удалось отправить форму. Попробуйте позже.', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  });
}
