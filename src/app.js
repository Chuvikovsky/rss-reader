import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watch from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const rssProxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true';

const initialState = {
  urlForm: {
    processState: 'filling', // 'success', 'error'
    showPostWithId: null,
    error: false,
    visitedUrls: [],
    feeds: [], // { id, title, desc, url }
    posts: [], // { id, title, link, feedId, desc }
    isAutoUpdateStarted: false,
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

const state = watch(elements, initialState, i18n);

const CheckForUpdates = () => {
  const inner = () => {
    const feedIds = state.urlForm.feeds.map((feed) => feed.id);
    const urls = state.urlForm.feeds.map((feed) => feed.url);

    Promise.all(urls.map((url) => axios.get(`${rssProxyUrl}&url=${encodeURIComponent(url)}`)))
      .then((responses) => {
        responses.forEach((response, idx) => {
          const feedId = feedIds[idx];
          const { posts: newPosts } = parser(response.data.contents);
          const oldPosts = state.urlForm.posts.filter((post) => post.feedId === feedId);
          const filteredNewPosts = _.differenceWith(
            newPosts,
            oldPosts,
            (newPost, oldPost) => newPost.link === oldPost.link,
          );
          if (filteredNewPosts.length > 0) {
            const startIndex = oldPosts.length;
            const newUpdatedPosts = filteredNewPosts.map((post, index) => ({ ...post, feedId, id: `${feedId}${startIndex + index}` }));
            state.urlForm.posts.unshift(...newUpdatedPosts);
          }
        });
      }).catch((e) => {
        console.log(e);
      });
    CheckForUpdates();
  };
  setTimeout(inner, 5000);
};

yup.setLocale({
  string: {
    url: 'errors.inValid',
  },
});

const schema = yup.object().shape({
  url: yup
    .string()
    .trim()
    .required('errors.empty')
    .lowercase()
    .url()
    .test('no double url', 'errors.duplication', (val) => !state.urlForm.feeds.find((feed) => feed.url === val)),
});

const validate = (data) => schema.validate(data); // Promise

export default () => {
  const { formEl, postsEl } = elements;

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(formEl);
    validate({ url: data.get('url') })
      .then((validatedData) => {
        axios.get(`${rssProxyUrl}&url=${encodeURIComponent(validatedData.url)}`)
          .then((response) => {
            const feedId = Date.now().toString(16);
            const {
              feed: newFeed,
              posts: newPosts,
            } = parser(response.data.contents);
            newFeed.id = feedId;
            newFeed.url = validatedData.url;
            state.urlForm.feeds.unshift(newFeed);

            const newUpdatedPosts = newPosts.map((post, index) => ({ ...post, feedId, id: `${feedId}${index}` }));
            state.urlForm.posts.unshift(...newUpdatedPosts);
            state.urlForm.error = '';
            state.urlForm.processState = 'success';
            if (!state.urlForm.isAutoUpdateStarted) {
              CheckForUpdates();
              state.urlForm.isAutoUpdateStarted = true;
            }
          })
          .catch((err) => {
            console.log(err);
            state.urlForm.error = err.name === 'TypeError' ? 'errors.inValidRSS' : 'errors.net';
            state.urlForm.processState = 'error';
          });
      })
      .catch((err) => {
        state.urlForm.error = err.errors;
        state.urlForm.processState = 'error';
      });
  });

  postsEl.addEventListener('click', (e) => {
    const { target } = e;
    const { id } = target.dataset;
    state.urlForm.showPostWithId = id;
    const { link } = state.urlForm.posts.find((post) => post.id === id);
    state.urlForm.visitedUrls.push(link);
  });
};
