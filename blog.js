// blog.js - Core blog functionality

// Fetch and parse the post index
async function loadPostIndex() {
  try {
    const response = await fetch('./posts/index.json');
    const data = await response.json();
    return data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error loading post index:', error);
    return [];
  }
}

// Fetch markdown content
async function loadPost(filename) {
  try {
    const response = await fetch(`./posts/${filename}`);
    return await response.text();
  } catch (error) {
    console.error('Error loading post:', error);
    return '';
  }
}

// Render blog post list on home page
async function renderBlogList(limit = 5) {
  const posts = await loadPostIndex();
  const container = document.getElementById('blog-list');

  if (!container) {
    return;
  }

  if (posts.length === 0) {
    container.innerHTML = '<p class="no-posts">no posts yet. check back soon!</p>';
    return;
  }

  posts.slice(0, limit).forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post-preview';
    postElement.innerHTML = `
      <h3><a href="/blog#${post.id}" class="blog-link">${post.title}</a></h3>
      <p class="date">${formatDate(post.date)}</p>
      <p class="summary">${post.summary}</p>
    `;
    container.appendChild(postElement);
  });
}

// Render full blog post on /blog
async function renderBlogPost() {
  const postId = window.location.hash.substring(1);
  if (!postId) {
    showPostList();
    return;
  }

  const posts = await loadPostIndex();
  const post = posts.find(p => p.id === postId);

  if (!post) {
    document.getElementById('blog-content').innerHTML = `
      <div class="blog-post">
        <h1>Post not found</h1>
        <p>The post you're looking for doesn't exist.</p>
        <a href="/" class="back-link">← back to home</a>
      </div>
    `;
    return;
  }

  const markdown = await loadPost(post.file);
  const html = marked.parse(markdown);

  document.getElementById('blog-content').innerHTML = `
    <div class="blog-post">
      <h1>${post.title}</h1>
      <p class="date">${formatDate(post.date)}</p>
      <div class="post-content">${html}</div>
      <a href="/" class="back-link">← back to home</a>
    </div>
  `;
}

// Show all posts on /blog when no hash
async function showPostList() {
  const posts = await loadPostIndex();
  const container = document.getElementById('blog-content');

  if (!container) {
    return;
  }

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="blog-post">
        <p class="no-posts">no posts yet. check back soon!</p>
        <a href="/" class="back-link">← back to home</a>
      </div>
    `;
    return;
  }

  let html = '<div class="blog-list">';
  posts.forEach(post => {
    html += `
      <div class="blog-post-preview">
        <h3><a href="/blog#${post.id}" class="blog-link">${post.title}</a></h3>
        <p class="date">${formatDate(post.date)}</p>
        <p class="summary">${post.summary}</p>
      </div>
    `;
  });
  html += '</div><a href="/" class="back-link">← back to home</a>';
  container.innerHTML = html;
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
