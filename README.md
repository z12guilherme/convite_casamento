# 💍 Convite de Casamento - Marcos & Evellyn

![Wedding Invitation Banner](https://via.placeholder.com/800x200/fdf2f8/ec4899?text=Nosso+Casamento+%F0%9F%92%8D)

Bem-vindo ao sistema de gerenciamento de convites para o nosso casamento! Este projeto permite criar convites personalizados para convidados, gerenciar a lista de presentes e acompanhar confirmações de forma simples e elegante.

## 📋 Descrição

Um painel administrativo para:
- Adicionar e remover convidados.
- Gerar páginas HTML personalizadas para cada convidado.
- Gerenciar confirmações de presentes com dashboard em tempo real.

O sistema é construído com HTML, CSS e JavaScript puro, funcionando offline no navegador.

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
├── invite.html             # Página dinâmica para convites (carrega de localStorage)
├── css/
│   └── style.css           # Estilos globais
├── js/
│   └── main.js             # Lógica frontend (adicionar/remover convidados)
├── templates/
│   └── convidado_template.html  # Template com placeholders para convites
├── gifts/
│   ├── lista_presentes.html  # Lista de presentes com confirmação
│   └── dashboard.html     # Dashboard de confirmações
└── README.md              # Este arquivo
```

## 🚀 Como Executar

1. **Requisitos**:
   - Navegador web moderno (com suporte a localStorage).

2. **Instalação**:
   - Clone ou baixe o projeto.
   - Abra `index.html` diretamente no navegador (funciona offline).

3. **Acesso**:
   - Painel principal: `index.html`
   - Convites gerados: `invite.html?name=NomeDoConvidado`
   - Lista de presentes: `gifts/lista_presentes.html`
   - Dashboard: `gifts/dashboard.html`

## 📖 Como Usar

### 1. Gerenciar Convidados
- Abra `index.html`.
- Digite o nome do convidado e clique em "Adicionar Convidado".
- O convite é gerado dinamicamente e armazenado no navegador.
- Clique em "Ver Convite" para visualizar a página personalizada em `invite.html?name=NomeDoConvidado`.
- Use "Excluir" para remover.

### 2. Confirmação de Presentes
- Convidados acessam sua página em `invite.html?name=NomeDoConvidado` e clicam em "Confirmar Convite".
- São redirecionados para `gifts/lista_presentes.html`.
- Selecione um presente e confirme (armazenado no localStorage).
- Admin: Acesse `gifts/dashboard.html` para ver confirmações (atualiza a cada 5s).
- Exclua entradas indesejadas no dashboard.

### 3. Personalização
- Edite `templates/convidado_template.html` para alterar o design dos convites (use placeholders como `{{NOME_CONVIDADO}}`).
- Ajuste estilos em `css/style.css`.

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3 (Gradientes, Flexbox), JavaScript (localStorage, Canvas para desenhos).
- **Armazenamento**: localStorage (persistência no navegador).
- **Servidor**: Nenhum necessário (funciona offline).

## 📝 Notas

- **Persistência**: Dados são armazenados no localStorage do navegador. Limpe o cache para resetar.
- **Segurança**: Para produção, adicione validação/sanitização extra e considere um backend real.
- **Melhorias Sugeridas**: Autenticação para o painel, envio de e-mails com links, integração com WhatsApp.

Obrigado por usar nosso sistema! Se precisar de ajuda, entre em contato. 💕

*Desenvolvido com ❤️ para o casamento de Marcos & Evellyn*
