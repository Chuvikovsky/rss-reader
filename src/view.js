import onChange from 'on-change';

export default (elements, state, i18n) => {
  const {
    formEl, feedbackEl, inputEl, labelEl, buttonEl,
  } = elements;
  inputEl.setAttribute('placeholder', i18n.t('interface.placehoder'));
  labelEl.textContent = i18n.t('interface.label');
  buttonEl.textContent = i18n.t('interface.button');

  const watch = onChange(state, (path, value) => {
    if (path === 'urlForm.error') {
      if (value) {
        feedbackEl.textContent = i18n.t(value);
        feedbackEl.classList.remove('text-success');
        feedbackEl.classList.add('text-danger');
        inputEl.classList.add('is-invalid');
        return;
      }
      feedbackEl.textContent = '';
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');
    }

    if (path === 'urlForm.processState' && value === 'success') {
      feedbackEl.textContent = i18n.t('notification.success');
      feedbackEl.classList.add('text-success');
      feedbackEl.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');
      formEl.reset();
      inputEl.focus();
    }
  });

  return watch;
};
