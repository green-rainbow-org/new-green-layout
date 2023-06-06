const sendData = async (body, url, method) => {
  return await fetch(url, {
    method, cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const sendBasicPage = async (root, body) => {
  const url = root + "/api/basic_pages";
  if (body !== null) {
    await sendData(body, url, 'POST');
  }
  const response = await fetch(url);
  const out = await response.json();
  return out.results || [];
}

export { sendBasicPage };
