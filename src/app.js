/* eslint-disable no-param-reassign */
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
  if (_.has(error, 'isAxiosError')) return 'errors.network';
  if (_.has(error, 'isParsingError')) return 'errors.invalidRss';
  return 'errors.unknown';
};

const proxifyUrl = (url) => {
  const proxyfiedUrl = new URL('https://hexlet-allorigins.herokuapp.com/get');
  proxyfiedUrl.searchParams.set('disableCache', true);
  proxyfiedUrl.searchParams.set('url', url);
  return proxyfiedUrl;
};

const handlePost = (event, state) => {
  const currentId = event.target.dataset.id;
  const trgetRole = event.target.dataset.role;
  if (trgetRole === 'link') {
    state.ui = { viewedPosts: state.ui.viewedPosts.add(currentId) };
  }
  if (trgetRole === 'button') {
    state.ui = { viewedPosts: state.ui.viewedPosts.add(currentId) };
    state.modal = { modalId: currentId };
  }
};

const addNewRss = (url, state) => {
  state.loading = { status: 'loading', error: null };
  axios.get(proxifyUrl(url))
    .then((data) => {
      const content = parse(data);
      const feed = { ...content.channel, url };
      const posts = content.items.map((item) => ({ ...item, id: _.uniqueId(), url }));
      state.feeds = [feed, ...state.feeds];
      state.posts = [...posts, ...state.posts];
      state.loading = { status: 'success', error: null };
    })
    .catch((error) => {
      state.loading = { status: 'error', error: identifyError(error) };
    });
};

const findNewPosts = (state) => {
  const existedPosts = state.posts.map((post) => post.link);
  const promises = state.feeds
    .map((feed) => axios.get(proxifyUrl(feed.url))
      .then((data) => {
        const updatedPosts = parse(data).items;
        const newPosts = updatedPosts
          .filter((post) => !(existedPosts.includes(post.link)))
          .map((post) => ({ ...post, id: _.uniqueId() }));
        return newPosts;
      })
      .catch());
  return Promise.all(promises);
};

const updateRss = (timeout, state) => {
  if (state.feeds.length > 0) {
    findNewPosts(state)
      .then((result) => {
        result.forEach((posts) => { state.posts = [...posts, ...state.posts]; });
      });
  }
  setTimeout(() => {
    updateRss(timeout, state);
  }, timeout);
};

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#url-input'),
  submitButton: document.querySelector('#add-button'),
  lngBtn: document.querySelector('#lang-button'),
  postsContainer: document.querySelector('.posts'),
};

const updateInterval = 5000;

const app = () => {
  const i18nInstance = i18n.createInstance();
  yup.setLocale(yupLocale);
  const state = {
    lang: 'ru',
    form: {
      status: 'valid',
      error: '',
    },
    modal: {
      modalId: null,
    },
    loading: {
      status: '',
      error: null,
    },
    ui: {
      viewedPosts: new Set(),
    },
    feeds: [],
    posts: [],
  };
  i18nInstance.init({
    lng: state.lang,
    resources: { ru, en },
  }).then(() => {
    const watchedState = watch(state, i18nInstance, elements);

    elements.postsContainer.addEventListener('click', (e) => {
      handlePost(e, watchedState);
    });
    elements.lngBtn.addEventListener('click', () => {
      // eslint-disable-next-line no-unused-expressions
      watchedState.lang === 'ru' ? watchedState.lang = 'en' : watchedState.lang = 'ru';
    });
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(elements.form);
      const url = formData.get('url').trim();
      const existedUrls = state.feeds.map((feed) => feed.url);
      validate(url, existedUrls)
        .then((res) => {
          if (!res.message) {
            watchedState.form = { status: 'valid', error: null };
            addNewRss(url, watchedState);
          } else {
            watchedState.form = { status: 'invalid', error: res.message };
          }
        });
    });
    updateRss(updateInterval, watchedState);
  });
};

export default app;
