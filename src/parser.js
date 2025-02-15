export default (rssXml, feedId) => {
  const parser = new DOMParser();
  const xmlDom = parser.parseFromString(rssXml, 'application/xml');
  const feedTitle = xmlDom.querySelector('title').textContent.trim();
  const feedDesc = xmlDom.querySelector('description').textContent.trim();
  const itemsDom = xmlDom.querySelectorAll('item');
  const posts = [];
  for (let i = 0; i < itemsDom.length; i += 1) {
    const id = `${feedId}${i}`;
    const title = itemsDom[i].querySelector('title').textContent.trim();
    const link = itemsDom[i].querySelector('link').textContent.trim();
    const desc = itemsDom[i].querySelector('description').textContent.trim();
    posts.push({
      id, title, link, feedId, desc,
    });
  }
  return { feed: { id: feedId, title: feedTitle, desc: feedDesc }, posts };
};
