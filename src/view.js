import onChange from 'on-change';

export default (elements, state) => {
  const watch = onChange(state, (path, value) => {
    const { formEl, feedbackEl, inputEl } = elements;
    if (path === 'urlForm.error') {
      if (value) {
        feedbackEl.textContent = value;
        inputEl.classList.add('is-invalid');
        return;
      }
      feedbackEl.textContent = '';
      inputEl.classList.remove('is-invalid');
    }

    if (path === 'urlForm.processState' && value === 'success') {
      feedbackEl.textContent = '';
      inputEl.classList.remove('is-invalid');
      formEl.reset();
      inputEl.focus();
    }
  });

  return watch;
};
