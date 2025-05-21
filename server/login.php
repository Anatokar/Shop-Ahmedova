<?php
// Заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Ответ на preflight-запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Подключение к базе данных
$mysqli = new mysqli('localhost', 'root', 'a$cension', 'ugh');

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Получение данных
$data = json_decode(file_get_contents("php://input"), true);
$username = $mysqli->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Введите имя пользователя и пароль']);
    exit;
}

// Поиск пользователя
$query = $mysqli->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$query->bind_param("s", $username);
$query->execute();
$result = $query->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password_hash'])) {
        echo json_encode(['success' => true, 'message' => 'Успешный вход', 'username' => $username]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный пароль']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Пользователь не найден']);
}