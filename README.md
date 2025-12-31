# 💍 Convite de Casamento | Evellyn & Guilherme

<p align="center">
  <img src="https://img.shields.io/badge/Tecnologia-HTML,_CSS,_JS-blue?style=for-the-badge&logo=javascript" alt="Tecnologia">
  <img src="https://img.shields.io/badge/Banco_de_Dados-Supabase-green?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Automação-Python-yellow?style=for-the-badge&logo=python" alt="Python">
</p>

<p align="center">
  Bem-vindo ao projeto do nosso convite de casamento! Uma solução completa e moderna para gerenciar convidados, compartilhar informações e, claro, celebrar o nosso grande dia.
</p>

---

## ✨ Funcionalidades Principais

-   🎨 **Convite Online Personalizado**: Uma página web (`invite.html`) que exibe o nome de cada convidado dinamicamente a partir da URL.
-   🔒 **Painel Administrativo**: Uma interface (`index.html`) protegida por senha para gerenciar a lista de convidados.
-   ☁️ **Banco de Dados Realtime**: Integração com **Supabase** para armazenar e sincronizar a lista de convidados na nuvem.
-   엑셀 **Importação/Exportação**: Adicione convidados em massa a partir de uma planilha Excel ou exporte a lista completa.
-   🤖 **Gerador de Convites em PDF**: Um script em Python que cria convites em PDF personalizados, com nome e um QR Code único para cada convidado.
-   🎁 **Dashboard de Presentes**: Uma página para visualizar a lista de presentes e as confirmações.

---

## 🚀 Como Usar o Site

### 🔑 Painel de Convidados

1.  Abra o arquivo `index.html` no seu navegador.
2.  Digite a senha de acesso para entrar no painel.
3.  **Adicione** um convidado pelo formulário, ou **importe** uma planilha `xlsx`.
4.  A lista de convidados será exibida, sincronizada com o banco de dados Supabase.
5.  Você pode **exportar** a lista completa para um arquivo Excel a qualquer momento.

### 💌 Convite Online

-   O convite online é acessado pela URL: `.../invite.html?name=Nome%20Do%20Convidado`.
-   O JavaScript na página pega o nome da URL e o exibe, criando uma experiência personalizada.

---

## 🤖 Gerador de Convites em PDF (Tutorial)

Esta é a funcionalidade para criar os convites físicos em PDF, cada um com um QR Code que leva ao convite online personalizado.

### Passo 1: Prepare o Ambiente

Certifique-se de que os seguintes arquivos estão dentro da pasta `gerar_convites/`:

-   `convidados.xlsx`: A planilha Excel com a lista de nomes dos convidados na primeira coluna.
-   `Convite_Template.pdf`: O arquivo PDF que serve como fundo/modelo do convite.
-   `byrani.ttf` e `Vera.ttf`: Os arquivos de fonte necessários para o script.

### Passo 2: Configure a URL do Site

-   Abra o arquivo `gerar_convites/gerar_convites.py`.
-   **Altere a variável `URL_BASE_DO_SITE`** para a URL principal do seu site (a que está no Netlify).

```python
# Mude esta linha!
URL_BASE_DO_SITE = "https://casamento-evellyn-e-guilherme.netlify.app"
```

### Passo 3: Instale as Dependências

-   Abra um terminal na pasta raiz do seu projeto (`convite_casamento`).
-   Execute o comando abaixo para instalar as bibliotecas Python necessárias:

```bash
pip install -r gerar_convites/requirements.txt
```

### Passo 4: Execute o Script

-   No mesmo terminal, execute o seguinte comando:

```bash
python gerar_convites/gerar_convites.py
```

-   O script irá ler cada nome, criar um convite em PDF com um QR Code exclusivo e salvá-lo na pasta `convites/`. Acompanhe o progresso no terminal!

Pronto! Seus convites em PDF estão gerados e prontos para serem enviados.

---

## 📁 Estrutura do Projeto

```
convite_casamento/
├── 📄 index.html              # Painel de gerenciamento de convidados
├── 💌 invite.html             # Página do convite online (dinâmico)
├── 🎨 css/                     # Arquivos de estilo
├── 💻 js/
│   ├── main.js               # Lógica do painel de admin
│   ├── invite.js             # Lógica do convite online
│   └── config.js             # Configurações do Supabase
├── 🤖 gerar_convites/
│   ├── gerar_convites.py     # O SCRIPT PRINCIPAL de geração de PDFs
│   ├── requirements.txt      # Dependências do Python
│   ├── convidados.xlsx       # (Você precisa criar) Lista de convidados
│   └── Convite_Template.pdf  # (Você precisa criar) Modelo do PDF
├── 📂 convites/                 # Onde os PDFs gerados são salvos
└── 📖 README.md                 # Este arquivo
```

<p align="center">
  <em>Desenvolvido com ❤️ para o casamento de Evellyn & Guilherme</em>
</p>