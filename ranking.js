// Sistema de Ranking com Firebase
class RankingManager {
    constructor() {
        this.db = null;
        this.firebaseConfigured = false;
        this.rankingLocal = []; // Fallback para quando Firebase não estiver configurado
        this.setupFirebase();
    }

    setupFirebase() {
        // Configuração do Firebase
        // IMPORTANTE: Substitua com suas credenciais do Firebase
        const firebaseConfig = {
            apiKey: "SUA_API_KEY_AQUI",
            authDomain: "seu-projeto.firebaseapp.com",
            projectId: "seu-projeto",
            storageBucket: "seu-projeto.appspot.com",
            messagingSenderId: "123456789",
            appId: "seu-app-id"
        };

        try {
            // Verificar se Firebase está disponível
            if (typeof firebase !== 'undefined') {
                // Verificar se já foi inicializado
                if (!firebase.apps.length) {
                    // Verificar se as credenciais foram configuradas
                    if (firebaseConfig.apiKey === "SUA_API_KEY_AQUI") {
                        console.warn('Firebase não configurado. Usando armazenamento local.');
                        this.usarArmazenamentoLocal();
                        return;
                    }
                    firebase.initializeApp(firebaseConfig);
                }
                this.db = firebase.firestore();
                this.firebaseConfigured = true;
                console.log('Firebase conectado com sucesso!');
            } else {
                console.warn('Firebase SDK não carregado. Usando armazenamento local.');
                this.usarArmazenamentoLocal();
            }
        } catch (error) {
            console.error('Erro ao configurar Firebase:', error);
            this.usarArmazenamentoLocal();
        }
    }

    usarArmazenamentoLocal() {
        this.firebaseConfigured = false;
        // Carregar ranking do localStorage
        const rankingStorage = localStorage.getItem('rhinoDetetiveRanking');
        if (rankingStorage) {
            this.rankingLocal = JSON.parse(rankingStorage);
        }
    }

    async salvarTempo(nome, tempoMs) {
        const registro = {
            nome: nome,
            tempo: tempoMs,
            data: new Date().toISOString()
        };

        if (this.firebaseConfigured && this.db) {
            try {
                await this.db.collection('ranking').add(registro);
                this.carregarRanking();
            } catch (error) {
                console.error('Erro ao salvar no Firebase:', error);
                this.salvarLocal(registro);
            }
        } else {
            this.salvarLocal(registro);
        }
    }

    salvarLocal(registro) {
        this.rankingLocal.push(registro);
        this.rankingLocal.sort((a, b) => a.tempo - b.tempo);
        // Manter apenas top 100
        if (this.rankingLocal.length > 100) {
            this.rankingLocal = this.rankingLocal.slice(0, 100);
        }
        localStorage.setItem('rhinoDetetiveRanking', JSON.stringify(this.rankingLocal));
        this.carregarRanking();
    }

    async carregarRanking() {
        const listaElement = document.getElementById('listaRanking');
        listaElement.innerHTML = '<p class="loading">Carregando ranking...</p>';

        if (this.firebaseConfigured && this.db) {
            try {
                const snapshot = await this.db.collection('ranking')
                    .orderBy('tempo', 'asc')
                    .limit(50)
                    .get();

                const ranking = [];
                snapshot.forEach(doc => {
                    ranking.push(doc.data());
                });

                this.exibirRanking(ranking, listaElement, 'online');
            } catch (error) {
                console.error('Erro ao carregar ranking do Firebase:', error);
                listaElement.innerHTML = '<p class="loading">Erro ao carregar ranking online. Mostrando ranking local...</p>';
                setTimeout(() => {
                    this.exibirRanking(this.rankingLocal, listaElement, 'local');
                }, 1000);
            }
        } else {
            this.exibirRanking(this.rankingLocal, listaElement, 'local');
        }
    }

    exibirRanking(ranking, elemento, tipo) {
        if (ranking.length === 0) {
            elemento.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>📊 Ranking ${tipo === 'online' ? 'Online' : 'Local'}</h3>
                    <p>Ainda não há registros no ranking.</p>
                    <p>Seja o primeiro a completar o jogo!</p>
                </div>
            `;
            return;
        }

        let html = `<h3 style="text-align: center; margin-bottom: 20px; color: #667eea;">
            🏆 Top ${ranking.length} - Ranking ${tipo === 'online' ? 'Online' : 'Local'}
        </h3>`;

        ranking.forEach((item, index) => {
            const posicao = index + 1;
            const classeTop = posicao === 1 ? 'top1' : posicao === 2 ? 'top2' : posicao === 3 ? 'top3' : '';
            const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : '';
            
            html += `
                <div class="ranking-item ${classeTop}">
                    <span class="ranking-posicao">${medalha || posicao + 'º'}</span>
                    <span class="ranking-nome">${this.escapeHtml(item.nome)}</span>
                    <span class="ranking-tempo">${this.formatarTempo(item.tempo)}</span>
                </div>
            `;
        });

        elemento.innerHTML = html;
    }

    formatarTempo(ms) {
        const segundos = Math.floor(ms / 1000);
        const minutos = Math.floor(segundos / 60);
        const seg = segundos % 60;
        const mili = Math.floor((ms % 1000) / 10);
        
        return `${String(minutos).padStart(2, '0')}:${String(seg).padStart(2, '0')}.${String(mili).padStart(2, '0')}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Método para limpar ranking local (útil para testes)
    limparRankingLocal() {
        if (confirm('Tem certeza que deseja limpar o ranking local?')) {
            this.rankingLocal = [];
            localStorage.removeItem('rhinoDetetiveRanking');
            alert('Ranking local limpo!');
            this.carregarRanking();
        }
    }

    // Método para exportar ranking local
    exportarRankingLocal() {
        if (this.rankingLocal.length === 0) {
            alert('Ranking local vazio!');
            return;
        }

        const dados = {
            exportadoEm: new Date().toISOString(),
            ranking: this.rankingLocal
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ranking-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        alert('Ranking exportado com sucesso!');
    }
}

// Inicializar gerenciador de ranking
let rankingManager;
document.addEventListener('DOMContentLoaded', () => {
    rankingManager = new RankingManager();
});

// Expor funções úteis no console para debug
window.rankingDebug = {
    limpar: () => rankingManager.limparRankingLocal(),
    exportar: () => rankingManager.exportarRankingLocal(),
    ver: () => console.log(rankingManager.rankingLocal)
};

console.log('💡 Dica: Use rankingDebug.limpar() para limpar o ranking local');
console.log('💡 Dica: Use rankingDebug.exportar() para exportar o ranking local');
console.log('💡 Dica: Use rankingDebug.ver() para ver o ranking local no console');
