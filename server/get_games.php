<?php
// Заголовки CORS и кодировка
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Параметры подключения
$host = 'localhost';
$db   = 'ugh';
$user = 'root';
$pass = 'a$cension';

// Подключение к базе данных
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

$conn->set_charset("utf8mb4");

// SQL-запрос
$sql = "
    SELECT 
        g.name,
        g.type,
        g.description,
        g.image,
        GROUP_CONCAT(DISTINCT p.player_count ORDER BY p.player_count ASC) AS players
    FROM games g
    LEFT JOIN game_players p ON g.id = p.game_id
    GROUP BY g.id
";

$result = $conn->query($sql);

$games = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $games[] = [
            'name' => $row['name'],
            'players' => array_map('intval', explode(',', $row['players'] ?? '')),
            'type' => $row['type'],
            'description' => $row['description'],
            'image' => $row['image']
        ];
    }
    $result->free();
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка выполнения запроса']);
    $conn->close();
    exit;
}

$conn->close();

// Вывод JSON
echo json_encode($games, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>