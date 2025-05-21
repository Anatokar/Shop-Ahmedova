<?php
// Заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
$email = $mysqli->real_escape_string($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Заполните все поля']);
    exit;
}

// Проверка на существование пользователя
$query = $mysqli->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$query->bind_param("ss", $username, $email);
$query->execute();
$query->store_result();

if ($query->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Пользователь с таким именем или email уже существует']);
    exit;
}

// Хеширование и вставка
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$insert = $mysqli->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
$insert->bind_param("sss", $username, $email, $passwordHash);
$insert->execute();

echo json_encode(['success' => true, 'message' => 'Регистрация прошла успешно']);
