let gamesDatabase = [];
let authMode = 'login';
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
let comments = JSON.parse(localStorage.getItem('comments')) || {};
let currentPage = 1;
const gamesPerPage = 10;

let notificationCheckInterval;
let currentUser = null;

fetch('http://localhost:80/get_games.php')
  .then(response => response.json())
  .then(data => {
    gamesDatabase = data;
    displayGames(gamesDatabase, currentPage);
    setupPagination(gamesDatabase);
  })
  .catch(error => {
    console.error('Ошибка загрузки данных: ', error);
  });

function showTab(tabId) {
  const tabs = ['mainContent', 'favoritesContent', 'aboutContent', 'gameDetailsContent'];
  tabs.forEach(tab => {
    const element = document.getElementById(tab);
    if (tab === tabId) {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
}

function submitSupportForm(event) {
  event.preventDefault();
  const name = document.getElementById('supportName').value.trim();
  const email = document.getElementById('supportEmail').value.trim();
  const message = document.getElementById('supportMessage').value.trim();

  if (!name || !email || !message) {
    alert('Пожалуйста, заполните все поля.');
    return;
  }

  alert('Ваше сообщение отправлено! Спасибо за обратную связь.');
  document.getElementById('supportForm').reset();
}

function findGames() {
  const playerCount = document.getElementById('playerCount').value;
  const gameType = document.getElementById('gameType').value;

  let filteredGames = gamesDatabase;

  if (playerCount) {
    filteredGames = filteredGames.filter(game => game.players.includes(Number(playerCount)));
  }

  if (gameType) {
    filteredGames = filteredGames.filter(game => game.type === gameType);
  }

  displayGames(filteredGames);
  setupPagination(filteredGames);
}

function searchGames() {
  const query = document.getElementById('searchBar').value.toLowerCase();
  const filteredGames = gamesDatabase.filter(game =>
    game.name.toLowerCase().includes(query)
  );

  displayGames(filteredGames);
  setupPagination(filteredGames);
}

function displayGames(games, page = 1) {
  const gamesList = document.getElementById('gamesList');
  gamesList.innerHTML = '';

  const startIndex = (page - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  if (paginatedGames.length === 0) {
    gamesList.innerHTML =
      '<li class="list-group-item">Извините, игры не найдены по выбранным параметрам.</li>';
  } else {
    paginatedGames.forEach((game) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'game-item');

      const name = document.createElement('h3');
      name.textContent = game.name;
      name.classList.add('game-name');

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('game-image-container');

      const img = document.createElement('img');
      img.src = game.image;
      img.alt = game.name;
      img.classList.add('game-image');

      imageContainer.appendChild(img);

      const favoriteIcon = document.createElement('i');
      favoriteIcon.classList.add('fas', 'fa-star', 'favorite-icon');
      if (favorites[game.id]) {
        favoriteIcon.classList.add('favorited');
      }
      favoriteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(game.name);
      });

      li.appendChild(name);
      li.appendChild(imageContainer);
      li.appendChild(favoriteIcon);

      li.addEventListener('click', () => showGameDetails(game));

      gamesList.appendChild(li);
    });
  }
}

function setupPagination(games) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(games.length / gamesPerPage);

  // Кнопка "Назад"
  const prevButton = document.createElement('li');
  prevButton.classList.add('page-item');
  prevButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(-1)">&laquo;</a>`;
  pagination.appendChild(prevButton);

  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    if (i === currentPage) {
      pageItem.classList.add('active');
    }
    pageItem.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
    pagination.appendChild(pageItem);
  }

  // Кнопка "Вперед"
  const nextButton = document.createElement('li');
  nextButton.classList.add('page-item');
  nextButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(0)">&raquo;</a>`;
  pagination.appendChild(nextButton);
}

function changePage(page) {

  const scrollPosition = window.scrollY;
  const totalPages = Math.ceil(gamesDatabase.length / gamesPerPage);

  if (page === -1) {
    // Переход на предыдущую страницу
    if (currentPage > 1) {
      currentPage--;
    }
  } else if (page === 0) {
    // Переход на следующую страницу
    if (currentPage < totalPages) {
      currentPage++;
    }
  } else {
    // Переход на конкретную страницу
    currentPage = page;
  }

  // Обновляем отображение игр и пагинации
  displayGames(gamesDatabase, currentPage);
  setupPagination(gamesDatabase);

  window.scrollTo(0, scrollPosition);
}



function toggleFavorite(gameName) {
  if (favorites[gameName]) {
    delete favorites[gameName];
  } else {
    favorites[gameName] = true;
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayGames(gamesDatabase);
  displayFavorites();
}

function showFavorites() {
  const mainContent = document.getElementById('mainContent');
  const favoritesContent = document.getElementById('favoritesContent');

  mainContent.style.display = 'none';
  favoritesContent.style.display = 'block';

  displayFavorites();
}

function displayFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';

  const favoriteGames = gamesDatabase.filter(game => favorites[game.name]);

  if (favoriteGames.length === 0) {
    favoritesList.innerHTML =
      '<li class="list-group-item">У вас пока нет избранных игр.</li>';
  } else {
    favoriteGames.forEach((game) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'game-item');

      const name = document.createElement('h3');
      name.textContent = game.name;
      name.classList.add('game-name');

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('game-image-container');

      const img = document.createElement('img');
      img.src = game.image;
      img.alt = game.name;
      img.classList.add('game-image');

      imageContainer.appendChild(img);

      const favoriteIcon = document.createElement('i');
      favoriteIcon.classList.add('fas', 'fa-star', 'favorite-icon', 'favorited');
      favoriteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(game.name);
      });

      li.appendChild(name);
      li.appendChild(imageContainer);
      li.appendChild(favoriteIcon);

      li.addEventListener('click', () => showGameDetails(game));

      favoritesList.appendChild(li);
    });
  }
}

function showGameDetails(game) {
  const gameDetailsContent = document.getElementById('gameDetailsContent');
  const gameDetailsTitle = document.getElementById('gameDetailsTitle');
  const gameDetailsImage = document.getElementById('gameDetailsImage');
  const gameDetailsDescription = document.getElementById('gameDetailsDescription');

  gameDetailsTitle.textContent = game.name;
  gameDetailsImage.src = game.image;
  gameDetailsImage.alt = game.name;
  gameDetailsDescription.textContent = game.description;

  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('favoritesContent').style.display = 'none';
  document.getElementById('aboutContent').style.display = 'none';
  gameDetailsContent.style.display = 'block';

  // Загружаем и отображаем комментарии с сервера
  loadComments(game.name);
}

// Загрузка комментариев с сервера и обновление локального объекта + отображение
function loadComments(gameName) {
  fetch('http://localhost/get_comments.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_name: gameName })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Обновляем локальные комментарии для игры
      comments[gameName] = data.comments;
      localStorage.setItem('comments', JSON.stringify(comments));
      displayComments(gameName);
    } else {
      console.error('Ошибка загрузки комментариев:', data.error);
    }
  })
  .catch(error => {
    console.error('Ошибка при запросе комментариев:', error);
  });
}

// Отправка нового комментария на сервер
function submitComment(event) {
  event.preventDefault();

  const username = document.querySelector('.login-button').textContent.replace('Привет, ', '');
  const commentText = document.getElementById('commentText').value.trim();
  const gameName = document.getElementById('gameDetailsTitle').textContent;

  if (!username || username === 'Войти') {
    alert('Пожалуйста, войдите в систему, чтобы оставить комментарий.');
    return;
  }

  if (!commentText) {
    alert('Пожалуйста, введите текст комментария.');
    return;
  }

  fetch('http://localhost/post_comment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, gameName, commentText })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Обновляем локальные комментарии и сохраняем
      comments[gameName] = data.comments;
      localStorage.setItem('comments', JSON.stringify(comments));

      // Очищаем поле и отображаем комментарии
      document.getElementById('commentText').value = '';
      displayComments(gameName);
    } else {
      alert(data.error || 'Ошибка при отправке комментария');
    }
  })
  .catch(() => {
    alert('Ошибка сети');
  });
}

// Отображение комментариев из локального объекта comments
function displayComments(gameName) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '';

  if (comments[gameName] && comments[gameName].length > 0) {
    comments[gameName].forEach(comment => {
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
  } else {
    commentsList.innerHTML = '<p>Пока нет комментариев.</p>';
  }
}

function hideGameDetails() {
  const gameDetailsContent = document.getElementById('gameDetailsContent');

  gameDetailsContent.style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
}

function login() {
  openAuthModal();
}

function openAuthModal() {
  const authModal = new bootstrap.Modal(document.getElementById('authModal'));
  authModal.show();
}

function closeAuthModal() {
  const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
  if (authModal) {
    authModal.hide();
  }
}

function toggleAuthMode() {
  const authTitle = document.getElementById('authTitle');
  const authSubmitButton = document.getElementById('authSubmitButton');
  const toggleAuth = document.getElementById('toggleAuth');

  if (authMode === 'login') {
    authMode = 'register';
    authTitle.textContent = 'Регистрация';
    authSubmitButton.textContent = 'Зарегистрироваться';
    toggleAuth.textContent = 'Уже есть аккаунт? Войти';
  } else {
    authMode = 'login';
    authTitle.textContent = 'Вход';
    authSubmitButton.textContent = 'Войти';
    toggleAuth.textContent = 'Нет аккаунта? Зарегистрируйтесь';
  }
}

function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
  if (!usernameRegex.test(username)) {
    alert(
      'Никнейм должен быть длиной от 3 до 15 символов и содержать только буквы, цифры и подчёркивания.'
    );
    return false;
  }
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Пожалуйста, введите корректный email.');
    return false;
  }
  return true;
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/;
  if (!passwordRegex.test(password)) {
    alert(
      'Пароль должен быть длиной от 6 до 20 символов и содержать хотя бы одну букву и одну цифру.'
    );
    return false;
  }
  return true;
}

function submitAuthForm(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
    return;
  }

  if (authMode === 'register') {
    registerUser(username, email, password);
  } else {
    loginUser(username, password);
  }
}

// Изменяем функцию loginUser
async function loginUser(username, password) {
  try {
    const res = await fetch('http://localhost/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');

    currentUser = data.username;
    document.querySelector('.login-button').textContent = `Привет, ${data.username}`;
    closeAuthModal();
    
    // Запускаем проверку уведомлений
    startNotificationCheck();
    checkNotifications();
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// Изменяем функцию registerUser
async function registerUser(username, email, password) {
  try {
    const res = await fetch('http://localhost/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');

    toggleAuthMode(); // переключить форму на вход
    showNotification('Регистрация прошла успешно. Теперь вы можете войти.', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

// Добавляем новые функции для работы с уведомлениями
function startNotificationCheck() {
  // Проверяем уведомления каждые 30 секунд
  notificationCheckInterval = setInterval(checkNotifications, 30000);
}

async function checkNotifications() {
  if (!currentUser) return;

  try {
    const response = await fetch('http://localhost/get_notifications.php');
    const data = await response.json();
    
    if (data.success && data.notifications.length > 0) {
      data.notifications.forEach(notification => {
        showNotification(notification.message, 'info');
        markNotificationAsRead(notification.id);
      });
    }
  } catch (error) {
    console.error('Ошибка при проверке уведомлений:', error);
  }
}

function markNotificationAsRead(notificationId) {
  fetch('http://localhost/mark_notification_read.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: notificationId })
  }).catch(error => console.error('Ошибка при отметке уведомления:', error));
}

// Функция для показа уведомлений в модальном окне
function showNotification(message, type = 'info') {
  const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
  const notificationContent = document.getElementById('notificationContent');
  
  // Очищаем предыдущие классы
  notificationContent.className = 'modal-content';
  // Добавляем класс в зависимости от типа уведомления
  notificationContent.classList.add(`notification-${type}`);
  
  document.getElementById('notificationMessage').textContent = message;
  notificationModal.show();
}
