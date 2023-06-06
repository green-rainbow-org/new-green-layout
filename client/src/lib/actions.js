import { toBasicPage } from 'formats';
import { sendBasicPage } from 'api';

const submitPage = async (root, content) => {
  const data = toBasicPage({
    content, name: 'page',
    published: false
  });
  return await sendBasicPage(root, data);
}

const toActions = (data) => {
  return {
    submitPage: () => {
      const { api_root, content } = data;
      return submitPage(api_root, content);
    }
  }
}

export { toActions }
