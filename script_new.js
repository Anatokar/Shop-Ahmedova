// Updated JavaScript to use a real backend API instead of localStorage and JSON

let gamesDatabase = [];
let authMode = 'login';
let currentUser = null;
let currentPage = 1;
const gamesPerPage = 10;

async function fetchGames() {
  try {
    const response = await fetch('/api/games');
    const data = await response.json();
    gamesDatabase = data;
    displayGames(gamesDatabase, currentPage);
    setupPagination(gamesDatabase);
  } catch (error) {
    console.error('Ошибка загрузки данных: ', error);
  }
}

fetchGames();

async function toggleFavorite(gameId) {
  if (!currentUser) {
    alert('Пожалуйста, войдите в систему.');
    return;
  }

  try {
    await fetch(`/api/favorites/${gameId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    fetchGames();
  } catch (error) {
    console.error('Ошибка обновления избранного:', error);
  }
}

async function displayFavorites() {
  try {
    const response = await fetch('/api/favorites');
    const favorites = await response.json();
    displayGames(favorites);
  } catch (error) {
    console.error('Ошибка загрузки избранных игр:', error);
  }
}

async function submitComment(event) {
  event.preventDefault();
  const commentText = document.getElementById('commentText').value.trim();
  const gameId = document.getElementById('gameDetailsTitle').dataset.gameId;

  if (!currentUser) {
    alert('Пожалуйста, войдите в систему, чтобы оставить комментарий.');
    return;
  }

  if (!commentText) {
    alert('Пожалуйста, введите текст комментария.');
    return;
  }

  try {
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, text: commentText })
    });
    displayComments(gameId);
  } catch (error) {
    console.error('Ошибка отправки комментария:', error);
  }
}

async function displayComments(gameId) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '';

  try {
    const response = await fetch(`/api/comments/${gameId}`);
    const comments = await response.json();

    if (comments.length === 0) {
      commentsList.innerHTML = '<p>Пока нет комментариев.</p>';
      return;
    }

    comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.classList.add('comment');

      const username = document.createElement('strong');
      username.textContent = comment.username + ': ';
      username.classList.add('comment-username');

      const text = document.createElement('span');
      text.textContent = comment.text;
      text.classList.add('comment-text');

      commentDiv.appendChild(username);
      commentDiv.appendChild(text);
      commentsList.appendChild(commentDiv);
    });
  } catch (error) {
    console.error('Ошибка загрузки комментариев:', error);
  }
}

async function submitAuthForm(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
    return;
  }

  try {
    const endpoint = authMode === 'register' ? '/api/register' : '/api/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      alert(`Добро пожаловать, ${currentUser.username}`);
      closeAuthModal();
      document.querySelector('.login-button').textContent = `Привет, ${currentUser.username}`;
    } else {
      alert(data.message || 'Ошибка авторизации.');
    }
  } catch (error) {
    console.error('Ошибка авторизации:', error);
  }
}
