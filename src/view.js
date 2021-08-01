import onChange from 'on-change';

const renderFeeds = (state, i18nInstance) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  const feeds = document.createDocumentFragment();
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  const headerCard = document.createElement('div');
  headerCard.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = i18nInstance.t('feeds');
  headerCard.append(header);
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'boeder-end-0');
    const feedHeader = document.createElement('h3');
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    li.append(feedHeader, feedDescription);
    feedList.append(li);
  });
  feeds.append(headerCard, feedList);
  feedsContainer.append(feeds);
};

const renderPosts = (state, i18nInstance) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  const posts = document.createDocumentFragment();
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  const headerCard = document.createElement('div');
  headerCard.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = i18nInstance.t('posts');
  headerCard.append(header);
  const postList = document.createElement('ul');
  postList.classList.add('list-group', 'border-0', 'rounded-0');
  state.posts
    .forEach((collection) => collection
      .forEach((post) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'boeder-end-0');
        const postLink = document.createElement('a');
        postLink.classList.add('fw-bold');
        postLink.setAttribute('href', post.link);
        postLink.textContent = post.title;
        li.append(postLink);
        postList.append(li);
      }));
  posts.append(headerCard, postList);
  postsContainer.append(posts);
};

const renderForm = (state, i18nInstance) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const submitButton = document.querySelector('#add-button');
  if (document.querySelector('.feedback')) {
    document.querySelector('.feedback').remove();
  }
  switch (state.formState) {
    case 'invalid': {
      submitButton.classList.remove('disabled');
      const feedback = document.createElement('p');
      feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
      feedback.textContent = i18nInstance.t(state.feedback);
      form.parentNode.appendChild(feedback);
      input.classList.add('is-invalid');
      break;
    }
    case 'loading': {
      submitButton.classList.add('disabled');
      const feedback = document.createElement('p');
      feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-info');
      form.reset();
      feedback.textContent = i18nInstance.t(state.feedback);
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      break;
    }
    case 'error': {
      submitButton.classList.remove('disabled');
      const feedback = document.createElement('p');
      feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-warning');
      form.reset();
      feedback.textContent = i18nInstance.t(state.feedback);
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      break;
    }
    case 'valid': {
      submitButton.classList.remove('disabled');
      const feedback = document.createElement('p');
      feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success');
      form.reset();
      feedback.textContent = i18nInstance.t(state.feedback);
      form.parentNode.appendChild(feedback);
      input.classList.remove('is-invalid');
      renderFeeds(state, i18nInstance);
      renderPosts(state, i18nInstance);
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
    case 'formState': {
      renderForm(state, i18nInstance);
      break;
    }
    case 'feedback': {
      renderForm(state, i18nInstance);
      break;
    }
    case 'lang': {
      i18nInstance.changeLanguage(state.lang);
      renderTemplate(i18nInstance);
      renderForm(state, i18nInstance);
      break;
    }
    default:
      break;
  }
});

export default watch;
