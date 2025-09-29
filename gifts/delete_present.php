<?php
$dataFile = __DIR__ . '/../data/presentes_confirmados.json';

if (!file_exists($dataFile)) {
    die("Arquivo não encontrado.");
}

$nome = $_POST['nome'] ?? '';
$presente = $_POST['presente'] ?? '';

if (!$nome || !$presente) {
    die("Dados incompletos.");
}

$presentes = json_decode(file_get_contents($dataFile), true) ?: [];
$presentes = array_filter($presentes, function($item) use ($nome, $presente) {
    return !($item['nome'] === $nome && $item['presente'] === $presente);
});

file_put_contents($dataFile, json_encode(array_values($presentes), JSON_PRETTY_PRINT));

echo "Presente removido com sucesso.";
?>
