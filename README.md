# 💍 Convite de Casamento - Marcos & Evellyn

![Wedding Invitation Banner](https://via.placeholder.com/800x200/fdf2f8/ec4899?text=Nosso+Casamento+%F0%9F%92%8D)

Bem-vindo ao sistema de gerenciamento de convites para o nosso casamento! Este projeto permite criar convites personalizados para convidados, gerenciar a lista de presentes e acompanhar confirmações de forma simples e elegante.

## 📋 Descrição

Um painel administrativo para:
- Adicionar e remover convidados.
- Gerar páginas HTML personalizadas para cada convidado.
- Gerenciar confirmações de presentes com dashboard em tempo real.

O sistema é construído com HTML, CSS, JavaScript e PHP, rodando em um servidor local simples.

## ✨ Funcionalidades

- **Gerenciamento de Convidados**: Adicione nomes e mensagens personalizadas via formulário. Cada convidado recebe uma página HTML única.
- **Geração Automática de Convites**: Usa templates para criar páginas bonitas com placeholders substituídos dinamicamente.
- **Lista de Presentes**: Convidados podem confirmar presentes via interface visual (com desenhos em canvas).
- **Dashboard de Confirmações**: Visualize confirmações em tempo real, com opção de excluir entradas.
- **Estrutura Organizada**: Pastas separadas para templates, convites gerados, gifts e dados.

## 📁 Estrutura do Projeto

```
ConviteCasamento/
├── index.html              # Painel principal de gerenciamento
├── css/
│   └── style.css           # Estilos globais
├── js/
│   └── main.js             # Lógica frontend (adicionar/remover convidados)
├── php/
│   ├── add_guest.php       # Adiciona convidado e gera HTML
│   └── delete_guest.php    # Remove convidado e arquivo HTML
├── data/
│   ├── convidados.json     # Lista de convidados
│   └── presentes_confirmados.json  # Confirmações de presentes
├── templates/
│   ├── convidado.html      # Template completo de convite
│   └── convidado_template.html  # Template simples com placeholders
├── invites/                # Páginas HTML geradas para convidados (ex: dani.html)
├── gifts/
│   ├── lista_presentes.html  # Lista de presentes com confirmação
│   ├── dashboard.html     # Dashboard de confirmações
│   ├── confirm_present.php # Confirma presente via POST
│   └── delete_present.php # Remove confirmação
└── README.md              # Este arquivo
```

## 🚀 Como Executar

1. **Requisitos**:
   - PHP 7+ (para servidor local e scripts).
   - Navegador web moderno.

2. **Instalação**:
   - Clone ou baixe o projeto.
   - Certifique-se de que as pastas `data/`, `templates/`, `invites/` e `gifts/` existam (criadas automaticamente).

3. **Rodar o Servidor**:
   ```bash
   php -S localhost:8000
   ```
   Acesse [http://localhost:8000](http://localhost:8000) no navegador.

4. **Inicializar Dados** (opcional):
   - Crie `data/convidados.json` vazio: `[]`
   - Crie `data/presentes_confirmados.json` vazio: `[]`

## 📖 Como Usar

### 1. Gerenciar Convidados
- Abra `index.html`.
- Digite o nome do convidado e clique em "Adicionar Convidado".
- A página HTML é gerada em `invites/` e adicionada ao JSON.
- Clique em "Ver Convite" para visualizar a página personalizada.
- Use "Excluir" para remover.

### 2. Confirmação de Presentes
- Convidados acessam sua página em `invites/` e clicam em "Confirmar Convite".
- São redirecionados para `gifts/lista_presentes.html`.
- Selecione um presente e confirme (envia POST para `confirm_present.php`).
- Admin: Acesse `gifts/dashboard.html` para ver confirmações (atualiza a cada 5s).
- Exclua entradas indesejadas no dashboard.

### 3. Personalização
- Edite `templates/convidado_template.html` para alterar o design dos convites (use placeholders como `{{NOME_CONVIDADO}}`).
- Modifique mensagens em `php/add_guest.php`.
- Ajuste estilos em `css/style.css`.

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3 (Gradientes, Flexbox), JavaScript (Fetch API, Canvas para desenhos).
- **Backend**: PHP (Manipulação de arquivos/JSON).
- **Armazenamento**: JSON files (simples, sem banco de dados).
- **Servidor**: PHP Built-in Server.

## 📝 Notas

- **Segurança**: Para produção, adicione validação/sanitização extra e use um banco de dados real (ex: MySQL).
- **Melhorias Sugeridas**: Autenticação para o painel, envio de e-mails com links, integração com WhatsApp.
- **Problemas?**: Verifique permissões de escrita nas pastas `invites/` e `data/`.

Obrigado por usar nosso sistema! Se precisar de ajuda, entre em contato. 💕

*Desenvolvido com ❤️ para o casamento de Marcos & Evellyn*
