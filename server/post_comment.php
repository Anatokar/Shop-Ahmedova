<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Обработка preflight-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Подключение к БД
$host = 'localhost';
$user = 'root';
$pass = 'a$cension';
$db   = 'ugh';

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// Получение данных
$data = json_decode(file_get_contents("php://input"), true);
$username = $conn->real_escape_string($data['username'] ?? '');
$gameName = $conn->real_escape_string($data['gameName'] ?? '');
$commentText = $conn->real_escape_string($data['commentText'] ?? '');

if (!$username || !$gameName || !$commentText) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверные входные данные']);
    exit;
}

// Получение user_id
$userQuery = $conn->prepare("SELECT id FROM users WHERE username = ?");
$userQuery->bind_param("s", $username);
$userQuery->execute();
$userResult = $userQuery->get_result();
if (!$userResult->num_rows) {
    echo json_encode(['error' => 'Пользователь не найден']);
    exit;
}
$userId = $userResult->fetch_assoc()['id'];

// Получение game_id
$gameQuery = $conn->prepare("SELECT id FROM games WHERE name = ?");
$gameQuery->bind_param("s", $gameName);
$gameQuery->execute();
$gameResult = $gameQuery->get_result();
if (!$gameResult->num_rows) {
    echo json_encode(['error' => 'Игра не найдена']);
    exit;
}
$gameId = $gameResult->fetch_assoc()['id'];

// Вставка комментария
$commentQuery = $conn->prepare("INSERT INTO comments (user_id, game_id, text) VALUES (?, ?, ?)");
$commentQuery->bind_param("iis", $userId, $gameId, $commentText);
if ($commentQuery->execute()) {
    echo json_encode(['success' => true, 'message' => 'Комментарий добавлен']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при сохранении комментария']);
}

$conn->close();
?>