<?php
$dataFile = __DIR__ . '/../data/presentes_confirmados.json';
if(!file_exists($dataFile)) file_put_contents($dataFile, json_encode([]));

$input = json_decode(file_get_contents('php://input'), true);
$nome = $input['nome'] ?? $_POST['nome'] ?? '';
$presente = $input['presente'] ?? $_POST['presente'] ?? '';

if(!$nome || !$presente) {
    die("Dados incompletos.");
}

$presentes = json_decode(file_get_contents($dataFile), true);
$presentes[] = [
    'nome' => $nome,
    'presente' => $presente,
    'hora' => date('Y-m-d H:i:s')
];

file_put_contents($dataFile, json_encode($presentes, JSON_PRETTY_PRINT));

echo "Obrigado, $nome! Você confirmou o presente: $presente.";
?>
