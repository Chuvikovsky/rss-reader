import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import watch from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

const rssProxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true';

const initialState = {
  rssForm: {
    processState: 'filling', // 'success', 'error'
    showPostWithId: null,
    notification: '',
    visitedUrls: [],
    feeds: [], // { id, title, desc, url }
    posts: [], // { id, title, link, feedId, desc }
  },
};

const getElements = () => ({
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
});

const checkForRssUpdate = (state) => {
  const promiseFeeds = state.rssForm.feeds.map((feed) => {
    const { url, id } = feed;
    return axios.get(`${rssProxyUrl}&url=${encodeURIComponent(url)}`)
      .then((response) => {
        const { posts: newPosts } = parser(response.data.contents);
        const oldPosts = state.rssForm.posts.filter((post) => post.feedId === id);
        const filteredNewPosts = _.differenceWith(
          newPosts,
          oldPosts,
          (newPost, oldPost) => newPost.link === oldPost.link,
        );
        if (filteredNewPosts.length > 0) {
          const postId = uuidv4();
          const newUpdatedPosts = filteredNewPosts.map((post) => ({ ...post, feedId: id, id: `${postId}` }));
          state.rssForm.posts.unshift(...newUpdatedPosts);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
  Promise.all(promiseFeeds).finally(() => {
    setTimeout(checkForRssUpdate, 5000, state);
  });
};

export default () => {
  const i18n = i18next.createInstance();
  let state;

  i18n.init({
    lng: 'ru',
    resources,
  }).then((t) => {
    state = watch(getElements(), initialState, t);

    yup.setLocale({
      string: {
        url: 'errors.invalidUrl',
      },
    });

    const schema = yup.object().shape({
      url: yup
        .string()
        .trim()
        .required('errors.empty')
        .lowercase()
        .url()
        .test('no double url', 'errors.urlDuplication', (val) => !state.rssForm.feeds.find((feed) => feed.url === val)),
    });

    const validate = (data) => schema.validate(data); // Promise

    const { formEl, postsEl } = getElements();

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      state.rssForm.processState = 'filling';
      state.rssForm.notification = '';

      const data = new FormData(formEl);
      validate({ url: data.get('url') })
        .then((validatedData) => {
          axios.get(`${rssProxyUrl}&url=${encodeURIComponent(validatedData.url)}`)
            .then((response) => {
              const feedId = uuidv4();
              const {
                feed: newFeed,
                posts: newPosts,
              } = parser(response.data.contents);
              newFeed.id = feedId;
              newFeed.url = validatedData.url;
              state.rssForm.feeds.unshift(newFeed);

              const newUpdatedPosts = newPosts.map((post) => ({ ...post, feedId, id: `${uuidv4()}` }));
              state.rssForm.posts.unshift(...newUpdatedPosts);
              state.rssForm.notification = i18n.t('notification.success');
              state.rssForm.processState = 'success';
            })
            .catch((err) => {
              state.rssForm.notification = err.name === 'TypeError' ? 'errors.invalidRSS' : 'errors.noNetwork';
              state.rssForm.processState = 'error';
            });
        })
        .catch((err) => {
          state.rssForm.notification = err.errors;
          state.rssForm.processState = 'error';
        });
    });

    postsEl.addEventListener('click', (e) => {
      const { target } = e;
      const { id } = target.dataset;
      state.rssForm.showPostWithId = id;
      const { link } = state.rssForm.posts.find((post) => post.id === id);
      state.rssForm.visitedUrls.push(link);
    });

    setTimeout(checkForRssUpdate, 5000, state);
  });
};
