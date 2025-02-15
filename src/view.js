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

const showTitleSections = (elements, i18n) => {
  const { feedsEl, postsEl } = elements;
  const feedsTitleSectionEl = getTitleSectionEl(i18n.t('interface.feeds'));
  const postsTitleSectionEl = getTitleSectionEl(i18n.t('interface.posts'));
  feedsEl.append(feedsTitleSectionEl);
  postsEl.append(postsTitleSectionEl);
};

const showNewFeed = (elements, i18n, feedId, feeds) => {
  const { feedsEl } = elements;
  const newFeed = feeds.find((f) => f.id === feedId);

  const li = `<li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${newFeed.title}</h3>
    <p class="m-0 small text-black-50">${newFeed.desc}</p>
    </li>`;
  const ul = feedsEl.querySelector('ul');
  ul.innerHTML = `${ul.innerHTML}${li}`;
};

const showNewPosts = (elements, i18n, feedId, posts) => {
  const { postsEl } = elements;
  const newPosts = posts.filter((p) => p.feedId === feedId);

  const lis = newPosts.map((post) => {
    const { id, title, link } = post;
    const htmlLi = `
    <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
    <a href="${link}" class="fw-bold" data-id="${id}" target="_blank" rel="noopener noreferrer">${title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('interface.view')}</button>
    </li>`;
    return htmlLi;
  });

  const ul = postsEl.querySelector('ul');
  ul.innerHTML = `${ul.innerHTML}${lis.join('')}`;
};

const showPost = (elements, postId, posts) => {
  const { modalTitleEl, modalDescEl, readButtonEl } = elements;
  const post = posts.find((p) => p.id === postId);
  modalTitleEl.textContent = post.title;
  modalDescEl.textContent = post.desc;
  readButtonEl.setAttribute('href', post.link);
  const link = document.querySelector(`a[data-id="${postId}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

export default (elements, state, i18n, feeds, posts) => {
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
      case 'urlForm.newFeedId':
        showNewPosts(elements, i18n, value, posts);
        showNewFeed(elements, i18n, value, feeds);
        break;
      case 'urlForm.showPostId':
        showPost(elements, value, posts);
        break;
      case 'urlForm.isFirstFeedShowed':
        showTitleSections(elements, i18n);
        break;
      default:
        break;
    }
    watch.urlForm.processState = 'filling'; // to restart processState to treat two errors or succeses in a row
  });

  return watch;
};
