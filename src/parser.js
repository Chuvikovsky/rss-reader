export default (rssXml) => {
  const parser = new DOMParser();
  const xmlDom = parser.parseFromString(rssXml, 'application/xml');
  const feedTitle = xmlDom.querySelector('title').textContent.trim();
  const feedDesc = xmlDom.querySelector('description').textContent.trim();
  const itemsDom = xmlDom.querySelectorAll('item');

  const newItems = Array.from(itemsDom).map((item) => {
    const title = item.querySelector('title').textContent.trim();
    const link = item.querySelector('link').textContent.trim();
    const desc = item.querySelector('description').textContent.trim();
    return {
      title, link, desc,
    };
  });

  return {
    feed: {
      title: feedTitle, desc: feedDesc,
    },
    posts: newItems,
  };
};
