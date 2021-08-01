import * as yup from 'yup';
import i18n from 'i18next';
import watch from './view';
import ru from './locales/ru';
import en from './locales/en';
import yupLocale from './locales/yup';

const validate = (value, feeds) => {
  const schema = yup.string().min(1).url().notOneOf(feeds);
  return schema.validate(value)
    .then((res) => res)
    .catch((err) => err);
};

const app = () => {
  const i18nInstance = i18n.createInstance();
  yup.setLocale(yupLocale);
  const state = {
    lang: 'ru',
    formState: 'flling',
    feedback: '',
    feeds: [],
  };

  i18nInstance.init({
    lng: state.lang,
    resources: { ru, en },
  }).then(() => {
    const watchedState = watch(state, i18nInstance);
    const form = document.querySelector('.rss-form');
    const lngBtn = document.querySelector('#lang-button');
    lngBtn.addEventListener('click', () => {
      if (state.lang === 'ru') {
        watchedState.lang = 'en';
      } else {
        watchedState.lang = 'ru';
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const url = formData.get('url').trim();
      validate(url, state.feeds)
        .then((res) => {
          if (!res.message) {
            state.feeds.push(url);
            watchedState.feedback = 'added';
            watchedState.formState = 'valid';
          } else {
            watchedState.feedback = res.message;
            watchedState.formState = 'invalid';
          }
        });
    });
  });
};

export default app;
