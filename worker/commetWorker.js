//commentWorker.js

self.onmessage = async function (e) {
  const comment = e.data;
  const filteredPosts = posts.filter((post) => !post.user.private);
  const postIds = filteredPosts.map((post) => post._id);
  self.postMessage({ filteredPosts, postIds });
};
