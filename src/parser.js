const parseItem = (item) => {
  const itemTitle = item.querySelector('title');
  const itemDescription = item.querySelector('description');
  const itemLink = item.querySelector('link');
  return {
    title: itemTitle.textContent,
    description: itemDescription.textContent,
    link: itemLink.textContent,
  };
};

export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    const parseError = new Error(error.textContent);
    parseError.isParsingError = true;
    throw parseError;
  }
  const title = doc.querySelector('channel > title');
  const description = doc.querySelector('channel > description');
  const items = doc.querySelectorAll('channel > item');
  const parsedItems = Array.from(items).map((item) => parseItem(item));
  return {
    title: title.textContent,
    description: description.textContent,
    items: parsedItems,
  };
};
