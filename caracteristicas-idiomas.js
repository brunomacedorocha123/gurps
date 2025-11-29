// caracteristicas-idiomas.js - VERSÃO SEM SALVAMENTO AUTOMÁTICO
class SistemaIdiomas {
    constructor() {
        this.idiomaMaterno = {
            nome: 'Comum',
            nivelFala: 6,
            nivelEscrita: 6,
            custoTotal: 0
        };
        
        this.idiomasAdicionais = [];
        
        this.niveisFala = [
            { valor: 0, nome: 'Nenhum', custo: 0 },
            { valor: 2, nome: 'Rudimentar', custo: 2 },
            { valor: 4, nome: 'Sotaque', custo: 4 },
            { valor: 6, nome: 'Nativo', custo: 6 }
        ];
        
        this.niveisEscrita = [
            { valor: 0, nome: 'Nenhum', custo: 0 },
            { valor: 2, nome: 'Rudimentar', custo: 1 },
            { valor: 4, nome: 'Sotaque', custo: 2 },
            { valor: 6, nome: 'Nativo', custo: 3 }
        ];

        this.inicializado = false;
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
        this.inicializado = true;
    }
    
    configurarEventos() {
        // Botão adicionar idioma
        const btnAdicionar = document.getElementById('btnAdicionarIdioma');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => {
                this.adicionarIdioma();
            });
        }
        
        // Atualizar preview quando níveis mudarem
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala) {
            selectFala.addEventListener('change', () => this.atualizarPreviewCusto());
        }
        if (selectEscrita) {
            selectEscrita.addEventListener('change', () => this.atualizarPreviewCusto());
        }
        
        // Enter no input de novo idioma
        const inputNovoIdioma = document.getElementById('novoIdiomaNome');
        if (inputNovoIdioma) {
            inputNovoIdioma.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adicionarIdioma();
                }
            });
        }
        
        // Event delegation para remoção de idiomas - CORRIGIDO
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-idioma')) {
                const button = e.target.closest('.btn-remove-idioma');
                const idiomaId = parseInt(button.dataset.id);
                this.removerIdioma(idiomaId);
            }
        });
    }
    
    atualizarPreviewCusto() {
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala && selectEscrita) {
            const nivelFala = parseInt(selectFala.value);
            const nivelEscrita = parseInt(selectEscrita.value);
            const custo = this.calcularCustoIdioma(nivelFala, nivelEscrita);
            
            const preview = document.getElementById('custoIdiomaPreview');
            if (preview) {
                preview.textContent = `${custo >= 0 ? '+' : ''}${custo} pts`;
            }
        }
    }
    
    adicionarIdioma() {
        const inputNome = document.getElementById('novoIdiomaNome');
        const nomeDigitado = inputNome ? inputNome.value.trim() : '';
        
        if (!nomeDigitado) {
            alert('Por favor, digite um nome para o idioma!');
            inputNome?.focus();
            return;
        }
        
        if (this.idiomaJaExiste(nomeDigitado)) {
            alert('Este idioma já foi adicionado!');
            return;
        }
        
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        const nivelFala = selectFala ? parseInt(selectFala.value) : 2;
        const nivelEscrita = selectEscrita ? parseInt(selectEscrita.value) : 0;
        
        const custoTotal = this.calcularCustoIdioma(nivelFala, nivelEscrita);
        
        const novoIdioma = {
            id: Date.now(),
            nome: nomeDigitado,
            nivelFala: nivelFala,
            nivelEscrita: nivelEscrita,
            custoTotal: custoTotal
        };
        
        this.idiomasAdicionais.push(novoIdioma);
        
        // Limpar formulário
        if (inputNome) {
            inputNome.value = '';
            inputNome.focus();
        }
        
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
    }

    idiomaJaExiste(nome) {
        return this.idiomasAdicionais.some(idioma => 
            idioma.nome.toLowerCase() === nome.toLowerCase()
        );
    }
    
    removerIdioma(id) {
        // CORREÇÃO: Filtrar o array para remover o idioma
        this.idiomasAdicionais = this.idiomasAdicionais.filter(i => i.id !== id);
        this.atualizarDisplay();
    }
    
    calcularCustoIdioma(nivelFala, nivelEscrita) {
        const nivelFalaObj = this.niveisFala.find(n => n.valor === nivelFala);
        const nivelEscritaObj = this.niveisEscrita.find(n => n.valor === nivelEscrita);
        
        const custoFala = nivelFalaObj ? nivelFalaObj.custo : 0;
        const custoEscrita = nivelEscritaObj ? nivelEscritaObj.custo : 0;
        
        return custoFala + custoEscrita;
    }
    
    calcularPontosIdiomas() {
        return this.idiomasAdicionais.reduce((total, idioma) => total + idioma.custoTotal, 0);
    }
    
    atualizarDisplay() {
        this.atualizarListaIdiomas();
        this.atualizarPontos();
    }
    
    atualizarListaIdiomas() {
        const container = document.getElementById('listaIdiomasAdicionais');
        const totalElement = document.getElementById('totalIdiomas');
        
        if (!container) return;
        
        if (totalElement) {
            totalElement.textContent = this.idiomasAdicionais.length;
        }

        if (this.idiomasAdicionais.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum idioma adicional adicionado</div>';
            return;
        }
        
        container.innerHTML = this.idiomasAdicionais.map(idioma => {
            const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
            const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
            
            return `
                <div class="idioma-item">
                    <div class="idioma-info">
                        <strong>${idioma.nome}</strong>
                        <div class="idioma-niveis">
                            <small>🗣️ ${nivelFala} | 📝 ${nivelEscrita}</small>
                        </div>
                    </div>
                    <div class="idioma-actions">
                        <span class="idioma-custo">+${idioma.custoTotal}</span>
                        <button class="btn-remove-idioma" data-id="${idioma.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    atualizarPontos() {
        const badge = document.getElementById('pontosIdiomas');
        if (badge) {
            const pontos = this.calcularPontosIdiomas();
            badge.textContent = `${pontos >= 0 ? '+' : ''}${pontos} pts`;
        }
    }
    
    obterTextoNivel(nivel, tipo) {
        const niveis = tipo === 'fala' ? this.niveisFala : this.niveisEscrita;
        const nivelObj = niveis.find(n => n.valor === nivel);
        return nivelObj ? nivelObj.nome : 'Desconhecido';
    }

    // MÉTODOS PARA SALVAMENTO MANUAL (quando você quiser)
    exportarDados() {
        return {
            idiomaMaterno: this.idiomaMaterno,
            idiomasAdicionais: this.idiomasAdicionais,
            pontosTotais: this.calcularPontosIdiomas()
        };
    }

    carregarDados(dados) {
        if (dados.idiomaMaterno) {
            this.idiomaMaterno = dados.idiomaMaterno;
            const input = document.getElementById('idiomaMaternoNome');
            if (input) input.value = this.idiomaMaterno.nome;
        }
        
        if (dados.idiomasAdicionais) {
            this.idiomasAdicionais = dados.idiomasAdicionais;
        }
        
        this.atualizarDisplay();
    }
}

// INICIALIZAÇÃO
let sistemaIdiomas;

document.addEventListener('DOMContentLoaded', function() {
    sistemaIdiomas = new SistemaIdiomas();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        if (sistemaIdiomas && !sistemaIdiomas.inicializado) {
                            sistemaIdiomas.inicializar();
                        }
                    }, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// FUNÇÃO GLOBAL
window.adicionarIdioma = () => {
    if (sistemaIdiomas) {
        sistemaIdiomas.adicionarIdioma();
    }
};