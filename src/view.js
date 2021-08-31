import onChange from 'on-change';
import _ from 'lodash';

const createElement = (elName, text, ...classes) => {
  const el = document.createElement(elName);
  el.textContent = text;
  el.classList.add(...classes);
  return el;
};

const removeElement = (selector) => {
  if (document.querySelector(selector)) {
    document.querySelector(selector).remove();
  }
};

const liElementsCreator = {
  feeds: (feed) => {
    const li = createElement('li', '', 'list-group-item', 'border-0', 'boeder-end-0');
    const feedHeader = createElement('h3', feed.title, 'h6', 'm-0');
    const feedDescription = createElement('p', feed.description, 'm-0', 'small', 'text-black-50');
    li.append(feedHeader, feedDescription);
    return li;
  },
  posts: (post, state, i18nInstance) => {
    const li = createElement('li', '', 'list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'boeder-end-0');
    const linkStyle = state.ui.viewedPosts.has(post.id) ? 'fw-normal' : 'fw-bold';
    const postLink = createElement('a', post.title, linkStyle);
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.setAttribute('role', 'link');
    postLink.setAttribute('data-id', post.id);
    postLink.setAttribute('data-role', 'link');
    const postReadBtn = createElement('button', `${i18nInstance.t('view')}`, 'btn', 'btn-outline-primary', 'btn-sm');
    postReadBtn.setAttribute('type', 'button');
    postReadBtn.setAttribute('data-bs-target', '#modal');
    postReadBtn.setAttribute('data-bs-toggle', 'modal');
    postReadBtn.setAttribute('data-id', post.id);
    postReadBtn.setAttribute('data-role', 'button');
    li.append(postLink, postReadBtn);
    return li;
  },
};

const createFeedback = (text, color, i18nInstance) => {
  const feedback = createElement('p', i18nInstance.t(text), 'feedback', 'm-0', 'position-absolute', 'small', `${color}`);
  return feedback;
};

const renderList = (state, name, i18nInstance, liCreator) => {
  if (state[name].length > 0) {
    const container = document.querySelector(`.${name}`);
    container.innerHTML = '';
    const card = createElement('div', '', 'card', 'border-0');
    const headerCard = createElement('div', '', 'card-body');
    const header = createElement('h2', i18nInstance.t(name), 'card-title', 'h4');
    headerCard.append(header);
    card.append(headerCard);
    const list = createElement('ul', '', 'list-group', 'border-0', 'rounded-0');
    state[name].forEach((item) => {
      const element = liCreator[name](item, state, i18nInstance);
      list.append(element);
    });
    card.append(list);
    container.append(card);
  }
};

const renderContent = (state, i18nInstance) => {
  renderList(state, 'feeds', i18nInstance, liElementsCreator);
  renderList(state, 'posts', i18nInstance, liElementsCreator);
};

const formHandler = {
  invalid: (state, i18nInstance, elements) => {
    elements.submitButton.removeAttribute('disabled');
    elements.input.removeAttribute('readonly');
    removeElement('.feedback');
    const feedback = createFeedback(state.form.error, 'text-danger', i18nInstance);
    elements.form.parentNode.appendChild(feedback);
    elements.input.classList.add('is-invalid');
    renderContent(state, i18nInstance);
  },
  valid: (state, i18nInstance, elements) => {
    elements.submitButton.removeAttribute('disabled');
    elements.input.removeAttribute('readonly');
    removeElement('.feedback');
    elements.form.reset();
    elements.input.classList.remove('is-invalid');
    renderContent(state, i18nInstance);
  },
};

const loadingHandler = {
  loading: (state, i18nInstance, elements) => {
    elements.submitButton.setAttribute('disabled', null);
    elements.input.setAttribute('readonly', null);
    removeElement('.feedback');
    const feedback = createFeedback(state.loading.status, 'text-info', i18nInstance);
    elements.form.parentNode.appendChild(feedback);
    elements.input.classList.remove('is-invalid');
  },
  error: (state, i18nInstance, elements) => {
    elements.submitButton.removeAttribute('disabled');
    elements.input.removeAttribute('readonly');
    removeElement('.feedback');
    const feedback = createFeedback(state.loading.error, 'text-warning', i18nInstance);
    elements.form.parentNode.appendChild(feedback);
    elements.input.classList.remove('is-invalid');
    renderContent(state, i18nInstance);
  },
  success: (state, i18nInstance, elements) => {
    elements.submitButton.removeAttribute('disabled');
    elements.input.removeAttribute('readonly');
    removeElement('.feedback');
    const feedback = createFeedback(state.loading.status, 'text-success', i18nInstance);
    elements.form.reset();
    elements.form.parentNode.appendChild(feedback);
    elements.input.classList.remove('is-invalid');
    renderContent(state, i18nInstance);
  },
};

const renderTemplate = (i18nInstance) => {
  const header = document.querySelector('#header');
  const slogan = document.querySelector('#slogan');
  const example = document.querySelector('#example');
  const addButton = document.querySelector('#add-button');
  const langButton = document.querySelector('#lang-button');
  const label = document.querySelector('#label');
  const modal = document.querySelector('#modal');
  const modalReadBtn = modal.querySelector('.modal-footer > a');
  const modalCloseBtn = modal.querySelector('.modal-footer > button');
  modalReadBtn.textContent = i18nInstance.t('modalRead');
  modalCloseBtn.textContent = i18nInstance.t('modalClose');
  header.textContent = i18nInstance.t('header');
  slogan.textContent = i18nInstance.t('slogan');
  example.textContent = i18nInstance.t('example');
  addButton.textContent = i18nInstance.t('addButton');
  langButton.textContent = i18nInstance.t('langButton');
  label.textContent = i18nInstance.t('label');
};

const renderModal = (state) => {
  const currentPost = state.posts.filter((post) => post.id === state.modal.modalId)[0];
  const modal = document.querySelector('#modal');
  const modalHeader = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const modalReadLink = modal.querySelector('.full-article');
  modalHeader.textContent = currentPost.title;
  modalBody.textContent = currentPost.description;
  modalReadLink.setAttribute('href', currentPost.link);
};

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#url-input'),
  submitButton: document.querySelector('#add-button'),
};

const stateRenderer = {
  loading: (state, i18nInstance) => {
    loadingHandler[state.loading.status](state, i18nInstance, elements);
  },
  form: (state, i18nInstance) => {
    formHandler[state.form.status](state, i18nInstance, elements);
  },
  lang: (state, i18nInstance) => {
    i18nInstance.changeLanguage(state.lang);
    renderTemplate(i18nInstance);
    formHandler[state.form.status](state, i18nInstance, elements);
    loadingHandler[state.loading.status](state, i18nInstance, elements);
  },
  posts: (state, i18nInstance) => {
    renderContent(state, i18nInstance);
  },
  modal: (state) => {
    renderModal(state);
  },
  ui: (state, i18nInstance) => {
    renderContent(state, i18nInstance);
  },
};

const watch = (state, i18nInstance) => onChange(state, (path) => {
  if (_.has(stateRenderer, path)) {
    stateRenderer[path](state, i18nInstance);
  }
});

export default watch;
