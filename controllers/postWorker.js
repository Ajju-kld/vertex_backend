import {parentPort, workerData} from 'worker_threads';



const filtration = async function (e) {
  const posts = e.data;
  const filteredPosts = posts.filter((post) => !post.user.private);
  const postIds = filteredPosts.map((post) => post._id);
  return ({ filteredPosts, postIds });
};

filtration(workerData).then((result) => {
  parentPort.postMessage(result);
});
