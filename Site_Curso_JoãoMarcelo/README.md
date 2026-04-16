# 🎓 FormaPro - Plataforma de Cursos Online (LAB03)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) 
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white) 
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

**FormaPro** é uma aplicação front-end totalmente interativa e funcional desenvolvida como parte do projeto avaliativo (LAB03) da faculdade. A plataforma simula um ecossistema completo de Ensino a Distância (EAD), indo desde o cadastro de disciplinas até a vitrine de compras simuladas.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído **sem o uso de frameworks engessados**, focando na aplicação pura de lógica e conceitos arquiteturais, contando apenas com bibliotecas de UI:

- **Vanilla JavaScript (ES6+)**: Abordagem puramente nativa utilizando Classes, escopo e manipuladores de DOM.
- **Arquitetura MVC Modular (`type="module"`)**: Divisão cirúrgica do projeto em pastas físicas de `model/`, `view/` (representadas pelos forms HTML) e `controller/`.
- **LocalStorage API**: Simulação de um Banco de Dados Relacional diretamente no navegador usando uma Service Singleton encapsulada.
- **Bootstrap 5 & FontAwesome (BIs)**: Para componentes dinâmicos, modais, grid layout, formulários e ícones premium.

---

## 🛠 Funcionalidades e Módulos Implementados

### 1. Painel Administrativo (Gestão de Conteúdo e Financeiro)
Acesso restrito para administradores controlarem totalmente a plataforma.
- **Dashboard Global**: Sumário das métricas (Total de Alunos, Cursos, Aulas).
- **Módulo Acadêmico**: Inserção simulada (CRUD) rigoroso das categorias que organizam a escola, bem como o modelo de dados de um "Curso" que une horas, professor e nível.
- **Gestão de Alunos**: Área de cadastro manual de novos discentes com os seus respectivos e-mails e listagens interativas.
- **Módulo Financeiro (Checkout)**: Controle de catálogos de Planos de Assinatura (Mensal, Semestral, Anual) que geram faturas únicas num fluxo de checkout complexo e validado.

### 2. Painel do Aluno (Área de Membros e Trilhas)
A interface personalizada baseada na conta de estudante.
- **Vitrine Personalizada**: Possibilidade de visualizar novos cursos abertos à inscrição e dar *Match* num clique.
- **Player de Vídeos e Aulas**: Modal interativo injetado via JS que reproduz um layout de um reprodutor de vídeo para cada aula indexada naquele curso.
- **Sistema de Avaliações**: Os estudantes podem dar notas de (1 a 5) em qualquer curso da plataforma e deixar reviews escritos que ficam eternizados no LocalStorage e visíveis para os outros alunos.

### 3. Sistema de Auth Guard Dinâmico
- Implementação realística de Sessão (`sessionStorage`), impedindo um usuário normal de invadir a aba financeira usando a URL, além de rotear de maneira inteligente dependendo da aba onde o login se concretizar.

---

## 💻 Como Rodar o Projeto (Ambiente Local)

Como o projeto faz uso integral de **Módulos ES6** nativos de browser (todos importados em extensão `.mjs`), as políticas da web (CORS) bloqueiam a execução de módulos abertos fisicamente pelo caminho `file:///C:/...`. É estritamente necessário ter um servidor de tráfego HTTP.

1. Clone o repositório na sua máquina via Git:
   ```bash
   git clone https://github.com/joaoxddx/FormaPro.git
   ```
2. Abra a pasta do projeto em uma IDE moderna como o **Visual Studio Code**.
3. Instale a extensão do VS Code chamada **Live Server** (do autor Ritwick Dey).
4. Localize o arquivo `vitrine_publica.html` (ou o `login.html`), clique com o botão direito nele e escolha **"Open with Live Server"**.

### Credenciais de Teste
A plataforma fará uma carga inicial (mock) com alguns usuários no seu LocalStorage na primeira vez que ela for aberta. Use para acessar:

| Acesso | E-mail | Senha |
| --- | --- | --- |
| **Administrador** | `admin@formapro.com` | 123456 |
| **Usuário/Aluno** | `aluno@formapro.com` | 123456 |

---

## 📁 Estrutura de Diretórios
```text
📦 FormaPro
 ┣ 📂 css
 ┃ ┗ 📜 style.css (Extensões customizadas do Bootstrap)
 ┣ 📂 controller
 ┃ ┣ 📜 AcademicoController.mjs
 ┃ ┣ 📜 AlunoController.mjs
 ┃ ┗ 📜 ... 
 ┣ 📂 model
 ┃ ┣ 📜 Assinatura.mjs
 ┃ ┣ 📜 Avaliacao.mjs
 ┃ ┗ 📜 ... (As 14 Entidades do Lab)
 ┣ 📂 service
 ┃ ┗ 📜 StorageService.mjs (Responsável pelo Banco de Dados da Memória)
 ┣ 📜 index.html (Dashboard Admin)
 ┣ 📜 academico.html
 ┣ 📜 login.html
 ┣ 📜 home_aluno.html
 ┗ 📜 vitrine_publica.html
```

---
*Desenvolvido como atividade prática acadêmica.*
*Construção de Sistemas Front-End Modernos.*
