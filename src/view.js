import onChange from 'on-change';

const renderForm = (state, i18nInstance) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  if (document.querySelector('.feedback')) {
    document.querySelector('.feedback').remove();
  }
  if (state.formState === 'invalid') {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
    feedback.textContent = i18nInstance.t(state.feedback);
    form.parentNode.appendChild(feedback);
    input.classList.add('is-invalid');
  }
  if (state.formState === 'valid') {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success');
    form.reset();
    feedback.textContent = i18nInstance.t(state.feedback);
    form.parentNode.appendChild(feedback);
    input.classList.remove('is-invalid');
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
