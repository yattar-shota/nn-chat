'use strict';
const postsHandler = require('./posts-handler');
const util = require('./handler-util');

function route(req, res) {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] ==='http') {
    util.handleNotFound(req, res);
  }

  // 1. Check if the URL matches the dynamic pattern /<roomName>/posts
  const postsMatch = req.url.match(/^\/([^/]+)\/posts$/);

  if (postsMatch) {
    req.roomName = decodeURIComponent(postsMatch[1]);
    postsHandler.handle(req, res);
    return;
  }

  // 2. Exact matches for everything else
  switch (req.url) {
    case '/posts/delete':
      postsHandler.handleDelete(req, res);
      break;
    case '/logout':
      util.handleLogout(req, res);
      break;
    case '/changeTheme':
      util.handleChangeTheme(req, res);
      break;
    case '/favicon.ico':
      util.handleFavicon(req, res);
      break;
    case '/style.css':
      util.handleStyleCssFile(req, res);
      break;
    case '/nn-chat.js':
      util.handleNnChatJsFile(req, res);
      break;
    case '/':
      util.handleTopPage(req, res);
      break;
    default:
      util.handleNotFound(req, res);
      break;
  }
}

module.exports = {
  route
};