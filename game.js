// Lógica Principal do Jogo Hidden Object
class HiddenObjectGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.faseAtual = 1;
        this.totalFases = 6;
        this.objetos = [];
        this.objetosEncontrados = [];
        this.imagem = null;
        this.tempoInicio = null;
        this.tempoDecorrido = 0;
        this.timerInterval = null;
        this.jogoAtivo = false;
        
        this.mensagensAcerto = [
            "Boa! 🎯",
            "Mandou bem! 👏",
            "Excelente! ⭐",
            "Perfeito! 🌟",
            "Incrível! 🎉",
            "Sensacional! 🏆"
        ];

        this.setupEventListeners();
        this.setupControlesTela();
    }

    setupControlesTela() {
        const btnJogar = document.getElementById('btnJogar');
        const btnRecordes = document.getElementById('btnRecordes');
        const btnVoltarMenuJogo = document.getElementById('voltarMenuJogo');
        const btnVoltarJogo = document.getElementById('voltarJogo');
        const btnJogarNovamente = document.getElementById('jogarNovamente');

        btnJogar.addEventListener('click', () => {
            this.mostrarTela('jogo');
            this.iniciarJogo();
        });

        btnRecordes.addEventListener('click', () => {
            this.mostrarTela('ranking');
            if (rankingManager) {
                rankingManager.carregarRanking();
            }
        });

        btnVoltarMenuJogo.addEventListener('click', () => {
            this.mostrarTela('menu');
            this.pausarTimer();
            this.jogoAtivo = false;
        });

        btnVoltarJogo.addEventListener('click', () => {
            this.mostrarTela('menu');
        });

        btnJogarNovamente.addEventListener('click', () => {
            this.fecharModal();
            this.mostrarTela('jogo');
            this.iniciarJogo();
        });
    }

    mostrarTela(tela) {
        document.getElementById('telaMenu').classList.remove('active');
        document.getElementById('telaJogo').classList.remove('active');
        document.getElementById('telaRanking').classList.remove('active');

        if (tela === 'menu') {
            document.getElementById('telaMenu').classList.add('active');
        } else if (tela === 'jogo') {
            document.getElementById('telaJogo').classList.add('active');
        } else if (tela === 'ranking') {
            document.getElementById('telaRanking').classList.add('active');
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.jogoAtivo) {
                this.handleClick(e);
            }
        });
    }

    async iniciarJogo() {
        this.faseAtual = 1;
        this.tempoInicio = Date.now();
        this.tempoDecorrido = 0;
        this.jogoAtivo = true;
        this.iniciarTimer();
        await this.carregarFase(this.faseAtual);
    }

    async carregarFase(numeroFase) {
        try {
            // Carregar JSON da fase
            const response = await fetch(`fase${numeroFase}.json`);
            if (!response.ok) {
                throw new Error(`Arquivo fase${numeroFase}.json não encontrado`);
            }
            
            const dados = await response.json();
            
            // Aceitar dois formatos: array direto ou objeto com propriedade "objetos"
            if (Array.isArray(dados)) {
                this.objetos = dados;
            } else {
                this.objetos = dados.objetos || [];
            }
            
            this.objetosEncontrados = [];

            // Determinar nome da imagem
            const imagemNome = dados.imagem || `screen0${numeroFase}.png`;

            // Carregar imagem
            const img = new Image();
            img.onload = () => {
                this.imagem = img;
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.desenhar();
                this.atualizarInterface();
            };
            img.onerror = () => {
                alert(`Erro ao carregar a imagem: ${imagemNome}`);
            };
            img.src = imagemNome;

        } catch (error) {
            alert(`Erro ao carregar fase ${numeroFase}: ${error.message}\n\nVerifique se o arquivo fase${numeroFase}.json existe.`);
            this.jogoAtivo = false;
            this.pausarTimer();
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) * (this.canvas.width / rect.width));
        const y = Math.round((e.clientY - rect.top) * (this.canvas.height / rect.height));

        // Verificar se clicou em algum objeto na cena
        for (let obj of this.objetos) {
            if (this.objetosEncontrados.includes(obj.id)) {
                continue; // Objeto já encontrado
            }

            const cena = obj.cena;
            if (x >= cena.x && x <= cena.x + cena.width &&
                y >= cena.y && y <= cena.y + cena.height) {
                this.objetoEncontrado(obj);
                return;
            }
        }
    }

    objetoEncontrado(objeto) {
        this.objetosEncontrados.push(objeto.id);
        this.desenhar();
        this.atualizarInterface();
        this.mostrarMensagemAcerto();

        // Verificar se completou a fase
        if (this.objetosEncontrados.length === this.objetos.length) {
            setTimeout(() => {
                this.proximaFase();
            }, 1000);
        }
    }

    mostrarMensagemAcerto() {
        const mensagem = this.mensagensAcerto[Math.floor(Math.random() * this.mensagensAcerto.length)];
        const elemento = document.getElementById('mensagemAcerto');
        elemento.textContent = mensagem;
        elemento.classList.remove('show');
        
        // Force reflow
        void elemento.offsetWidth;
        
        elemento.classList.add('show');
        setTimeout(() => {
            elemento.classList.remove('show');
        }, 1000);
    }

    async proximaFase() {
        if (this.faseAtual < this.totalFases) {
            this.faseAtual++;
            await this.carregarFase(this.faseAtual);
        } else {
            // Jogo completo!
            this.finalizarJogo();
        }
    }

    finalizarJogo() {
        this.jogoAtivo = false;
        this.pausarTimer();
        
        const tempoFinal = this.formatarTempo(this.tempoDecorrido);
        document.getElementById('tempoFinal').innerHTML = `Você completou todas as fases em: <strong>${tempoFinal}</strong>`;
        
        const modal = document.getElementById('modalVitoria');
        modal.classList.add('show');

        // Setup botão de salvar ranking
        const btnSalvar = document.getElementById('salvarRanking');
        btnSalvar.onclick = () => {
            const nome = document.getElementById('nomeJogador').value.trim();
            if (!nome) {
                alert('Digite seu nome!');
                return;
            }
            
            if (rankingManager) {
                rankingManager.salvarTempo(nome, this.tempoDecorrido);
            }
            
            this.fecharModal();
            this.mostrarTela('ranking');
            document.getElementById('verRanking').classList.add('active');
            document.getElementById('modoJogo').classList.remove('active');
        };
    }

    fecharModal() {
        const modal = document.getElementById('modalVitoria');
        modal.classList.remove('show');
        document.getElementById('nomeJogador').value = '';
    }

    desenhar() {
        if (!this.imagem) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.imagem, 0, 0);

        // Desenhar X vermelho nos objetos encontrados
        this.ctx.strokeStyle = '#f44336';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';

        this.objetos.forEach(obj => {
            if (this.objetosEncontrados.includes(obj.id)) {
                // X na cena
                const cena = obj.cena;
                const cx = cena.x + cena.width / 2;
                const cy = cena.y + cena.height / 2;
                const size = Math.max(cena.width, cena.height) / 2;

                this.ctx.beginPath();
                this.ctx.moveTo(cx - size, cy - size);
                this.ctx.lineTo(cx + size, cy + size);
                this.ctx.moveTo(cx + size, cy - size);
                this.ctx.lineTo(cx - size, cy + size);
                this.ctx.stroke();

                // X na borda
                const borda = obj.borda;
                const bx = borda.x + borda.width / 2;
                const by = borda.y + borda.height / 2;
                const bSize = Math.max(borda.width, borda.height) / 2;

                this.ctx.beginPath();
                this.ctx.moveTo(bx - bSize, by - bSize);
                this.ctx.lineTo(bx + bSize, by + bSize);
                this.ctx.moveTo(bx + bSize, by - bSize);
                this.ctx.lineTo(bx - bSize, by + bSize);
                this.ctx.stroke();
            }
        });
    }

    atualizarInterface() {
        document.getElementById('faseAtual').textContent = `Fase: ${this.faseAtual}/${this.totalFases}`;
        document.getElementById('objetosEncontrados').textContent = 
            `Objetos: ${this.objetosEncontrados.length}/${this.objetos.length}`;
    }

    iniciarTimer() {
        this.timerInterval = setInterval(() => {
            this.tempoDecorrido = Date.now() - this.tempoInicio;
            document.getElementById('tempoDecorrido').textContent = 
                `Tempo: ${this.formatarTempo(this.tempoDecorrido)}`;
        }, 100);
    }

    pausarTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    continuarTimer() {
        if (this.jogoAtivo && !this.timerInterval) {
            this.tempoInicio = Date.now() - this.tempoDecorrido;
            this.iniciarTimer();
        }
    }

    formatarTempo(ms) {
        const segundos = Math.floor(ms / 1000);
        const minutos = Math.floor(segundos / 60);
        const seg = segundos % 60;
        const mili = Math.floor((ms % 1000) / 10);
        
        return `${String(minutos).padStart(2, '0')}:${String(seg).padStart(2, '0')}.${String(mili).padStart(2, '0')}`;
    }
}

// Inicializar jogo quando a página carregar
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new HiddenObjectGame();
    // Não inicia o jogo automaticamente, aguarda o jogador clicar em "Jogar"
});
