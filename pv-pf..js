// pv-pf.js - Sistema COMPLETO de PV e PF baseado em ST e HT
// Funciona com seu atributos.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Carregando sistema PV/PF...');
    
    // Inicializar depois de um breve delay
    setTimeout(inicializarSistemaPVPF, 100);
});

function inicializarSistemaPVPF() {
    console.log('🚀 INICIANDO SISTEMA PV/PF');
    
    // ============================================
    // 1. BUSCAR TODOS OS ELEMENTOS
    // ============================================
    
    const elementos = {
        // --- PV ---
        pvMax: document.getElementById('pvMax'),
        pvAtual: document.getElementById('pvAtual'),
        pvBonus: document.getElementById('pvBonus'),
        pvFill: document.getElementById('pvFill'),
        pvTexto: document.getElementById('pvTexto'),
        marcadorSt: document.getElementById('marcadorSt'),
        
        // --- PF ---
        pfMax: document.getElementById('pfMax'),
        pfAtual: document.getElementById('pfAtual'),
        pfFill: document.getElementById('pfFill'),
        pfTexto: document.getElementById('pfTexto'),
        
        // --- Elementos de atributos (do seu atributos.js) ---
        inputST: document.getElementById('ST'),
        inputHT: document.getElementById('HT'),
        elementoPVTotal: document.getElementById('PVTotal'),  // Onde mostra PV total em atributos
        elementoPFTotal: document.getElementById('PFTotal'),  // Onde mostra PF total em atributos
        
        // --- Botões ---
        pvBotoes: document.querySelectorAll('.pv-btn'),
        pfBotoes: document.querySelectorAll('.pf-btn'),
        
        // --- Visuais ---
        faixas: document.querySelectorAll('.faixa-item'),
        estados: document.querySelectorAll('.estado-item')
    };
    
    // Verificar elementos críticos
    const criticos = ['pvMax', 'pvAtual', 'pvFill', 'pvTexto', 'pfMax', 'pfAtual', 'pfFill', 'pfTexto'];
    for (const id of criticos) {
        if (!elementos[id]) {
            console.error(`❌ ERRO: Elemento ${id} não encontrado!`);
            return;
        }
    }
    
    console.log('✅ Todos elementos encontrados');
    
    // ============================================
    // 2. ESTADO DO SISTEMA
    // ============================================
    
    const estado = {
        pv: {
            max: 10,      // Vem do ST + bônus
            atual: 10,    // Valor atual
            bonus: 0      // Bônus manual
        },
        pf: {
            max: 10,      // Vem do HT + bônus
            atual: 10     // Valor atual
        }
    };
    
    // ============================================
    // 3. FUNÇÕES DE SINCRONIZAÇÃO COM ATRIBUTOS
    // ============================================
    
    function pegarPVDoAtributos() {
        console.log('🔍 Buscando PV dos atributos...');
        
        // MÉTODO 1: Se a função obterDadosAtributos existe
        if (typeof window.obterDadosAtributos === 'function') {
            try {
                const dados = window.obterDadosAtributos();
                if (dados && dados.PV) {
                    console.log('📊 PV do atributos.js:', dados.PV);
                    return dados.PV;
                }
            } catch (e) {
                console.warn('Erro ao usar obterDadosAtributos:', e);
            }
        }
        
        // MÉTODO 2: Pegar do elemento PVTotal
        if (elementos.elementoPVTotal && elementos.elementoPVTotal.textContent) {
            const pv = parseInt(elementos.elementoPVTotal.textContent);
            if (!isNaN(pv) && pv > 0) {
                console.log('📊 PV do elemento PVTotal:', pv);
                return pv;
            }
        }
        
        // MÉTODO 3: Calcular baseado no ST + bônus manual
        if (elementos.inputST) {
            const st = parseInt(elementos.inputST.value) || 10;
            const bonus = elementos.pvBonus ? parseInt(elementos.pvBonus.value) || 0 : 0;
            const pvCalculado = st + bonus;
            console.log('📊 PV calculado (ST + bônus):', pvCalculado);
            return pvCalculado;
        }
        
        // MÉTODO 4: Usar valor padrão
        console.log('⚠️ Usando valor padrão para PV');
        return 10;
    }
    
    function pegarPFDoAtributos() {
        console.log('🔍 Buscando PF dos atributos...');
        
        // MÉTODO 1: Se a função obterDadosAtributos existe
        if (typeof window.obterDadosAtributos === 'function') {
            try {
                const dados = window.obterDadosAtributos();
                if (dados && dados.PF) {
                    console.log('📊 PF do atributos.js:', dados.PF);
                    return dados.PF;
                }
            } catch (e) {
                console.warn('Erro ao usar obterDadosAtributos:', e);
            }
        }
        
        // MÉTODO 2: Pegar do elemento PFTotal
        if (elementos.elementoPFTotal && elementos.elementoPFTotal.textContent) {
            const pf = parseInt(elementos.elementoPFTotal.textContent);
            if (!isNaN(pf) && pf > 0) {
                console.log('📊 PF do elemento PFTotal:', pf);
                return pf;
            }
        }
        
        // MÉTODO 3: Calcular baseado no HT
        if (elementos.inputHT) {
            const ht = parseInt(elementos.inputHT.value) || 10;
            console.log('📊 PF calculado (HT):', ht);
            return ht;
        }
        
        // MÉTODO 4: Usar valor padrão
        console.log('⚠️ Usando valor padrão para PF');
        return 10;
    }
    
    function sincronizarComAtributos() {
        console.log('🔄 Sincronizando com atributos...');
        
        // Pegar PV máximo dos atributos
        const pvMaxAtributos = pegarPVDoAtributos();
        if (pvMaxAtributos && pvMaxAtributos !== estado.pv.max) {
            console.log(`📈 PV máximo mudou: ${estado.pv.max} → ${pvMaxAtributos}`);
            estado.pv.max = pvMaxAtributos;
            
            // Ajustar PV atual se necessário
            if (estado.pv.atual > pvMaxAtributos) {
                estado.pv.atual = pvMaxAtributos;
                console.log(`📉 Ajustando PV atual para: ${estado.pv.atual}`);
            }
        }
        
        // Pegar PF máximo dos atributos
        const pfMaxAtributos = pegarPFDoAtributos();
        if (pfMaxAtributos && pfMaxAtributos !== estado.pf.max) {
            console.log(`📈 PF máximo mudou: ${estado.pf.max} → ${pfMaxAtributos}`);
            estado.pf.max = pfMaxAtributos;
            
            // Ajustar PF atual se necessário
            if (estado.pf.atual > pfMaxAtributos) {
                estado.pf.atual = pfMaxAtributos;
                console.log(`📉 Ajustando PF atual para: ${estado.pf.atual}`);
            }
        }
        
        // Atualizar visual
        atualizarTudo();
    }
    
    // ============================================
    // 4. FUNÇÕES DE ATUALIZAÇÃO VISUAL
    // ============================================
    
    function atualizarPV() {
        console.log('🎨 Atualizando PV visual...');
        
        // Atualizar inputs
        elementos.pvMax.value = estado.pv.max;
        elementos.pvAtual.value = estado.pv.atual;
        elementos.pvBonus.value = estado.pv.bonus;
        
        // Calcular porcentagem
        const porcentagem = (estado.pv.atual / estado.pv.max) * 100;
        const porcentagemLimitada = Math.min(Math.max(porcentagem, 0), 200);
        
        // Atualizar barra
        elementos.pvFill.style.width = `${porcentagemLimitada}%`;
        elementos.pvTexto.textContent = `${estado.pv.atual}/${estado.pv.max}`;
        
        // Atualizar marcador ST
        atualizarMarcadorST();
        
        // Atualizar cor da barra
        atualizarCorBarraPV(porcentagem);
        
        // Atualizar faixas
        atualizarFaixasPV(porcentagem);
    }
    
    function atualizarPF() {
        console.log('🎨 Atualizando PF visual...');
        
        // Atualizar inputs
        elementos.pfMax.value = estado.pf.max;
        elementos.pfAtual.value = estado.pf.atual;
        
        // Calcular porcentagem
        const porcentagem = (estado.pf.atual / estado.pf.max) * 100;
        const porcentagemLimitada = Math.min(Math.max(porcentagem, 0), 200);
        
        // Atualizar barra
        elementos.pfFill.style.width = `${porcentagemLimitada}%`;
        elementos.pfTexto.textContent = `${estado.pf.atual}/${estado.pf.max}`;
        
        // Atualizar cor da barra
        atualizarCorBarraPF(porcentagem);
        
        // Atualizar estados
        atualizarEstadosPF(porcentagem);
    }
    
    function atualizarMarcadorST() {
        if (!elementos.marcadorSt) return;
        
        const stThreshold = Math.floor(estado.pv.max / 2);
        elementos.marcadorSt.textContent = `ST (${stThreshold})`;
        
        // Mover marcador visual
        const marcadores = document.querySelectorAll('.pv-marcador');
        if (marcadores[0]) {
            const posicaoSt = (stThreshold / estado.pv.max) * 100;
            marcadores[0].style.left = `${Math.min(posicaoSt, 100)}%`;
        }
    }
    
    function atualizarCorBarraPV(porcentagem) {
        let cor = '#27ae60'; // Verde
        
        if (porcentagem < 80) cor = '#f1c40f'; // Amarelo
        if (porcentagem < 60) cor = '#e67e22'; // Laranja
        if (porcentagem < 40) cor = '#e74c3c'; // Vermelho
        if (porcentagem < 20) cor = '#9b59b6'; // Roxo
        if (estado.pv.atual <= 0) cor = '#7f8c8d'; // Cinza
        
        elementos.pvFill.style.backgroundColor = cor;
    }
    
    function atualizarCorBarraPF(porcentagem) {
        let cor = '#2ecc71'; // Verde
        
        if (estado.pf.atual < estado.pf.max / 3) cor = '#f1c40f'; // Amarelo
        if (estado.pf.atual <= 0) cor = '#e74c3c'; // Vermelho
        
        elementos.pfFill.style.backgroundColor = cor;
    }
    
    function atualizarFaixasPV(porcentagem) {
        if (!elementos.faixas || elementos.faixas.length === 0) return;
        
        elementos.faixas.forEach((faixa, index) => {
            const limites = [100, 80, 60, 40, 20, 0];
            const limiteMinimo = limites[index];
            
            if (porcentagem >= limiteMinimo) {
                faixa.classList.add('ativa');
            } else {
                faixa.classList.remove('ativa');
            }
        });
    }
    
    function atualizarEstadosPF(porcentagem) {
        if (!elementos.estados || elementos.estados.length === 0) return;
        
        const terco = estado.pf.max / 3;
        let estadoAtivo = 'normal';
        
        if (estado.pf.atual < terco) estadoAtivo = 'fadigado';
        if (estado.pf.atual <= 0) estadoAtivo = 'inconsciente';
        
        elementos.estados.forEach(item => {
            if (item.dataset.estado === estadoAtivo) {
                item.classList.add('ativo');
            } else {
                item.classList.remove('ativo');
            }
        });
    }
    
    function atualizarTudo() {
        console.log('🔄 Atualizando tudo...');
        atualizarPV();
        atualizarPF();
        salvarEstado();
    }
    
    // ============================================
    // 5. FUNÇÕES DE ALTERAÇÃO DE VALORES
    // ============================================
    
    function alterarPV(quantidade) {
        console.log(`➕ Alterando PV: ${quantidade}`);
        
        estado.pv.atual += quantidade;
        
        // Limites
        if (estado.pv.atual < -50) estado.pv.atual = -50;
        if (estado.pv.atual > estado.pv.max * 2) estado.pv.atual = estado.pv.max * 2;
        
        atualizarPV();
        salvarEstado();
    }
    
    function alterarPF(quantidade) {
        console.log(`➕ Alterando PF: ${quantidade}`);
        
        estado.pf.atual += quantidade;
        
        // Limites
        if (estado.pf.atual < -10) estado.pf.atual = -10;
        if (estado.pf.atual > estado.pf.max * 2) estado.pf.atual = estado.pf.max * 2;
        
        atualizarPF();
        salvarEstado();
    }
    
    // ============================================
    // 6. EVENT LISTENERS
    // ============================================
    
    function configurarEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // --- Botões PV ---
        if (elementos.pvBotoes && elementos.pvBotoes.length > 0) {
            elementos.pvBotoes.forEach(btn => {
                btn.addEventListener('click', function() {
                    const quantidade = parseInt(this.dataset.amount) || 1;
                    if (this.classList.contains('plus')) {
                        alterarPV(quantidade);
                    } else {
                        alterarPV(-quantidade);
                    }
                });
            });
        }
        
        // --- Botões PF ---
        if (elementos.pfBotoes && elementos.pfBotoes.length > 0) {
            elementos.pfBotoes.forEach(btn => {
                btn.addEventListener('click', function() {
                    const quantidade = parseInt(this.dataset.amount) || 1;
                    if (this.classList.contains('plus')) {
                        alterarPF(quantidade);
                    } else {
                        alterarPF(-quantidade);
                    }
                });
            });
        }
        
        // --- Inputs PV ---
        elementos.pvMax.addEventListener('change', function() {
            const novoMax = parseInt(this.value) || 1;
            estado.pv.max = novoMax;
            if (estado.pv.atual > novoMax) estado.pv.atual = novoMax;
            atualizarPV();
        });
        
        elementos.pvAtual.addEventListener('change', function() {
            estado.pv.atual = parseInt(this.value) || 0;
            atualizarPV();
        });
        
        elementos.pvBonus.addEventListener('change', function() {
            estado.pv.bonus = parseInt(this.value) || 0;
            sincronizarComAtributos(); // Recalcula com o bônus
        });
        
        // --- Inputs PF ---
        elementos.pfMax.addEventListener('change', function() {
            const novoMax = parseInt(this.value) || 1;
            estado.pf.max = novoMax;
            if (estado.pf.atual > novoMax) estado.pf.atual = novoMax;
            atualizarPF();
        });
        
        elementos.pfAtual.addEventListener('change', function() {
            estado.pf.atual = parseInt(this.value) || 0;
            atualizarPF();
        });
        
        // --- Monitorar mudanças nos atributos ST e HT ---
        if (elementos.inputST) {
            elementos.inputST.addEventListener('change', sincronizarComAtributos);
            elementos.inputST.addEventListener('input', function() {
                setTimeout(sincronizarComAtributos, 300);
            });
        }
        
        if (elementos.inputHT) {
            elementos.inputHT.addEventListener('change', sincronizarComAtributos);
            elementos.inputHT.addEventListener('input', function() {
                setTimeout(sincronizarComAtributos, 300);
            });
        }
        
        // --- Escutar evento do atributos.js ---
        document.addEventListener('atributosAlterados', function() {
            console.log('📢 Evento atributosAlterados recebido!');
            setTimeout(sincronizarComAtributos, 100);
        });
    }
    
    // ============================================
    // 7. PERSISTÊNCIA (LOCAL STORAGE)
    // ============================================
    
    function salvarEstado() {
        try {
            localStorage.setItem('gurps-pv-pf-estado', JSON.stringify(estado));
            console.log('💾 Estado salvo:', estado);
        } catch (e) {
            console.warn('Não foi possível salvar estado:', e);
        }
    }
    
    function carregarEstado() {
        try {
            const salvo = localStorage.getItem('gurps-pv-pf-estado');
            if (salvo) {
                const dados = JSON.parse(salvo);
                
                if (dados.pv) {
                    estado.pv.max = dados.pv.max || estado.pv.max;
                    estado.pv.atual = dados.pv.atual || estado.pv.atual;
                    estado.pv.bonus = dados.pv.bonus || estado.pv.bonus;
                }
                
                if (dados.pf) {
                    estado.pf.max = dados.pf.max || estado.pf.max;
                    estado.pf.atual = dados.pf.atual || estado.pf.atual;
                }
                
                console.log('📂 Estado carregado:', estado);
                return true;
            }
        } catch (e) {
            console.warn('Não foi possível carregar estado:', e);
        }
        return false;
    }
    
    // ============================================
    // 8. INICIALIZAÇÃO FINAL
    // ============================================
    
    function iniciar() {
        console.log('⚡ Iniciando sistema...');
        
        // 1. Carregar estado salvo
        carregarEstado();
        
        // 2. Configurar eventos
        configurarEventListeners();
        
        // 3. Sincronizar com atributos
        sincronizarComAtributos();
        
        // 4. Atualizar tudo
        atualizarTudo();
        
        console.log('✅ SISTEMA PV/PF INICIALIZADO COM SUCESSO!');
        console.log('Estado final:', estado);
        
        // 5. Verificar se está na aba de Combate
        verificarAbaAtiva();
    }
    
    // Verificar periodicamente se a aba está ativa
    function verificarAbaAtiva() {
        const combateTab = document.getElementById('combate');
        if (combateTab && combateTab.classList.contains('active')) {
            console.log('🎯 Aba Combate está ativa');
        }
    }
    
    // ============================================
    // 9. EXPORTAÇÃO PARA USO GLOBAL
    // ============================================
    
    // Adicionar funções ao objeto global para debug
    window.pvpfSistema = {
        estado: estado,
        atualizarTudo: atualizarTudo,
        sincronizarComAtributos: sincronizarComAtributos,
        alterarPV: alterarPV,
        alterarPF: alterarPF,
        pegarPVDoAtributos: pegarPVDoAtributos,
        pegarPFDoAtributos: pegarPFDoAtributos
    };
    
    // ============================================
    // 10. INICIAR O SISTEMA
    // ============================================
    
    iniciar();
}

// Função para forçar recarregamento (útil para debug)
window.recarregarPVPF = inicializarSistemaPVPF;

console.log('📦 pv-pf.js carregado e pronto!');