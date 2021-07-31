import onChange from 'on-change';

const renderForm = (state) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  if (document.querySelector('.feedback')) {
    document.querySelector('.feedback').remove();
  }
  if (state.formState === 'invalid') {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
    feedback.textContent = state.errors;
    form.parentNode.appendChild(feedback);
    input.classList.add('is-invalid');
  }
  if (state.formState === 'valid') {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success');
    form.reset();
    feedback.textContent = 'Success';
    form.parentNode.appendChild(feedback);
    input.classList.remove('is-invalid');
  }
};

const watch = (state) => onChange(state, (path) => {
  switch (path) {
    case 'formState': {
      renderForm(state);
      break;
    }
    default:
      break;
  }
});

export default watch;
