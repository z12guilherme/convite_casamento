<?php
// Recebe o nome do convidado via POST
$guestName = $_POST['name'] ?? 'Convidado';

// Nome do casal
$casal = "Marcos e Evellyn";

// Mensagem personalizada
$guestMessage = "Querido(a) $guestName, nós, $casal, ficaríamos muito felizes em contar com sua presença neste momento tão especial. Sua presença tornará nosso dia ainda mais memorável e cheio de alegria.";

// Caminho do arquivo final (nome seguro do convidado apenas)
$filenameSafe = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $guestName));
$htmlFile = "../invites/{$filenameSafe}.html";

// Carrega o template completo
$templateFile = '../templates/convidado_template.html';
if (!file_exists($templateFile)) {
    die(json_encode(['success' => false, 'mensagem' => 'Template de convite não encontrado!']));
}
$templateContent = file_get_contents($templateFile);

// Substitui os placeholders no template
$pageContent = str_replace(
    ['{{NOME_CONVIDADO}}', '{{NOME_CASAL}}', '{{MENSAGEM_CONVIDADO}}'],
    [$guestName, $casal, $guestMessage],
    $templateContent
);

// Cria a pasta invites se não existir
if (!is_dir('../invites')) {
    mkdir('../invites', 0755, true);
}

// Salva o arquivo final
file_put_contents($htmlFile, $pageContent);

// Atualiza o JSON de convidados
$dataFile = '../data/convidados.json';
$convidados = json_decode(file_get_contents($dataFile), true) ?: [];
$convidados[] = ['nome' => $guestName, 'arquivo' => "{$filenameSafe}.html"];
file_put_contents($dataFile, json_encode($convidados, JSON_PRETTY_PRINT));

// Retorna mensagem de sucesso em JSON
echo json_encode(['success' => true, 'mensagem' => "Convite de $guestName gerado com sucesso: {$filenameSafe}.html"]);
?>
