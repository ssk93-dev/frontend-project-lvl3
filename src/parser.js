import _ from 'lodash';

const itemParse = (item, source) => {
  const itemTitle = item.querySelector('title');
  const itemDescription = item.querySelector('description');
  const itemLink = item.querySelector('link');
  const itemGuId = item.querySelector('guid');
  return {
    title: itemTitle.textContent,
    description: itemDescription.textContent,
    link: itemLink.textContent,
    guid: itemGuId.textContent,
    id: _.uniqueId(),
    source,
  };
};

export default (data, source) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.data.contents, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    const parseError = new Error(error.textContent);
    parseError.parsingError = true;
    throw parseError;
  }
  const title = doc.querySelector('channel > title');
  const description = doc.querySelector('channel > description');
  const items = doc.querySelectorAll('channel > item');
  const parsedItems = Array.from(items).map((item) => itemParse(item, source));
  return {
    channel: {
      source,
      title: title.textContent,
      description: description.textContent,
    },
    items: parsedItems,
  };
};
