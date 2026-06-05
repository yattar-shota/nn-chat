'use strict'
const fs = require('node:fs');
const pug = require('pug')
const Cookies = require('cookies');
const { currentThemeKey } = require('../config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(
    `<!DOCTYPE html><html lang="ja">
        <body>
            <h1>ログアウトしました</h1>
            <a href="/">ログイン</a> </body>
    </html>`
  );
}

function handleChangeTheme(req, res) {
  const cookies = new Cookies(req, res);
  const currentTheme = (cookies.get(currentThemeKey) !== 'light' ? 'light' : 'dark');
  cookies.set(currentThemeKey, currentTheme);
  
  // Get the URL the user just came from, or default to the lobby '/'
  const redirectUrl = req.headers.referer || '/';

  res.writeHead(303, {
    'Location': redirectUrl
  });
  res.end();
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./public/style.css');
  res.end(file);
}

function handleNnChatJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/javascript',
  });
  const file = fs.readFileSync('./public/nn-chat.js');
  res.end(file);
}

async function handleTopPage(req, res) {
  let defaultRoom = await prisma.room.findFirst();
  if (!defaultRoom) {
    console.info('データベースが空です。デフォルトのルームを作成します...');
    await prisma.room.createMany({
      data: [
        { name: 'general', description: '雑談' },
        { name: 'data-science', description: 'データサイエンス' },
        { name: 'coding', description: 'プログラミング' },
        { name: 'math', description: '数学' }
      ]
    });
  }

  const rooms = await prisma.room.findMany({ orderBy: { id: 'asc' } });

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/top.pug', { rooms }));
}

function handleNotFound(req, res){
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/404.pug'));
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

module.exports = {
  handleLogout,
  handleChangeTheme,
  handleFavicon,
  handleStyleCssFile,
  handleNnChatJsFile,
  handleTopPage,
  handleNotFound,
  handleBadRequest,
};