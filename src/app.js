import * as yup from 'yup';
import watch from './view';

const validate = (value, feeds) => {
  const schema = yup.string().min(1).url().notOneOf(feeds);
  return schema.validate(value)
    .then(() => ({ status: 'valid' }))
    .catch((err) => ({ status: err.name, errors: err.errors }));
};

const app = () => {
  const state = {
    formState: 'valid',
    errors: '',
    feeds: [],
  };

  const watchedState = watch(state);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const url = formData.get('url');
    validate(url, state.feeds).then((res) => {
      if (res.status === 'valid') {
        state.feeds.push(url);
        watchedState.formState = 'valid';
      } else {
        state.errors = res.errors;
        watchedState.formState = 'invalid';
      }
    });
  });
};

export default app;
