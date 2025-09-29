<?php
// Caminho do JSON e da pasta convites
$dataFile = __DIR__ . '/../data/convidados.json';
$convitesDir = __DIR__ . '/../invites/';

// Recebe o nome do convidado
$guestName = trim($_POST['nome'] ?? '');
if (!$guestName) {
    die("Nome do convidado não fornecido.");
}

// Nome do casal (igual ao add_guest.php)
$casal = "Marcos e Evellyn";

// Cria o nome do arquivo HTML do mesmo jeito que add_guest.php
$filenameSafe = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $guestName));
$htmlFile = $convitesDir . $filenameSafe . '.html';

// Atualiza JSON
$convidados = json_decode(file_get_contents($dataFile), true) ?: [];
$convidados = array_filter($convidados, function($c) use ($guestName) {
    return $c['nome'] !== $guestName;
});
file_put_contents($dataFile, json_encode(array_values($convidados), JSON_PRETTY_PRINT));

// Remove página HTML, se existir
if (file_exists($htmlFile)) {
    if (unlink($htmlFile)) {
        echo "Convidado {$guestName} removido e página {$filenameSafe}.html excluída.";
    } else {
        echo "Convidado {$guestName} removido, mas não foi possível excluir a página.";
    }
} else {
    echo "Convidado {$guestName} removido. Arquivo {$filenameSafe}.html não encontrado.";
}
?>
