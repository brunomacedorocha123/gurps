// vantagens-main.js
// Sistema principal de controle das sub-abas de Vantagens/Desvantagens

// ===========================================
// CONFIGURAÇÕES GLOBAIS
// ===========================================

const VantagensConfig = {
    SUBABAS: {
        ATRIBUTOS_RELACOES: 'atributos-relacoes',
        CATALOGO_GERAL: 'catalogo-geral'
    },
    
    // Pontos totais do personagem (será carregado do sistema principal)
    pontosTotaisPersonagem: 0,
    pontosGastos: 0,
    
    // Estado atual
    abaAtiva: null,
    sistemaAtributos: null,
    sistemaCatalogo: null
};

// ===========================================
// SISTEMA PRINCIPAL DE CONTROLE
// ===========================================

class VantagensMainSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSubAbas();
        this.setupEventListeners();
        this.carregarConfiguracoes();
        this.calcularPontosDisponiveis();
        
        console.log('✅ Sistema principal de Vantagens inicializado');
    }
    
    // ===========================================
    // CONTROLE DE SUB-ABAS
    // ===========================================
    
    setupSubAbas() {
        const subAbas = document.querySelectorAll('.subtab-btn');
        const subConteudos = document.querySelectorAll('.subtab-pane');
        
        // Configura evento para cada botão de sub-aba
        subAbas.forEach(aba => {
            aba.addEventListener('click', () => {
                const subTabId = aba.dataset.subtab;
                this.switchSubTab(subTabId);
            });
        });
        
        // Ativa a primeira sub-aba por padrão
        if (subAbas.length > 0) {
            const primeiraAba = subAbas[0].dataset.subtab;
            this.switchSubTab(primeiraAba);
        }
    }
    
    switchSubTab(subTabId) {
        // Remove active de todas as sub-abas
        document.querySelectorAll('.subtab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.subtab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Ativa a sub-aba selecionada
        const btnAtivo = document.querySelector(`.subtab-btn[data-subtab="${subTabId}"]`);
        const paneAtivo = document.getElementById(`subtab-${subTabId}`);
        
        if (btnAtivo) btnAtivo.classList.add('active');
        if (paneAtivo) paneAtivo.classList.add('active');
        
        VantagensConfig.abaAtiva = subTabId;
        
        // Inicializa sistemas específicos da sub-aba
        this.inicializarSistemaSubAba(subTabId);
        
        // Salva a sub-aba ativa
        this.salvarEstado();
        
        // Dispara evento
        this.dispatchEvent('subabaAlterada', { subTabId });
        
        console.log(`🔀 Mudou para sub-aba: ${subTabId}`);
    }
    
    inicializarSistemaSubAba(subTabId) {
        switch(subTabId) {
            case VantagensConfig.SUBABAS.ATRIBUTOS_RELACOES:
                this.inicializarSistemaAtributos();
                break;
                
            case VantagensConfig.SUBABAS.CATALOGO_GERAL:
                this.inicializarSistemaCatalogo();
                break;
        }
    }
    
    inicializarSistemaAtributos() {
        if (!VantagensConfig.sistemaAtributos) {
            // Carrega o sistema de atributos se ainda não estiver carregado
            if (typeof initVantagensAtributosTab === 'function') {
                VantagensConfig.sistemaAtributos = initVantagensAtributosTab();
            } else {
                console.error('❌ Sistema de atributos não disponível');
                // Carrega o script se necessário
                this.carregarScript('vantagens-atributos.js');
            }
        }
    }
    
    inicializarSistemaCatalogo() {
        if (!VantagensConfig.sistemaCatalogo) {
            // Aqui inicializaremos o sistema de catálogo
            console.log('📚 Inicializando sistema de catálogo...');
            // VantagensConfig.sistemaCatalogo = new SistemaCatalogo();
        }
    }
    
    // ===========================================
    // CONTROLE DE PONTOS
    // ===========================================
    
    calcularPontosDisponiveis() {
        // Esta função será chamada pelo sistema principal para atualizar os pontos
        // Por enquanto, vamos usar valores padrão
        const pontosTotais = this.obterPontosTotaisPersonagem();
        const pontosGastos = this.calcularPontosGastos();
        
        VantagensConfig.pontosTotaisPersonagem = pontosTotais;
        VantagensConfig.pontosGastos = pontosGastos;
        
        this.atualizarDisplayPontos();
        
        return {
            total: pontosTotais,
            gastos: pontosGastos,
            disponiveis: pontosTotais - pontosGastos
        };
    }
    
    obterPontosTotaisPersonagem() {
        // Tenta obter dos atributos principais
        const atributosTab = document.querySelector('#atributos.tab-content.active');
        if (atributosTab) {
            const pontosGastosElement = atributosTab.querySelector('#pontosGastos');
            if (pontosGastosElement) {
                // Isso é apenas um exemplo - na prática você teria um sistema de pontos total
                return 100; // Pontos iniciais padrão do GURPS
            }
        }
        
        return 100; // Valor padrão
    }
    
    calcularPontosGastos() {
        let totalGastos = 0;
        
        // 1. Pontos gastos em Atributos Complementares
        if (VantagensConfig.sistemaAtributos) {
            const dadosAtributos = VantagensConfig.sistemaAtributos.getDadosParaSalvar();
            totalGastos += dadosAtributos.totais.totalGeral;
        }
        
        // 2. Pontos gastos no Catálogo (será implementado)
        if (VantagensConfig.sistemaCatalogo) {
            // totalGastos += VantagensConfig.sistemaCatalogo.getPontosGastos();
        }
        
        // 3. Pontos gastos em Peculiaridades (será implementado)
        const peculiaridades = document.querySelectorAll('.peculiaridade-item');
        totalGastos -= peculiaridades.length; // Cada peculiaridade custa -1 ponto
        
        return totalGastos;
    }
    
    atualizarDisplayPontos() {
        const pontosDisponiveis = VantagensConfig.pontosTotaisPersonagem - VantagensConfig.pontosGastos;
        
        // Atualiza display na aba de vantagens
        const displayPontos = document.getElementById('displayPontosVantagens');
        if (displayPontos) {
            displayPontos.innerHTML = `
                <div class="pontos-resumo">
                    <div class="ponto-item">
                        <span>Total:</span>
                        <strong>${VantagensConfig.pontosTotaisPersonagem}</strong>
                    </div>
                    <div class="ponto-item">
                        <span>Gastos:</span>
                        <strong class="${VantagensConfig.pontosGastos > 0 ? 'negativo' : 'positivo'}">
                            ${VantagensConfig.pontosGastos > 0 ? '+' : ''}${VantagensConfig.pontosGastos}
                        </strong>
                    </div>
                    <div class="ponto-item total">
                        <span>Disponíveis:</span>
                        <strong class="${pontosDisponiveis >= 0 ? 'positivo' : 'negativo'}">
                            ${pontosDisponiveis}
                        </strong>
                    </div>
                </div>
            `;
        }
        
        // Adiciona classe de aviso se pontos negativos
        if (pontosDisponiveis < 0) {
            document.body.classList.add('pontos-negativos');
        } else {
            document.body.classList.remove('pontos-negativos');
        }
    }
    
    // ===========================================
    // EVENT LISTENERS E INTEGRAÇÃO
    // ===========================================
    
    setupEventListeners() {
        // Escuta alterações nos atributos
        document.addEventListener('vantagensAlteradas', () => {
            this.calcularPontosDisponiveis();
            this.salvarEstado();
        });
        
        // Escuta mudanças na aba principal
        document.addEventListener('tabChanged', (event) => {
            if (event.detail.tabId === 'vantagens') {
                this.onAbaVantagensAtivada();
            }
        });
        
        // Botão de reset
        const btnReset = document.getElementById('btnResetVantagens');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetarTudo());
        }
        
        // Botão de salvar
        const btnSalvar = document.getElementById('btnSalvarVantagens');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => this.salvarTudo());
        }
        
        // Integração com o sistema de abas principal
        window.addEventListener('switchTab', (event) => {
            if (event.detail === 'vantagens') {
                this.onAbaVantagensAtivada();
            }
        });
    }
    
    onAbaVantagensAtivada() {
        console.log('🎯 Aba de Vantagens ativada');
        
        // Recarrega configurações
        this.carregarConfiguracoes();
        
        // Atualiza pontos
        this.calcularPontosDisponiveis();
        
        // Garante que a sub-aba correta está ativa
        if (VantagensConfig.abaAtiva) {
            this.switchSubTab(VantagensConfig.abaAtiva);
        }
        
        // Inicializa sistemas se necessário
        this.inicializarSistemas();
        
        this.dispatchEvent('vantagensAtivada');
    }
    
    inicializarSistemas() {
        // Inicializa todos os sistemas necessários
        this.inicializarSistemaAtributos();
        this.inicializarSistemaCatalogo();
    }
    
    // ===========================================
    // PERSISTÊNCIA E ESTADO
    // ===========================================
    
    carregarConfiguracoes() {
        try {
            const config = localStorage.getItem('vantagensConfig');
            if (config) {
                const parsed = JSON.parse(config);
                
                // Restaura sub-aba ativa
                if (parsed.abaAtiva) {
                    VantagensConfig.abaAtiva = parsed.abaAtiva;
                }
                
                // Restaura outros estados se necessário
                console.log('⚙️ Configurações de Vantagens carregadas');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
        }
    }
    
    salvarEstado() {
        const estado = {
            abaAtiva: VantagensConfig.abaAtiva,
            pontosTotais: VantagensConfig.pontosTotaisPersonagem,
            pontosGastos: VantagensConfig.pontosGastos,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vantagensEstado', JSON.stringify(estado));
        
        // Salva no sistema principal se disponível
        this.salvarNoSistemaPrincipal();
    }
    
    salvarNoSistemaPrincipal() {
        // Integração com o sistema principal do personagem
        if (typeof window.saveCharacterData === 'function') {
            const dadosVantagens = this.getDadosCompletos();
            window.saveCharacterData('vantagens', dadosVantagens);
        }
    }
    
    getDadosCompletos() {
        const dados = {
            config: VantagensConfig,
            estado: {
                abaAtiva: VantagensConfig.abaAtiva,
                pontosTotais: VantagensConfig.pontosTotaisPersonagem,
                pontosGastos: VantagensConfig.pontosGastos
            }
        };
        
        // Adiciona dados dos sistemas específicos
        if (VantagensConfig.sistemaAtributos) {
            dados.atributos = VantagensConfig.sistemaAtributos.getDadosParaSalvar();
        }
        
        if (VantagensConfig.sistemaCatalogo) {
            // dados.catalogo = VantagensConfig.sistemaCatalogo.getDados();
        }
        
        return dados;
    }
    
    // ===========================================
    // CONTROLE DE SCRIPTS DINÂMICOS
    // ===========================================
    
    carregarScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    dispatchEvent(eventName, detail = {}) {
        const evento = new CustomEvent(eventName, { detail });
        document.dispatchEvent(evento);
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Usa o sistema de notificação existente
        if (typeof window.showToast === 'function') {
            window.showToast(mensagem, tipo);
        } else {
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    }
    
    // ===========================================
    // AÇÕES DO USUÁRIO
    // ===========================================
    
    resetarTudo() {
        if (!confirm('Tem certeza que deseja resetar TODAS as vantagens, desvantagens e peculiaridades?')) {
            return;
        }
        
        // Reseta sistema de atributos
        if (VantagensConfig.sistemaAtributos) {
            VantagensConfig.sistemaAtributos.resetar();
        }
        
        // Reseta sistema de catálogo
        if (VantagensConfig.sistemaCatalogo) {
            // VantagensConfig.sistemaCatalogo.resetar();
        }
        
        // Limpa peculiaridades
        document.querySelectorAll('.peculiaridade-item').forEach(item => item.remove());
        
        // Limpa localStorage
        localStorage.removeItem('vantagensEstado');
        localStorage.removeItem('vantagensConfig');
        
        // Atualiza pontos
        this.calcularPontosDisponiveis();
        
        this.mostrarNotificacao('✅ Todas as vantagens foram resetadas', 'success');
        
        this.dispatchEvent('vantagensResetadas');
    }
    
    salvarTudo() {
        // Salva estado local
        this.salvarEstado();
        
        // Salva no Firebase se disponível
        if (window.currentCharacterId && window.db) {
            this.salvarNoFirebase(window.currentCharacterId)
                .then(() => {
                    this.mostrarNotificacao('💾 Vantagens salvas com sucesso!', 'success');
                })
                .catch(error => {
                    this.mostrarNotificacao('❌ Erro ao salvar no servidor', 'error');
                    console.error('Erro ao salvar no Firebase:', error);
                });
        } else {
            this.mostrarNotificacao('💾 Dados salvos localmente', 'info');
        }
    }
    
    salvarNoFirebase(characterId) {
        if (!characterId || !window.db) {
            return Promise.reject('Firebase não disponível');
        }
        
        const dadosCompletos = this.getDadosCompletos();
        
        return window.db.collection('characters').doc(characterId).update({
            'vantagens': dadosCompletos,
            'lastUpdated': new Date().toISOString()
        });
    }
    
    // ===========================================
    // INTEGRAÇÃO COM SISTEMA PRINCIPAL
    // ===========================================
    
    exportarParaFicha() {
        const dados = this.getDadosCompletos();
        
        // Formata para a ficha final
        const fichaFormatada = {
            atributosComplementares: this.formatarAtributosParaFicha(),
            statusReputacao: this.formatarStatusParaFicha(),
            vantagens: this.formatarVantagensParaFicha(),
            desvantagens: this.formatarDesvantagensParaFicha(),
            peculiaridades: this.formatarPeculiaridadesParaFicha(),
            pontos: {
                total: VantagensConfig.pontosTotaisPersonagem,
                gastos: VantagensConfig.pontosGastos,
                disponiveis: VantagensConfig.pontosTotaisPersonagem - VantagensConfig.pontosGastos
            }
        };
        
        return fichaFormatada;
    }
    
    formatarAtributosParaFicha() {
        if (!VantagensConfig.sistemaAtributos) return [];
        
        const dados = VantagensConfig.sistemaAtributos.getDadosParaSalvar();
        const formatados = [];
        
        Object.entries(dados.atributos).forEach(([tipo, atributo]) => {
            if (atributo.direcao) {
                formatados.push({
                    nome: atributo.nome,
                    tipo: atributo.direcao === 'positivo' ? 'Vantagem' : 'Desvantagem',
                    nivel: Math.abs(atributo.nivel),
                    custo: Math.abs(atributo.nivel) * atributo.custoPorNivel * 
                           (atributo.direcao === 'positivo' ? 1 : -1),
                    descricao: atributo.descricao
                });
            }
        });
        
        return formatados;
    }
    
    formatarStatusParaFicha() {
        if (!VantagensConfig.sistemaAtributos) return [];
        
        const dados = VantagensConfig.sistemaAtributos.getDadosParaSalvar();
        const formatados = [];
        
        Object.entries(dados.status).forEach(([tipo, status]) => {
            if (status.direcao !== 'neutro') {
                formatados.push({
                    nome: status.nome,
                    tipo: status.direcao === 'positivo' ? 'Vantagem' : 'Desvantagem',
                    nivel: Math.abs(status.nivel),
                    custo: Math.abs(status.nivel) * status.custoPorNivel * 
                           (status.direcao === 'positivo' ? 1 : -1)
                });
            }
        });
        
        return formatados;
    }
    
    formatarVantagensParaFicha() {
        // Será implementado com o sistema de catálogo
        return [];
    }
    
    formatarDesvantagensParaFicha() {
        // Será implementado com o sistema de catálogo
        return [];
    }
    
    formatarPeculiaridadesParaFicha() {
        const peculiaridades = [];
        document.querySelectorAll('.peculiaridade-item').forEach(item => {
            peculiaridades.push({
                descricao: item.textContent,
                custo: -1
            });
        });
        
        return peculiaridades;
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

let vantagensMainSystem = null;

// Inicializa quando a DOM estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    // Só inicializa se estiver na aba de vantagens
    const vantagensTab = document.getElementById('vantagens');
    if (vantagensTab) {
        vantagensMainSystem = new VantagensMainSystem();
    }
});

// Função para inicialização manual
function initVantagensSystem() {
    if (!vantagensMainSystem) {
        vantagensMainSystem = new VantagensMainSystem();
    }
    return vantagensMainSystem;
}

// Integração com o sistema de abas principal
function onVantagensTabActivated() {
    if (!vantagensMainSystem) {
        vantagensMainSystem = initVantagensSystem();
    }
    
    vantagensMainSystem.onAbaVantagensAtivada();
}

// Exporta para uso global
window.VantagensMainSystem = VantagensMainSystem;
window.initVantagensSystem = initVantagensSystem;
window.onVantagensTabActivated = onVantagensTabActivated;
window.VantagensConfig = VantagensConfig;

// Configura integração automática
if (typeof window.switchTab === 'function') {
    // Monkey patch para detectar quando a aba de vantagens é ativada
    const originalSwitchTab = window.switchTab;
    window.switchTab = function(tabId) {
        originalSwitchTab.call(this, tabId);
        
        if (tabId === 'vantagens') {
            setTimeout(() => {
                onVantagensTabActivated();
            }, 100);
        }
    };
}