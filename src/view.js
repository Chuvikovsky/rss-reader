import onChange from 'on-change';

const handleProcessState = (elements, state, i18n) => {
  const { formEl, feedbackEl, inputEl } = elements;
  switch (state) {
    case 'filling':
      break;
    case 'error':
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      break;
    case 'success':
      feedbackEl.textContent = i18n.t('notification.success');
      feedbackEl.classList.add('text-success');
      feedbackEl.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');
      formEl.reset();
      inputEl.focus();
      break;
    default:
      break;
  }
};

const showError = (elements, error, i18n) => {
  const { feedbackEl } = elements;
  feedbackEl.textContent = '';
  feedbackEl.textContent = i18n.t(error);
};

const getTitleSectionEl = (title) => {
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const subDiv = document.createElement('div');
  subDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = title;

  subDiv.append(h2);
  div.append(subDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(ul);

  return div;
};

const showFeeds = (elements, i18n, feeds) => {
  const { feedsEl } = elements;
  feedsEl.innerHTML = '';
  const feedsTitleSectionEl = getTitleSectionEl(i18n.t('interface.feeds'));
  feedsEl.append(feedsTitleSectionEl);
  const ul = feedsEl.querySelector('ul');

  const lis = feeds.map((feed) => `<li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${feed.title}</h3>
    <p class="m-0 small text-black-50">${feed.desc}</p>
    </li>`);

  ul.innerHTML = lis.join('');
};

const showPosts = (elements, i18n, posts, visitedUrls) => {
  const { postsEl } = elements;
  postsEl.innerHTML = '';
  const postsTitleSectionEl = getTitleSectionEl(i18n.t('interface.posts'));
  postsEl.append(postsTitleSectionEl);
  const ul = postsEl.querySelector('ul');

  const lis = posts.map((post) => {
    const { id, title, link } = post;
    const aClass = visitedUrls.includes(link) ? 'fw-normal link-secondary' : 'fw-bold';
    const htmlLi = `
    <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
    <a href="${link}" class="${aClass}" data-id="${id}" target="_blank" rel="noopener noreferrer">${title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('interface.view')}</button>
    </li>`;
    return htmlLi;
  });

  ul.innerHTML = `${ul.innerHTML}${lis.join('')}`;
};

const showPostWithId = (elements, postId, posts) => {
  const { modalTitleEl, modalDescEl, readButtonEl } = elements;
  const post = posts.find((p) => p.id === postId);
  modalTitleEl.textContent = post.title;
  modalDescEl.textContent = post.desc;
  readButtonEl.setAttribute('href', post.link);
  const link = document.querySelector(`a[data-id="${postId}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

export default (elements, state, i18n) => {
  const {
    inputEl, labelEl, addButtonEl, readButtonEl, closeButtonEl,
  } = elements;
  inputEl.setAttribute('placeholder', i18n.t('interface.placehoder'));
  labelEl.textContent = i18n.t('interface.label');
  addButtonEl.textContent = i18n.t('interface.addButton');
  readButtonEl.textContent = i18n.t('interface.read');
  closeButtonEl.textContent = i18n.t('interface.close');

  const watch = onChange(state, (path, value) => {
    switch (path) {
      case 'urlForm.processState':
        handleProcessState(elements, value, i18n);
        break;
      case 'urlForm.error':
        showError(elements, value, i18n);
        break;
      case 'urlForm.feeds':
        showFeeds(elements, i18n, value);
        break;
      case 'urlForm.posts':
        showPosts(elements, i18n, value, state.urlForm.visitedUrls);
        break;
      case 'urlForm.showPostWithId':
        showPostWithId(elements, value, state.urlForm.posts);
        break;
      default:
        break;
    }
    watch.urlForm.processState = 'filling'; // to restart processState to treat two errors or successes in a row
  });

  return watch;
};
