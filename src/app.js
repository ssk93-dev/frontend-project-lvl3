import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watch from './view';
import ru from './locales/ru';
import en from './locales/en';
import yupLocale from './locales/yup';
import parse from './parser';

const validate = (value, feeds) => {
  const schema = yup.string().min(1).url().notOneOf(feeds);
  return schema.validate(value)
    .then((res) => res)
    .catch((err) => err);
};

const identifyError = (error) => {
  if (axios.isAxiosError(error)) return 'errors.network';
  if (_.has(error, 'parsingError')) return 'errors.invalidRss';
  return 'errors.unknown';
};

const getUrlContent = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`).then((res) => res);

const findNewPosts = (state) => {
  const existedPosts = state.posts.map((post) => post.guid);
  const promises = state.feeds
    .map((feed) => getUrlContent(feed.source)
      .then((data) => {
        const updatedPosts = parse(data, feed.source).items;
        const newPosts = updatedPosts
          .filter((post) => !(existedPosts.includes(post.guid)));
        return newPosts;
      })
      .catch());
  return promises;
};

const updateInterval = 5000;

const app = () => {
  const i18nInstance = i18n.createInstance();
  yup.setLocale(yupLocale);
  const state = {
    lang: 'ru',
    status: '',
    feedback: '',
    feeds: [],
    posts: [],
  };
  i18nInstance.init({
    lng: state.lang,
    resources: { ru, en },
  }).then(() => {
    const watchedState = watch(state, i18nInstance);
    const form = document.querySelector('.rss-form');
    const lngBtn = document.querySelector('#lang-button');
    lngBtn.addEventListener('click', () => {
      // eslint-disable-next-line no-unused-expressions
      state.lang === 'ru' ? watchedState.lang = 'en' : watchedState.lang = 'ru';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const url = formData.get('url').trim();
      const existedUrls = state.feeds.map((feed) => feed.source);
      validate(url, existedUrls)
        .then((res) => {
          if (!res.message) {
            state.feedback = 'loading';
            watchedState.status = 'loading';
            getUrlContent(url)
              .then((data) => {
                const content = parse(data, url);
                state.feeds.push(content.channel);
                state.posts = [...state.posts, ...content.items];
                state.feedback = 'added';
                watchedState.status = 'valid';
              })
              .catch((error) => {
                state.feedback = identifyError(error);
                watchedState.status = 'error';
              });
          } else {
            watchedState.feedback = res.message;
            watchedState.status = 'invalid';
          }
        });
    });
    const update = (timeout) => {
      if (state.feeds.length > 0) {
        const newPosts = findNewPosts(state);
        Promise.all(newPosts)
          .then((result) => {
            result.forEach((posts) => { watchedState.posts = [...watchedState.posts, ...posts]; });
          });
      }
      setTimeout(() => {
        update(timeout);
      }, timeout);
    };
    update(updateInterval);
  });
};

export default app;
