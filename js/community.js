/* ============================================================
   COMMUNITY.JS — Farmer Community posts (localStorage demo)
   FUTURE: replace with fetch(`${AGRI.api.base}/community/posts`)
   ============================================================ */
 
const MAX_POST_LENGTH = 500;
const MAX_COMMENT_LENGTH = 300;
 
/* ---------- helpers ---------- */
 
// Posts and comments are user-typed and inserted with innerHTML: escape them.
function commEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
 
// "just now", "5 min ago", "3 h ago", "2 d ago" (older seeded posts have no date)
function timeAgo(iso) {
  if (!iso) return '';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (isNaN(secs)) return '';
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
 
function currentUserId() {
  const u = AGRI.currentUser();
  return u ? (u.loginId || u.name) : null;
}
function currentUserName() {
  return AGRI.currentUser()?.name || 'You';
}
 
function loadPosts() {
  AGRI.seedIfEmpty(AGRI.KEYS.POSTS, AGRI.mock.posts);
  return AGRI.get(AGRI.KEYS.POSTS, []);
}
function savePosts(posts) { AGRI.set(AGRI.KEYS.POSTS, posts); }
 
// Match by author id; older posts without one fall back to the author name
function isMine(post) {
  return post.authorId ? post.authorId === currentUserId() : post.author === currentUserName();
}
 
/* ---------- rendering ---------- */
 
function renderPosts() {
  const list = document.getElementById('postsList');
  if (!list) return;
  const search = (document.getElementById('postSearch')?.value || '').trim().toLowerCase();
  const myId = currentUserId();
 
  const posts = loadPosts().filter(p =>
    String(p.text).toLowerCase().includes(search) ||
    String(p.author).toLowerCase().includes(search) ||
    String(p.village || '').toLowerCase().includes(search)
  );
 
  list.innerHTML = posts.slice().reverse().map(p => {
    const comments = p.comments || [];
    const liked = (p.likedBy || []).includes(myId);
    const when = timeAgo(p.createdAt);
    const meta = [p.village, when].filter(Boolean).map(commEsc).join(' · ');
 
    return `
    <div class="card" style="margin-bottom:16px;">
      <div class="flex-between flex-wrap gap-8">
        <div>
          <strong>${commEsc(p.author)}</strong>
          <p class="text-muted mb-0" style="font-size:0.85rem;">${meta}</p>
        </div>
        ${isMine(p) ? `<button class="btn btn-danger btn-sm btn-inline" onclick="deletePost('${p.id}')">Delete</button>` : ''}
      </div>
      <p style="margin:12px 0;">${commEsc(p.text)}</p>
      <div class="flex gap-16" style="align-items:center;">
        <button class="btn ${liked ? 'btn-primary' : 'btn-outline'} btn-sm btn-inline" onclick="likePost('${p.id}')" aria-pressed="${liked}">👍 ${p.likes || 0}</button>
        <span class="text-muted" style="font-size:0.9rem;">💬 ${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}</span>
      </div>
      <div style="margin-top:12px;border-top:1px solid var(--border-soft);padding-top:10px;">
        ${comments.map(c => `<p style="margin:6px 0;font-size:0.92rem;"><strong>${commEsc(c.author)}:</strong> ${commEsc(c.text)}</p>`).join('')}
        <form onsubmit="return submitComment(event, '${p.id}')" class="flex gap-8" style="margin-top:8px;">
          <input type="text" placeholder="Write a comment…" required maxlength="${MAX_COMMENT_LENGTH}" style="flex:1;min-width:0;" />
          <button class="btn btn-primary btn-sm btn-inline">Post</button>
        </form>
      </div>
    </div>`;
  }).join('') || `<div class="empty-state"><span class="emoji">💬</span><p>No posts found.</p></div>`;
}
 
/* ---------- actions ---------- */
 
// One like per person: pressing again removes it
function likePost(id) {
  const myId = currentUserId();
  if (!myId) { AGRI.toast('Please log in to like posts.', 'error'); return; }
 
  const posts = loadPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
 
  post.likedBy = post.likedBy || [];
  const idx = post.likedBy.indexOf(myId);
  if (idx === -1) {
    post.likedBy.push(myId);
    post.likes = (post.likes || 0) + 1;
  } else {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  }
  savePosts(posts);
  renderPosts();
}
 
function submitComment(e, id) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const text = input.value.trim().slice(0, MAX_COMMENT_LENGTH);
  if (!text) return false;
 
  const posts = loadPosts();
  const post = posts.find(p => p.id === id);
  if (!post) { AGRI.toast('This post no longer exists.', 'error'); renderPosts(); return false; }
 
  post.comments = post.comments || [];
  post.comments.push({ author: currentUserName(), text });
  savePosts(posts);
  renderPosts();
  return false;
}
 
function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  const posts = loadPosts();
  const post = posts.find(p => p.id === id);
  if (!post || !isMine(post)) { AGRI.toast('You can only delete your own posts.', 'error'); return; }
  savePosts(posts.filter(p => p.id !== id));
  renderPosts();
  AGRI.toast('Post deleted.');
}
 
function initCreatePost() {
  const form = document.getElementById('createPostForm');
  if (!form) return;
  const textarea = document.getElementById('postText');
  textarea.maxLength = MAX_POST_LENGTH;
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) { AGRI.toast('Please write something to share.', 'error'); return; }
 
    const posts = loadPosts();
    posts.push({
      id: 'po' + Date.now(),
      author: currentUserName(),
      authorId: currentUserId(),
      village: AGRI.get(AGRI.KEYS.PROFILE, {}).village || '',
      text: text.slice(0, MAX_POST_LENGTH),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
    savePosts(posts);
    textarea.value = '';
    renderPosts();
    AGRI.toast('Post shared with the community.');
  });
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('postsList')) return;
  AGRI.requireLogin();            // posting needs to know who you are
  renderPosts();
  initCreatePost();
  document.getElementById('postSearch')?.addEventListener('input', renderPosts);
});