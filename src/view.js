import onChange from 'on-change';

const liElementsCreator = {
  feeds: (feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'boeder-end-0');
    const feedHeader = document.createElement('h3');
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    li.append(feedHeader, feedDescription);
    return li;
  },
  posts: (post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'boeder-end-0');
    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.setAttribute('href', post.link);
    postLink.textContent = post.title;
    li.append(postLink);
    return li;
  },
};

const createFeedback = (text, color, i18nInstance) => {
  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', `${color}`);
  feedback.textContent = i18nInstance.t(text);
  return feedback;
};

const renderList = (state, name, i18nInstance, liCreator) => {
  if (state[name].length > 0) {
    const container = document.querySelector(`.${name}`);
    container.innerHTML = '';
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const headerCard = document.createElement('div');
    headerCard.classList.add('card-body');
    const header = document.createElement('h2');
    header.classList.add('card-title', 'h4');
    header.textContent = i18nInstance.t(name);
    headerCard.append(header);
    card.append(headerCard);
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    state[name].forEach((item) => {
      const element = liCreator[name](item);
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

const render = (state, i18nInstance) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const submitButton = document.querySelector('#add-button');
  input.focus();
  if (document.querySelector('.feedback')) {
    document.querySelector('.feedback').remove();
  }
  switch (state.status) {
    case 'invalid': {
      submitButton.classList.remove('disabled');
      const feedback = createFeedback(state.feedback, 'text-danger', i18nInstance);
      form.parentNode.appendChild(feedback);
      input.classList.add('is-invalid');
      renderContent(state, i18nInstance);
      break;
    }
    case 'loading': {
      submitButton.classList.add('disabled');
      const feedback = createFeedback(state.feedback, 'text-info', i18nInstance);
      form.reset();
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      break;
    }
    case 'error': {
      submitButton.classList.remove('disabled');
      const feedback = createFeedback(state.feedback, 'text-warning', i18nInstance);
      form.reset();
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      renderContent(state, i18nInstance);
      break;
    }
    case 'valid': {
      submitButton.classList.remove('disabled');
      const feedback = createFeedback(state.feedback, 'text-success', i18nInstance);
      form.reset();
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      renderContent(state, i18nInstance);
      break;
    }
    default:
      break;
  }
};

const renderTemplate = (i18nInstance) => {
  const header = document.querySelector('#header');
  const slogan = document.querySelector('#slogan');
  const addButton = document.querySelector('#add-button');
  const langButton = document.querySelector('#lang-button');
  const label = document.querySelector('#label');
  header.textContent = i18nInstance.t('header');
  slogan.textContent = i18nInstance.t('slogan');
  addButton.textContent = i18nInstance.t('addButton');
  langButton.textContent = i18nInstance.t('langButton');
  label.textContent = i18nInstance.t('label');
};

const watch = (state, i18nInstance) => onChange(state, (path) => {
  switch (path) {
    case 'status': {
      render(state, i18nInstance);
      break;
    }
    case 'feedback': {
      render(state, i18nInstance);
      break;
    }
    case 'lang': {
      i18nInstance.changeLanguage(state.lang);
      renderTemplate(i18nInstance);
      render(state, i18nInstance);
      break;
    }
    default:
      break;
  }
});

export default watch;
