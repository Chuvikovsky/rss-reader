import * as yup from 'yup';
import watch from './view.js';

const initialState = {
  urlForm: {
    value: '',
    processState: 'filling', // 'success', 'error'
    error: false,
    urls: [],
  },
};

const elements = {
  formEl: document.querySelector('.rss-form'),
  inputEl: document.getElementById('url-input'),
  feedbackEl: document.querySelector('.feedback'),
};

const state = watch(elements, initialState);

const schema = yup.object().shape({
  url: yup
    .string()
    .trim()
    .required()
    .lowercase()
    .url()
    .test('no double url', 'this url is already added', (val) => !state.urlForm.urls.includes(val)),
});

const validate = (data) => {
  schema.validate(data)
    .then((validatedData) => {
      state.urlForm.urls.push(validatedData.url);
      state.urlForm.error = false;
      state.urlForm.processState = 'success';
    })
    .catch((e) => {
      state.urlForm.error = e.errors;
      state.urlForm.processState = 'error';
    });
};

export default () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    state.urlForm.value = data.get('url');
    validate({ url: data.get('url') });
  });
};
