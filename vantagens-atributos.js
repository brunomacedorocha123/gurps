// vantagens-atributos.js
// Sistema completo para Atributos Complementares + Status & Reputação

// ===========================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ===========================================

class SistemaAtributos {
    constructor() {
        // Configuração dos Atributos Complementares
        this.atributos = {
            'forca-vontade': { 
                nome: 'Força de Vontade',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5,
                icone: 'fas fa-brain',
                descricao: 'Resistência mental a medo, dor e influência'
            },
            'percepcao': { 
                nome: 'Percepção',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5,
                icone: 'fas fa-eye',
                descricao: 'Habilidade de perceber detalhes e perigos'
            },
            'pv': { 
                nome: 'Pontos de Vida',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 2,
                icone: 'fas fa-heartbeat',
                descricao: 'Resistência física e vitalidade'
            },
            'pf': { 
                nome: 'Pontos de Fadiga',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 3,
                icone: 'fas fa-wind',
                descricao: 'Energia para ações físicas e mentais'
            },
            'velocidade': { 
                nome: 'Velocidade Básica',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5, 
                fator: 0.25,
                icone: 'fas fa-tachometer-alt',
                descricao: 'Velocidade de movimento e iniciativa'
            },
            'deslocamento': { 
                nome: 'Deslocamento Básico',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5, 
                fator: 1,
                icone: 'fas fa-running',
                descricao: 'Distância percorrida por turno'
            }
        };
        
        // Configuração de Status & Reputação
        this.status = {
            'status': { 
                nome: 'Status',
                nivel: 0, 
                direcao: 'neutro', 
                custoPorNivel: 5,
                descricoes: {
                    positivo: ['Respeitado', 'Honrado', 'Prestigiado', 'Ilustre'],
                    negativo: ['Desprezado', 'Humilhado', 'Infame', 'Pária']
                }
            },
            'reputacao': { 
                nome: 'Reputação',
                nivel: 0, 
                direcao: 'neutro', 
                custoPorNivel: 5,
                descricoes: {
                    positivo: ['Conhecido', 'Respeitado', 'Famoso', 'Lendário'],
                    negativo: ['Notório', 'Temido', 'Odiado', 'Infame']
                }
            }
        };
        
        this.init();
    }
    
    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================
    
    init() {
        this.setupAtributos();
        this.setupStatus();
        this.calcularTotais();
        this.setupEventListeners();
        this.carregarDoLocalStorage();
    }
    
    setupEventListeners() {
        // Evento para salvar automaticamente
        document.addEventListener('vantagensAlteradas', () => {
            this.salvarNoLocalStorage();
            this.calcularTotais();
        });
    }
    
    // ===========================================
    // ATRIBUTOS COMPLEMENTARES
    // ===========================================
    
    setupAtributos() {
        document.querySelectorAll('.atributo-item').forEach(item => {
            const tipo = item.dataset.tipo;
            
            // Elementos DOM
            const elementos = {
                btnVantagem: item.querySelector('.btn-vantagem'),
                btnDesvantagem: item.querySelector('.btn-desvantagem'),
                btnMenos: item.querySelector('.btn-nivel.menos'),
                btnMais: item.querySelector('.btn-nivel.mais'),
                displayNivel: item.querySelector('.nivel-display'),
                statusDirecao: item.querySelector('.status-direcao'),
                custoDisplay: item.querySelector('.custo-valor')
            };
            
            // Eventos de direção
            elementos.btnVantagem.addEventListener('click', () => 
                this.setDirecaoAtributo(tipo, 'positivo'));
            
            elementos.btnDesvantagem.addEventListener('click', () => 
                this.setDirecaoAtributo(tipo, 'negativo'));
            
            // Eventos de nível
            elementos.btnMenos.addEventListener('click', () => 
                this.ajustarNivelAtributo(tipo, -1));
            
            elementos.btnMais.addEventListener('click', () => 
                this.ajustarNivelAtributo(tipo, 1));
            
            // Tooltip
            const icon = item.querySelector('.atributo-header i');
            icon.title = this.atributos[tipo].descricao;
        });
    }
    
    setDirecaoAtributo(tipo, direcao) {
        const atributo = this.atributos[tipo];
        
        // Se clicar na mesma direção, desativa
        if (atributo.direcao === direcao) {
            atributo.direcao = null;
            atributo.nivel = 0;
        } else {
            // Nova direção
            atributo.direcao = direcao;
            atributo.nivel = direcao === 'positivo' ? 1 : -1;
        }
        
        this.atualizarDisplayAtributo(tipo);
        this.dispatchAlteracao();
    }
    
    ajustarNivelAtributo(tipo, delta) {
        const atributo = this.atributos[tipo];
        
        if (!atributo.direcao) return; // Precisa ter direção primeiro
        
        let novoNivel = atributo.nivel + delta;
        
        // Limites por direção
        if (atributo.direcao === 'positivo') {
            if (novoNivel < 1) novoNivel = 1;
            if (novoNivel > 10) novoNivel = 10;
        } else {
            if (novoNivel > -1) novoNivel = -1;
            if (novoNivel < -10) novoNivel = -10;
        }
        
        atributo.nivel = novoNivel;
        this.atualizarDisplayAtributo(tipo);
        this.dispatchAlteracao();
    }
    
    atualizarDisplayAtributo(tipo) {
        const item = document.querySelector(`.atributo-item[data-tipo="${tipo}"]`);
        if (!item) return;
        
        const atributo = this.atributos[tipo];
        const elementos = {
            btnVantagem: item.querySelector('.btn-vantagem'),
            btnDesvantagem: item.querySelector('.btn-desvantagem'),
            btnMenos: item.querySelector('.btn-nivel.menos'),
            btnMais: item.querySelector('.btn-nivel.mais'),
            displayNivel: item.querySelector('.nivel-display'),
            statusDirecao: item.querySelector('.status-direcao'),
            custoDisplay: item.querySelector('.custo-valor')
        };
        
        // Estado dos botões de direção
        elementos.btnVantagem.classList.toggle('active', atributo.direcao === 'positivo');
        elementos.btnDesvantagem.classList.toggle('active', atributo.direcao === 'negativo');
        
        // Estado dos botões de nível
        const podeDiminuir = atributo.direcao && 
            ((atributo.direcao === 'positivo' && atributo.nivel > 1) ||
             (atributo.direcao === 'negativo' && atributo.nivel < -1));
        
        const podeAumentar = atributo.direcao && 
            ((atributo.direcao === 'positivo' && atributo.nivel < 10) ||
             (atributo.direcao === 'negativo' && atributo.nivel > -10));
        
        elementos.btnMenos.disabled = !podeDiminuir;
        elementos.btnMais.disabled = !podeAumentar;
        
        // Display do nível
        let nivelDisplay = Math.abs(atributo.nivel);
        if (tipo === 'velocidade') {
            elementos.displayNivel.textContent = (nivelDisplay * atributo.fator).toFixed(2);
        } else if (tipo === 'deslocamento') {
            elementos.displayNivel.textContent = nivelDisplay * atributo.fator;
        } else {
            elementos.displayNivel.textContent = nivelDisplay;
        }
        
        // Status da direção
        elementos.statusDirecao.textContent = atributo.direcao === 'positivo' ? 'Vantagem' : 
                                            atributo.direcao === 'negativo' ? 'Desvantagem' : 'Neutro';
        elementos.statusDirecao.className = 'status-direcao ' + (atributo.direcao || 'neutro');
        
        // Cálculo do custo
        let custo = 0;
        if (atributo.direcao) {
            const niveisAbs = Math.abs(atributo.nivel);
            custo = niveisAbs * atributo.custoPorNivel;
            custo = atributo.direcao === 'negativo' ? -custo : custo;
        }
        
        elementos.custoDisplay.textContent = custo > 0 ? `+${custo}` : custo;
        elementos.custoDisplay.className = 'custo-valor ' + 
            (custo > 0 ? 'positivo' : custo < 0 ? 'negativo' : '');
        
        // Atualiza a classe do item
        item.classList.toggle('ativo', atributo.direcao !== null);
    }
    
    // ===========================================
    // STATUS & REPUTAÇÃO
    // ===========================================
    
    setupStatus() {
        document.querySelectorAll('.status-item').forEach(item => {
            const tipo = item.dataset.tipo;
            
            // Elementos DOM
            const elementos = {
                radios: item.querySelectorAll('input[type="radio"]'),
                btnMenos: item.querySelector('.btn-nivel-status.menos'),
                btnMais: item.querySelector('.btn-nivel-status.mais'),
                nivelDisplay: item.querySelector('.nivel-valor'),
                descDisplay: item.querySelector(`#desc${this.capitalize(tipo)}`),
                custoDisplay: item.querySelector(`#custo${this.capitalize(tipo)}`)
            };
            
            // Eventos para radios
            elementos.radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.setDirecaoStatus(tipo, e.target.value);
                    }
                });
            });
            
            // Eventos para botões de nível
            elementos.btnMenos.addEventListener('click', () => 
                this.ajustarNivelStatus(tipo, -1));
            
            elementos.btnMais.addEventListener('click', () => 
                this.ajustarNivelStatus(tipo, 1));
            
            // Atualizar display inicial
            this.atualizarDisplayStatus(tipo);
        });
    }
    
    setDirecaoStatus(tipo, direcao) {
        const status = this.status[tipo];
        
        if (direcao === 'neutro') {
            status.direcao = 'neutro';
            status.nivel = 0;
        } else {
            status.direcao = direcao;
            status.nivel = direcao === 'positivo' ? 1 : -1;
        }
        
        this.atualizarDisplayStatus(tipo);
        this.dispatchAlteracao();
    }
    
    ajustarNivelStatus(tipo, delta) {
        const status = this.status[tipo];
        
        if (status.direcao === 'neutro') return; // Precisa escolher direção primeiro
        
        let novoNivel = status.nivel + delta;
        
        // Limites: 1 a 4 para positivo, -1 a -4 para negativo
        if (status.direcao === 'positivo') {
            if (novoNivel < 1) novoNivel = 1;
            if (novoNivel > 4) novoNivel = 4;
        } else {
            if (novoNivel > -1) novoNivel = -1;
            if (novoNivel < -4) novoNivel = -4;
        }
        
        status.nivel = novoNivel;
        this.atualizarDisplayStatus(tipo);
        this.dispatchAlteracao();
    }
    
    atualizarDisplayStatus(tipo) {
        const item = document.querySelector(`.status-item[data-tipo="${tipo}"]`);
        if (!item) return;
        
        const status = this.status[tipo];
        const elementos = {
            radios: item.querySelectorAll('input[type="radio"]'),
            btnMenos: item.querySelector('.btn-nivel-status.menos'),
            btnMais: item.querySelector('.btn-nivel-status.mais'),
            nivelDisplay: item.querySelector('.nivel-valor'),
            descDisplay: item.querySelector(`#desc${this.capitalize(tipo)}`),
            custoDisplay: item.querySelector(`#custo${this.capitalize(tipo)}`)
        };
        
        // Ativar radio correto
        elementos.radios.forEach(radio => {
            radio.checked = radio.value === status.direcao;
        });
        
        // Estado dos botões de nível
        const podeDiminuir = status.direcao !== 'neutro' && 
            ((status.direcao === 'positivo' && status.nivel > 1) ||
             (status.direcao === 'negativo' && status.nivel < -1));
        
        const podeAumentar = status.direcao !== 'neutro' && 
            ((status.direcao === 'positivo' && status.nivel < 4) ||
             (status.direcao === 'negativo' && status.nivel > -4));
        
        elementos.btnMenos.disabled = !podeDiminuir;
        elementos.btnMais.disabled = !podeAumentar;
        
        // Display do nível
        const nivelAbs = Math.abs(status.nivel);
        elementos.nivelDisplay.textContent = nivelAbs;
        
        // Descrição baseada no nível
        let descricao = '';
        if (status.direcao === 'neutro') {
            descricao = `${status.nome} padrão, sem modificadores`;
        } else {
            const descricoes = status.descricoes[status.direcao];
            const indice = nivelAbs - 1;
            if (indice >= 0 && indice < descricoes.length) {
                descricao = `${descricoes[indice]}: ${status.nome} ${status.direcao === 'positivo' ? 'elevado' : 'baixo'} (nível ${nivelAbs})`;
            }
        }
        
        elementos.descDisplay.textContent = descricao;
        
        // Cálculo do custo
        let custo = 0;
        if (status.direcao !== 'neutro') {
            custo = nivelAbs * status.custoPorNivel;
            custo = status.direcao === 'negativo' ? -custo : custo;
        }
        
        elementos.custoDisplay.textContent = custo > 0 ? `+${custo}` : custo;
        elementos.custoDisplay.className = 'custo-total ' + 
            (custo > 0 ? 'positivo' : custo < 0 ? 'negativo' : '');
    }
    
    // ===========================================
    // CÁLCULOS E TOTAIS
    // ===========================================
    
    calcularTotais() {
        let totalAtributos = 0;
        let totalStatus = 0;
        
        // Soma atributos
        Object.values(this.atributos).forEach(atributo => {
            if (atributo.direcao) {
                const custo = Math.abs(atributo.nivel) * atributo.custoPorNivel;
                totalAtributos += atributo.direcao === 'positivo' ? custo : -custo;
            }
        });
        
        // Soma status
        Object.values(this.status).forEach(status => {
            if (status.direcao !== 'neutro') {
                const custo = Math.abs(status.nivel) * status.custoPorNivel;
                totalStatus += status.direcao === 'positivo' ? custo : -custo;
            }
        });
        
        // Atualiza displays
        document.getElementById('totalAtributos').textContent = 
            totalAtributos > 0 ? `+${totalAtributos}` : totalAtributos;
        
        document.getElementById('totalStatusRep').textContent = 
            totalStatus > 0 ? `+${totalStatus}` : totalStatus;
        
        const totalGeral = totalAtributos + totalStatus;
        document.getElementById('totalGeral').textContent = 
            totalGeral > 0 ? `+${totalGeral}` : totalGeral;
        
        // Atualiza badges individuais
        document.getElementById('pontosAtributos').textContent = 
            `${totalAtributos > 0 ? '+' : ''}${totalAtributos} pts`;
        document.getElementById('pontosAtributos').className = 
            'pontos-badge ' + (totalAtributos > 0 ? 'positivo' : totalAtributos < 0 ? 'negativo' : '');
        
        document.getElementById('pontosStatus').textContent = 
            `${totalStatus > 0 ? '+' : ''}${totalStatus} pts`;
        document.getElementById('pontosStatus').className = 
            'pontos-badge ' + (totalStatus > 0 ? 'positivo' : totalStatus < 0 ? 'negativo' : '');
        
        return { totalAtributos, totalStatus, totalGeral };
    }
    
    // ===========================================
    // PERSISTÊNCIA (LocalStorage)
    // ===========================================
    
    salvarNoLocalStorage() {
        const dados = {
            atributos: this.atributos,
            status: this.status,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vantagensAtributos', JSON.stringify(dados));
    }
    
    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('vantagensAtributos');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                // Carrega atributos
                if (parsed.atributos) {
                    Object.keys(parsed.atributos).forEach(key => {
                        if (this.atributos[key]) {
                            Object.assign(this.atributos[key], parsed.atributos[key]);
                            this.atualizarDisplayAtributo(key);
                        }
                    });
                }
                
                // Carrega status
                if (parsed.status) {
                    Object.keys(parsed.status).forEach(key => {
                        if (this.status[key]) {
                            Object.assign(this.status[key], parsed.status[key]);
                            this.atualizarDisplayStatus(key);
                        }
                    });
                }
                
                this.calcularTotais();
                console.log('✅ Dados de atributos carregados do localStorage');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
        }
    }
    
    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    dispatchAlteracao() {
        const evento = new Event('vantagensAlteradas');
        document.dispatchEvent(evento);
    }
    
    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================
    
    getDadosParaSalvar() {
        return {
            atributos: this.atributos,
            status: this.status,
            totais: this.calcularTotais()
        };
    }
    
    resetar() {
        // Reseta atributos
        Object.values(this.atributos).forEach(atributo => {
            atributo.nivel = 0;
            atributo.direcao = null;
        });
        
        // Reseta status
        Object.values(this.status).forEach(status => {
            status.nivel = 0;
            status.direcao = 'neutro';
        });
        
        // Atualiza displays
        Object.keys(this.atributos).forEach(tipo => this.atualizarDisplayAtributo(tipo));
        Object.keys(this.status).forEach(tipo => this.atualizarDisplayStatus(tipo));
        
        this.calcularTotais();
        this.salvarNoLocalStorage();
    }
    
    // ===========================================
    // INTEGRAÇÃO COM FIREBASE
    // ===========================================
    
    salvarNoFirebase(characterId) {
        if (!characterId || !window.db) return Promise.reject('Firebase não inicializado');
        
        const dados = this.getDadosParaSalvar();
        
        return db.collection('characters').doc(characterId).update({
            'vantagens.atributos': dados,
            'lastUpdated': new Date().toISOString()
        });
    }
    
    carregarDoFirebase(characterId) {
        if (!characterId || !window.db) return Promise.reject('Firebase não inicializado');
        
        return db.collection('characters').doc(characterId).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.vantagens && data.vantagens.atributos) {
                        const carregado = data.vantagens.atributos;
                        
                        // Carrega atributos
                        if (carregado.atributos) {
                            Object.keys(carregado.atributos).forEach(key => {
                                if (this.atributos[key]) {
                                    Object.assign(this.atributos[key], carregado.atributos[key]);
                                    this.atualizarDisplayAtributo(key);
                                }
                            });
                        }
                        
                        // Carrega status
                        if (carregado.status) {
                            Object.keys(carregado.status).forEach(key => {
                                if (this.status[key]) {
                                    Object.assign(this.status[key], carregado.status[key]);
                                    this.atualizarDisplayStatus(key);
                                }
                            });
                        }
                        
                        this.calcularTotais();
                        console.log('✅ Dados carregados do Firebase');
                    }
                }
            })
            .catch(error => {
                console.error('❌ Erro ao carregar do Firebase:', error);
            });
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

let sistemaAtributos = null;

// Inicializa quando a aba for ativada
function initVantagensAtributosTab() {
    if (!sistemaAtributos) {
        sistemaAtributos = new SistemaAtributos();
        console.log('✅ Sistema de Atributos inicializado');
    }
    return sistemaAtributos;
}

// Exporta para uso global
window.SistemaAtributos = SistemaAtributos;
window.initVantagensAtributosTab = initVantagensAtributosTab;

// Inicializa automaticamente se estiver na aba correta
document.addEventListener('DOMContentLoaded', () => {
    const vantagensTab = document.getElementById('vantagens');
    if (vantagensTab && vantagensTab.classList.contains('active')) {
        initVantagensAtributosTab();
    }
});