const toBasicPage = (data) => {
  const { content, name } = data;
  const status = [
    "unlisted", "published"
  ][+data?.published];
  const basic_page = {
    content, name, status
  };
  return {
    basic_page
  };
}

export { toBasicPage };
