// defesas.js - VERSÃO COMPLETA E BRABA QUE RESPEITA O QUE JÁ FUNCIONA
class SistemaDefesasBrabo {
    constructor() {
        console.log('💪 SISTEMA DE DEFESAS BRABO INICIADO!');
        this.iniciado = false;
        this.cache = {
            dx: 10,
            ht: 10,
            nhEscudo: null,
            nhArma: null,
            armaEquipada: null
        };
        
        // Intercepta as funções existentes sem quebrar nada
        this.interceptarFuncoesExistentes();
    }
    
    interceptarFuncoesExistentes() {
        console.log('🔧 Interceptando funções existentes...');
        
        // Guarda as funções originais
        this.funcoesOriginais = {};
        
        // Intercepta a função que calcula esquiva (se existir)
        if (typeof window.atualizarEsquiva === 'function') {
            this.funcoesOriginais.atualizarEsquiva = window.atualizarEsquiva;
        }
        
        // Intercepta a função que calcula deslocamento (se existir)
        if (typeof window.atualizarDeslocamento === 'function') {
            this.funcoesOriginais.atualizarDeslocamento = window.atualizarDeslocamento;
        }
    }
    
    iniciar() {
        if (this.iniciado) return;
        console.log('🚀 INICIANDO SISTEMA BRABO!');
        
        // 1. Configurar listeners manuais
        this.configurarListenersBrabo();
        
        // 2. Configurar monitoramento
        this.configurarMonitoramentoBrabo();
        
        // 3. Aplicar correções iniciais
        this.aplicarCorrecoesImediatas();
        
        // 4. Forçar atualização periódica (só pra garantir)
        this.iniciarAtualizacaoPeriodica();
        
        this.iniciado = true;
        console.log('✅ SISTEMA BRABO PRONTO PARA AÇÂO!');
    }
    
    configurarListenersBrabo() {
        console.log('👂 Configurando listeners brabo...');
        
        // Listener para botões de modificador
        document.querySelectorAll('.defesa-modificador').forEach(container => {
            const minus = container.querySelector('.minus, .mod-btn.minus');
            const plus = container.querySelector('.plus, .mod-btn.plus');
            const input = container.querySelector('input');
            
            if (minus && plus && input) {
                // Adiciona funcionalidade extra sem remover a existente
                const originalMinusClick = minus.onclick;
                const originalPlusClick = plus.onclick;
                
                minus.onclick = (e) => {
                    if (originalMinusClick) originalMinusClick(e);
                    setTimeout(() => this.atualizarTudo(), 100);
                };
                
                plus.onclick = (e) => {
                    if (originalPlusClick) originalPlusClick(e);
                    setTimeout(() => this.atualizarTudo(), 100);
                };
                
                input.addEventListener('change', () => {
                    setTimeout(() => this.atualizarTudo(), 100);
                });
            }
        });
        
        // Listener para bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                input.addEventListener('change', () => this.atualizarTudo());
                input.addEventListener('input', () => this.atualizarTudo());
            }
        });
    }
    
    configurarMonitoramentoBrabo() {
        console.log('👁️‍🗨️ Monitoramento brabo ativado...');
        
        // Monitora DX e HT
        this.monitorarAtributo('DX');
        this.monitorarAtributo('HT');
        
        // Monitora nível de carga
        this.monitorarElemento('nivelCarga', () => this.atualizarTudo());
        
        // Monitora mudanças na arma equipada
        this.monitorarArmaEquipada();
        
        // Monitora mudanças nas perícias
        this.monitorarPericias();
    }
    
    monitorarAtributo(atributo) {
        const input = document.getElementById(atributo);
        if (!input) return;
        
        let valorAnterior = input.value;
        
        const observer = new MutationObserver(() => {
            if (input.value !== valorAnterior) {
                valorAnterior = input.value;
                console.log(`🎯 ${atributo} mudou para: ${input.value}`);
                this.cache[atributo.toLowerCase()] = parseInt(input.value) || 10;
                this.atualizarTudo();
            }
        });
        
        observer.observe(input, { attributes: true });
        
        // Também escuta input events
        input.addEventListener('input', () => {
            setTimeout(() => {
                this.cache[atributo.toLowerCase()] = parseInt(input.value) || 10;
                this.atualizarTudo();
            }, 300);
        });
    }
    
    monitorarElemento(id, callback) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        
        const observer = new MutationObserver(callback);
        observer.observe(elemento, { 
            childList: true, 
            characterData: true,
            subtree: true 
        });
    }
    
    monitorarArmaEquipada() {
        const armaInfo = document.getElementById('armaInfo');
        if (!armaInfo) return;
        
        const observer = new MutationObserver(() => {
            this.cache.armaEquipada = null;
            this.cache.nhArma = null;
            setTimeout(() => this.atualizarAparar(), 300);
        });
        
        observer.observe(armaInfo, { 
            childList: true, 
            attributes: true,
            subtree: true 
        });
    }
    
    monitorarPericias() {
        // Verifica mudanças no container de perícias
        const container = document.getElementById('pericias-aprendidas');
        if (!container) return;
        
        const observer = new MutationObserver(() => {
            console.log('📚 Perícias atualizadas!');
            this.cache.nhEscudo = null;
            this.cache.nhArma = null;
            setTimeout(() => {
                this.atualizarBloqueio();
                this.atualizarAparar();
            }, 500);
        });
        
        observer.observe(container, { 
            childList: true, 
            subtree: true 
        });
        
        // Também monitora mudanças no localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'periciasAprendidas') {
                this.cache.nhEscudo = null;
                this.cache.nhArma = null;
                setTimeout(() => this.atualizarTudo(), 300);
            }
        });
    }
    
    // ===== FUNÇÕES BRABAS DE BUSCA =====
    buscarNHEscudoBrabo() {
        if (this.cache.nhEscudo !== null) {
            return this.cache.nhEscudo;
        }
        
        console.log('🔍 Buscando NH do Escudo BRABO...');
        const dx = this.cache.dx || 10;
        
        // Método 1: Buscar na lista de perícias aprendidas
        let nivelEscudo = 0;
        let encontrou = false;
        
        const itensPericia = document.querySelectorAll('.pericia-aprendida-item');
        for (let item of itensPericia) {
            const nomeElement = item.querySelector('.pericia-aprendida-nome');
            if (nomeElement && nomeElement.textContent.toLowerCase().includes('escudo')) {
                const nivelElement = item.querySelector('.pericia-aprendida-nivel');
                if (nivelElement) {
                    const texto = nivelElement.textContent.replace('+', '');
                    nivelEscudo = parseInt(texto) || 0;
                    encontrou = true;
                    break;
                }
            }
        }
        
        if (encontrou) {
            const nh = dx + nivelEscudo;
            console.log(`✅ NH do Escudo: ${nh} (DX ${dx} + nível ${nivelEscudo})`);
            this.cache.nhEscudo = nh;
            return nh;
        }
        
        // Método 2: Verificar se tem perícia de Escudo aprendida
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const escudoPericia = pericias.find(p => 
                    p.nome && p.nome.toLowerCase().includes('escudo')
                );
                
                if (escudoPericia) {
                    const nh = dx + (escudoPericia.nivel || 0);
                    console.log(`✅ NH do Escudo (localStorage): ${nh}`);
                    this.cache.nhEscudo = nh;
                    return nh;
                }
            }
        } catch (e) {
            // Ignora erro
        }
        
        // Se não encontrou, usa valor mínimo
        console.log('⚠️ Usando NH mínimo para Escudo');
        this.cache.nhEscudo = dx; // DX sem bônus
        return dx;
    }
    
    buscarNHArmaBrabo() {
        if (this.cache.nhArma !== null) {
            return this.cache.nhArma;
        }
        
        console.log('🔍 Buscando NH da Arma BRABO...');
        
        // Descobrir qual arma está equipada
        const arma = this.descobrirArmaEquipadaBrabo();
        if (!arma) {
            console.log('❌ Nenhuma arma equipada');
            this.cache.nhArma = 0;
            return 0;
        }
        
        console.log(`⚔️ Arma encontrada: ${arma.nome}`);
        const dx = this.cache.dx || 10;
        
        // Procurar perícia correspondente
        let nivelArma = 0;
        let encontrou = false;
        
        // Primeiro busca nas perícias aprendidas visíveis
        const itensPericia = document.querySelectorAll('.pericia-aprendida-item');
        for (let item of itensPericia) {
            const nomeElement = item.querySelector('.pericia-aprendida-nome');
            if (nomeElement) {
                const nomePericia = nomeElement.textContent.toLowerCase();
                const nomeArma = arma.nome.toLowerCase();
                
                // Verifica correspondência
                if (this.periciaCorrespondeArma(nomePericia, nomeArma)) {
                    const nivelElement = item.querySelector('.pericia-aprendida-nivel');
                    if (nivelElement) {
                        const texto = nivelElement.textContent.replace('+', '');
                        nivelArma = parseInt(texto) || 0;
                        encontrou = true;
                        break;
                    }
                }
            }
        }
        
        if (!encontrou) {
            // Tenta no localStorage
            try {
                const salvo = localStorage.getItem('periciasAprendidas');
                if (salvo) {
                    const pericias = JSON.parse(salvo);
                    const armaLower = arma.nome.toLowerCase();
                    
                    for (let pericia of pericias) {
                        if (pericia.nome && this.periciaCorrespondeArma(pericia.nome.toLowerCase(), armaLower)) {
                            nivelArma = pericia.nivel || 0;
                            encontrou = true;
                            break;
                        }
                    }
                }
            } catch (e) {
                // Ignora erro
            }
        }
        
        if (encontrou) {
            const nh = dx + nivelArma;
            console.log(`✅ NH da Arma: ${nh} (DX ${dx} + nível ${nivelArma})`);
            this.cache.nhArma = nh;
            return nh;
        }
        
        console.log('⚠️ Arma sem perícia aprendida');
        this.cache.nhArma = dx; // DX sem bônus
        return dx;
    }
    
    descobrirArmaEquipadaBrabo() {
        // Método 1: Verificar na aba de combate
        const comArma = document.getElementById('comArma');
        if (comArma && comArma.style.display !== 'none') {
            const nomeElement = comArma.querySelector('.arma-nome');
            if (nomeElement) {
                return {
                    nome: nomeElement.textContent || 'Arma Desconhecida',
                    elemento: comArma
                };
            }
        }
        
        // Método 2: Procurar por itens equipados
        const itensEquipados = document.querySelectorAll('[class*="equipado"], [class*="equipada"]');
        for (let item of itensEquipados) {
            const texto = item.textContent || '';
            if (texto.includes('Espada') || texto.includes('Adaga') || texto.includes('Machado') ||
                texto.includes('Arco') || texto.includes('Lança') || texto.includes('Maça') ||
                texto.includes('Faca') || texto.includes('Sabre') || texto.includes('Besta')) {
                return {
                    nome: texto.split('\n')[0] || 'Arma Equipada',
                    elemento: item
                };
            }
        }
        
        return null;
    }
    
    periciaCorrespondeArma(nomePericia, nomeArma) {
        // Mapeamento simples e direto
        const mapeamento = {
            'adaga': ['adaga', 'faca'],
            'espada': ['espada', 'sabre', 'lâmina', 'rapieira', 'terçado'],
            'arco': ['arco', 'besta', 'funda'],
            'machado': ['machado'],
            'maça': ['maça', 'martelo'],
            'lanca': ['lança', 'bastão', 'haste'],
            'escudo': ['escudo']
        };
        
        nomePericia = nomePericia.toLowerCase();
        nomeArma = nomeArma.toLowerCase();
        
        for (let [pericia, armas] of Object.entries(mapeamento)) {
            if (nomePericia.includes(pericia)) {
                for (let arma of armas) {
                    if (nomeArma.includes(arma)) {
                        return true;
                    }
                }
            }
        }
        
        // Fallback: verificar palavras em comum
        const palavrasPericia = nomePericia.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
        const palavrasArma = nomeArma.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
        
        for (let p of palavrasPericia) {
            if (p.length > 3) {
                for (let a of palavrasArma) {
                    if (a.length > 3 && (p.includes(a) || a.includes(p))) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // ===== FUNÇÕES DE ATUALIZAÇÃO =====
    atualizarTudo() {
        console.log('🔄 ATUALIZANDO TUDO BRABO!');
        
        // Atualizar cache de atributos
        this.atualizarCacheAtributos();
        
        // Atualizar cada defesa
        this.atualizarEsquiva();
        this.atualizarDeslocamento();
        this.atualizarBloqueio();
        this.atualizarAparar();
        this.atualizarBonusTotal();
        
        console.log('✅ TUDO ATUALIZADO!');
    }
    
    atualizarCacheAtributos() {
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) this.cache.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.cache.ht = parseInt(htInput.value) || 10;
    }
    
    atualizarEsquiva() {
        // Deixa a função original trabalhar, depois ajusta se necessário
        if (this.funcoesOriginais.atualizarEsquiva) {
            this.funcoesOriginais.atualizarEsquiva();
        }
        
        // Se não tem função original, calcula aqui
        const esquivaTotal = document.getElementById('esquivaTotal');
        if (!esquivaTotal) return;
        
        // Fórmula: floor((DX + HT)/4) + 3
        const base = Math.floor((this.cache.dx + this.cache.ht) / 4) + 3;
        
        // Pega modificador
        const modInput = document.getElementById('esquivaMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Pega bônus
        const bonusReflexos = parseInt(document.getElementById('bonusReflexos')?.value) || 0;
        const bonusOutros = parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        // Pega redutor de carga
        const nivelCarga = document.getElementById('nivelCarga')?.textContent.toLowerCase() || 'nenhuma';
        const redutores = {
            'nenhuma': 0, 'leve': -1, 'média': -2, 'pesada': -3, 'muito pesada': -4
        };
        const redutor = redutores[nivelCarga] || 0;
        
        // Calcula total
        const total = base + modificador + bonusReflexos + bonusOutros + redutor;
        
        // Atualiza
        esquivaTotal.textContent = Math.max(total, 1);
    }
    
    atualizarDeslocamento() {
        // Deixa a função original trabalhar
        if (this.funcoesOriginais.atualizarDeslocamento) {
            this.funcoesOriginais.atualizarDeslocamento();
            return;
        }
        
        const deslocamentoTotal = document.getElementById('deslocamentoTotal');
        if (!deslocamentoTotal) return;
        
        // Fórmula: (DX + HT)/4
        const base = (this.cache.dx + this.cache.ht) / 4;
        
        // Pega modificador
        const modInput = document.getElementById('deslocamentoMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Pega bônus
        const bonusOutros = parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        // Pega redutor de carga
        const nivelCarga = document.getElementById('nivelCarga')?.textContent.toLowerCase() || 'nenhuma';
        const redutores = {
            'nenhuma': 0, 'leve': -1, 'média': -2, 'pesada': -3, 'muito pesada': -4
        };
        const redutor = redutores[nivelCarga] || 0;
        
        // Calcula total
        const total = base + modificador + bonusOutros + redutor;
        
        // Atualiza
        deslocamentoTotal.textContent = total.toFixed(2);
    }
    
    atualizarBloqueio() {
        const bloqueioTotal = document.getElementById('bloqueioTotal');
        if (!bloqueioTotal) return;
        
        // Busca NH do Escudo
        const nhEscudo = this.buscarNHEscudoBrabo();
        
        // Fórmula: floor(NH/2) + 3
        const base = Math.floor(nhEscudo / 2) + 3;
        
        // Pega modificador
        const modInput = document.getElementById('bloqueioMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Pega bônus do escudo
        const bonusEscudo = parseInt(document.getElementById('bonusEscudo')?.value) || 0;
        const bonusOutros = parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        // Calcula total
        const total = base + modificador + bonusEscudo + bonusOutros;
        
        // Atualiza
        bloqueioTotal.textContent = Math.max(total, 1);
        console.log(`🛡️ Bloqueio: ${total} (NH: ${nhEscudo}, base: ${base})`);
    }
    
    atualizarAparar() {
        const apararTotal = document.getElementById('apararTotal');
        if (!apararTotal) return;
        
        // Busca NH da Arma
        const nhArma = this.buscarNHArmaBrabo();
        
        if (nhArma === 0) {
            // Nenhuma arma equipada ou sem perícia
            apararTotal.textContent = '0';
            return;
        }
        
        // Fórmula: floor(NH/2) + 3
        const base = Math.floor(nhArma / 2) + 3;
        
        // Pega modificador
        const modInput = document.getElementById('apararMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Pega bônus
        const bonusOutros = parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        // Calcula total
        const total = base + modificador + bonusOutros;
        
        // Atualiza
        apararTotal.textContent = Math.max(total, 1);
        console.log(`⚔️ Aparar: ${total} (NH: ${nhArma}, base: ${base})`);
    }
    
    atualizarBonusTotal() {
        const totalElement = document.getElementById('totalBonus');
        if (!totalElement) return;
        
        let total = 0;
        total += parseInt(document.getElementById('bonusReflexos')?.value) || 0;
        total += parseInt(document.getElementById('bonusEscudo')?.value) || 0;
        total += parseInt(document.getElementById('bonusCapa')?.value) || 0;
        total += parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
    }
    
    // ===== INICIALIZAÇÃO PERIÓDICA =====
    iniciarAtualizacaoPeriodica() {
        // Atualiza a cada 3 segundos só pra garantir
        setInterval(() => {
            this.atualizarTudo();
        }, 3000);
    }
    
    aplicarCorrecoesImediatas() {
        console.log('🔧 Aplicando correções imediatas...');
        
        // Força primeira atualização
        setTimeout(() => {
            this.atualizarTudo();
        }, 1500);
        
        // Segunda atualização depois de mais tempo
        setTimeout(() => {
            this.atualizarTudo();
        }, 3000);
    }
    
    // ===== FUNÇÕES PÚBLICAS =====
    testar() {
        console.log('🧪 TESTE BRABO INICIADO!');
        console.log('Cache:', this.cache);
        console.log('DX:', this.cache.dx);
        console.log('HT:', this.cache.ht);
        console.log('NH Escudo:', this.buscarNHEscudoBrabo());
        console.log('NH Arma:', this.buscarNHArmaBrabo());
        console.log('Arma Equipada:', this.descobrirArmaEquipadaBrabo());
        console.log('🧪 TESTE BRABO CONCLUÍDO!');
    }
    
    resetarCache() {
        console.log('🗑️ Resetando cache...');
        this.cache.nhEscudo = null;
        this.cache.nhArma = null;
        this.cache.armaEquipada = null;
        this.atualizarTudo();
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
let sistemaBrabo;

function iniciarSistemaBrabo() {
    if (!sistemaBrabo) {
        sistemaBrabo = new SistemaDefesasBrabo();
        window.sistemaDefesasBrabo = sistemaBrabo;
        
        // Espera a página carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => sistemaBrabo.iniciar(), 1000);
            });
        } else {
            setTimeout(() => sistemaBrabo.iniciar(), 1000);
        }
    }
    return sistemaBrabo;
}

// Inicia quando a aba de combate é aberta
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(() => iniciarSistemaBrabo(), 500);
    }
    
    // Observa mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(() => iniciarSistemaBrabo(), 300);
                }
            }
        });
    });
    
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ===== FUNÇÕES GLOBAIS (para debug) =====
window.testarSistemaBrabo = function() {
    if (!window.sistemaDefesasBrabo) {
        console.log('❌ Sistema não iniciado. Iniciando...');
        iniciarSistemaBrabo();
        return;
    }
    window.sistemaDefesasBrabo.testar();
};

window.forcarAtualizacaoBraba = function() {
    if (window.sistemaDefesasBrabo) {
        window.sistemaDefesasBrabo.atualizarTudo();
        console.log('💥 ATUALIZAÇÃO FORÇADA!');
    }
};

window.resetarCacheBrabo = function() {
    if (window.sistemaDefesasBrabo) {
        window.sistemaDefesasBrabo.resetarCache();
    }
};

console.log('💪 SISTEMA DE DEFESAS BRABO CARREGADO E PRONTO!');