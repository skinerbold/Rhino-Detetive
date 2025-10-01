# 🔍 Hidden Object Game

Um jogo interativo de "objetos escondidos" com sistema de ranking online, desenvolvido em HTML5 Canvas e JavaScript puro.

## 📋 Características

- ✨ **6 fases diferentes** com imagens personalizáveis
- 🎯 **Sistema de detecção de cliques** com feedback visual (X vermelho)
- ⏱️ **Cronômetro** para medir o tempo total de jogo
- 🏆 **Ranking online** com Firebase Firestore
- 🗺️ **Modo de mapeamento** para criar novos níveis sem programar
- 📱 **Design responsivo** e interface moderna
- 💾 **Fallback local** quando Firebase não está configurado

## 🚀 Como Usar

### 1. Configuração Básica (Local)

1. **Clone ou baixe** este repositório
2. As imagens devem estar nomeadas como: `screen01.png`, `screen02.png`, ..., `screen06.png`
3. Abra o arquivo `index.html` em um navegador moderno
4. O jogo funcionará com ranking local (localStorage)

### 2. Modo de Mapeamento

Para criar ou editar as áreas clicáveis dos objetos:

1. Clique em **"Modo Mapeamento"**
2. Selecione a fase desejada
3. Digite um ID para o objeto (ex: "bola", "estrela")
4. Clique em **"Iniciar Mapeamento"**
5. Siga as instruções na tela:
   - **Primeiro**: Clique nos cantos do objeto na CENA (superior esquerdo → inferior direito)
   - **Depois**: Clique nos cantos do objeto na BORDA (superior esquerdo → inferior direito)
6. Clique em **"Exportar JSON"** para salvar o arquivo `faseX.json`
7. Coloque o arquivo JSON na pasta do jogo

#### Estrutura do JSON

```json
{
  "fase": 1,
  "imagem": "screen01.png",
  "objetos": [
    {
      "id": "objeto1",
      "cena": {
        "x": 100,
        "y": 200,
        "width": 50,
        "height": 80
      },
      "borda": {
        "x": 30,
        "y": 500,
        "width": 40,
        "height": 40
      }
    }
  ]
}
```

### 3. Jogando

1. Clique em **"Modo Jogo"**
2. Encontre os objetos clicando nas áreas corretas da cena
3. Cada acerto marca um X vermelho na cena e na borda
4. Complete todas as 6 fases o mais rápido possível
5. Digite seu nome para salvar no ranking

## 🔥 Configuração do Firebase (Ranking Online)

Para habilitar o ranking online:

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Dê um nome ao projeto (ex: "hidden-object-game")
4. Siga os passos de criação

### Passo 2: Configurar Firestore

1. No menu lateral, vá em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo **"Produção"** ou **"Teste"**
4. Selecione a localização (ex: southamerica-east1)

### Passo 3: Configurar Regras do Firestore

No Firestore, vá em **"Regras"** e use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ranking/{document} {
      // Permitir leitura para todos
      allow read: if true;
      // Permitir escrita apenas com validação
      allow create: if request.resource.data.keys().hasAll(['nome', 'tempo', 'data'])
                    && request.resource.data.nome is string
                    && request.resource.data.nome.size() > 0
                    && request.resource.data.nome.size() <= 20
                    && request.resource.data.tempo is number
                    && request.resource.data.tempo > 0;
    }
  }
}
```

### Passo 4: Obter Credenciais

1. Vá em **"Configurações do Projeto"** (ícone de engrenagem)
2. Role até **"Seus aplicativos"**
3. Clique no ícone **"Web"** (`</>`)
4. Registre seu app (ex: "Hidden Object Web")
5. Copie as credenciais do Firebase Config

### Passo 5: Configurar no Código

Abra o arquivo `ranking.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### Passo 6: Criar Índice (Opcional)

Se aparecer erro de índice, o Firebase mostrará um link. Clique nele para criar o índice automaticamente.

## 🌐 Hospedagem Online

### Opção 1: Vercel (Recomendado)

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Na pasta do projeto, execute:
```bash
vercel
```

3. Siga as instruções no terminal
4. Seu jogo estará online em segundos!

**OU use a interface web:**
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório ou faça upload dos arquivos
5. Deploy automático!

### Opção 2: Netlify

1. Acesse [netlify.com](https://www.netlify.com/)
2. Faça login
3. Arraste a pasta do jogo para a área de deploy
4. Pronto! URL gerada automaticamente

**OU via CLI:**
```bash
npm install -g netlify-cli
netlify deploy
```

### Opção 3: Firebase Hosting

Se já está usando Firebase para o ranking:

1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Faça login:
```bash
firebase login
```

3. Inicialize o projeto:
```bash
firebase init hosting
```

4. Configure:
   - Public directory: `.` (diretório atual)
   - Configure as single-page app: **No**
   - Rewrite all URLs: **No**

5. Deploy:
```bash
firebase deploy --only hosting
```

### Opção 4: GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em **Settings → Pages**
4. Em **Source**, selecione a branch `main`
5. Salve e aguarde alguns minutos
6. Acesse: `https://seu-usuario.github.io/seu-repositorio`

## 📁 Estrutura de Arquivos

```
joguinho/
├── index.html              # Estrutura HTML principal
├── style.css               # Estilos e animações
├── game.js                 # Lógica do jogo
├── mapeamento.js          # Sistema de mapeamento de objetos
├── ranking.js             # Sistema de ranking (Firebase)
├── fase1.json             # Mapeamento da fase 1
├── fase2.json             # Mapeamento da fase 2
├── fase3.json             # Mapeamento da fase 3
├── fase4.json             # Mapeamento da fase 4
├── fase5.json             # Mapeamento da fase 5
├── fase6.json             # Mapeamento da fase 6
├── screen01.png           # Imagem da fase 1
├── screen02.png           # Imagem da fase 2
├── screen03.png           # Imagem da fase 3
├── screen04.png           # Imagem da fase 4
├── screen05.png           # Imagem da fase 5
├── screen06.png           # Imagem da fase 6
└── README.md              # Este arquivo
```

## 🎮 Como Jogar

1. **Objetivo**: Encontre todos os objetos escondidos em cada fase
2. **Controles**: Clique nos objetos na cena principal
3. **Feedback**: Um X vermelho marca objetos encontrados
4. **Progresso**: Acompanhe objetos encontrados e tempo decorrido
5. **Vitória**: Complete todas as 6 fases o mais rápido possível
6. **Ranking**: Digite seu nome e veja sua posição no ranking

## 🛠️ Adicionar Novas Fases

Para adicionar mais fases:

1. Adicione a imagem (ex: `screen07.png`)
2. Atualize `game.js`, mudando `this.totalFases = 7`
3. Adicione opção no HTML:
```html
<option value="7">Fase 7</option>
```
4. Use o Modo Mapeamento para criar `fase7.json`

## 🐛 Solução de Problemas

### Imagens não aparecem
- Verifique se os nomes estão corretos: `screen01.png` a `screen06.png`
- Certifique-se de que as imagens estão na mesma pasta do `index.html`

### JSON não carrega
- Verifique a sintaxe JSON em um validador online
- Certifique-se de que o arquivo está nomeado corretamente: `fase1.json`

### Firebase não funciona
- Verifique as credenciais no arquivo `ranking.js`
- Confirme que as regras do Firestore estão configuradas
- Abra o Console do navegador (F12) para ver erros específicos

### Ranking local não salva
- Verifique se o navegador permite localStorage
- Teste em modo de navegação normal (não anônimo)

## 🔧 Funções de Debug

Abra o Console do navegador (F12) e use:

```javascript
// Ver ranking local
rankingDebug.ver()

// Limpar ranking local
rankingDebug.limpar()

// Exportar ranking local
rankingDebug.exportar()
```

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Internet Explorer (não suportado)

## 🤝 Contribuindo

Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Compartilhar suas fases customizadas

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

## 🎨 Créditos

Desenvolvido com ❤️ usando:
- HTML5 Canvas
- JavaScript ES6+
- Firebase Firestore
- CSS3 Animations

---

**Divirta-se jogando! 🎮✨**

Para suporte, abra uma issue no repositório ou entre em contato.
