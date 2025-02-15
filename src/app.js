import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const feeds = [];
const posts = [];

const initialState = {
  urlForm: {
    value: '',
    processState: 'filling', // 'success', 'error'
    isFirstFeedShowed: false,
    newFeedId: null,
    showPostId: null,
    error: false,
    urls: [],
  },
};

const elements = {
  formEl: document.querySelector('.rss-form'),
  inputEl: document.getElementById('url-input'),
  feedbackEl: document.querySelector('.feedback'),
  labelEl: document.querySelector('label[for="url-input"]'),
  addButtonEl: document.querySelector('button[type="submit"]'),
  feedsEl: document.querySelector('.feeds'),
  postsEl: document.querySelector('.posts'),
  readButtonEl: document.querySelector('.full-article'),
  closeButtonEl: document.querySelector('.modal-footer button[data-bs-dismiss="modal"]'),
  modalTitleEl: document.querySelector('.modal-title'),
  modalDescEl: document.querySelector('.modal-body'),
};

const i18n = i18next.createInstance();
i18n.init({
  lng: 'ru',
  resources,
});

const state = watch(elements, initialState, i18n, feeds, posts);

yup.setLocale({
  string: {
    url: 'errors.inValid',
  },
});

const schema = yup.object().shape({
  url: yup
    .string()
    .trim()
    .required()
    .lowercase()
    .url()
    .test('no double url', 'errors.duplication', (val) => !state.urlForm.urls.includes(val)),
});

const validate = (data) => schema.validate(data); // Promise

export default () => {
  const { formEl, postsEl } = elements;
  const rssProxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true';

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(formEl);
    state.urlForm.value = data.get('url');
    validate({ url: data.get('url') })
      .then((validatedData) => {
        state.urlForm.urls.push(validatedData.url);
        state.urlForm.error = false;

        axios.get(`${rssProxyUrl}&url=${encodeURIComponent(validatedData.url)}`)
          .then((response) => {
            const feedId = Date.now().toString(16);
            const { feed: newFeed, posts: newPosts } = parser(response.data.contents, feedId);
            feeds.push(newFeed);
            posts.push(...newPosts);
            state.urlForm.processState = 'success';
            state.urlForm.isFirstFeedShowed = true;
            state.urlForm.newFeedId = feedId;
          })
          .catch(() => {
            state.urlForm.processState = 'error';
            state.urlForm.error = 'errors.unknown';
          });
      })
      .catch((err) => {
        state.urlForm.error = err.errors;
        state.urlForm.processState = 'error';
      });
  });

  postsEl.addEventListener('click', (e) => {
    const { target } = e;
    state.urlForm.showPostId = target.dataset.id;
  });
};
