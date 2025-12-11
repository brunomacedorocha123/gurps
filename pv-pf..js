// pv-pf.js - Sistema COMPLETO de PV e PF baseado em ST e HT

document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando sistema PV/PF...');
    
    // Esperar atributos.js carregar
    setTimeout(inicializarSistemaPVPF, 300);
});

function inicializarSistemaPVPF() {
    console.log('Inicializando sistema PV/PF...');
    
    // === 1. ELEMENTOS - VERIFICAR SE EXISTEM ===
    const elementos = {
        pvMax: document.getElementById('pvMax'),
        pvAtual: document.getElementById('pvAtual'),
        pvBonus: document.getElementById('pvBonus'),
        pvFill: document.getElementById('pvFill'),
        pvTexto: document.getElementById('pvTexto'),
        marcadorSt: document.getElementById('marcadorSt'),
        pfMax: document.getElementById('pfMax'),
        pfAtual: document.getElementById('pfAtual'),
        pfFill: document.getElementById('pfFill'),
        pfTexto: document.getElementById('pfTexto')
    };
    
    // Verificar elementos críticos
    const elementosCriticos = ['pvMax', 'pvAtual', 'pvFill', 'pvTexto', 'pfMax', 'pfAtual', 'pfFill', 'pfTexto'];
    for (const id of elementosCriticos) {
        if (!elementos[id]) {
            console.error(`❌ Elemento não encontrado: ${id}`);
            return; // Para aqui se elemento crítico não existir
        }
    }
    
    console.log('✅ Todos elementos encontrados!');
    
    // Elementos opcionais
    elementos.pvBotoes = document.querySelectorAll('.pv-btn');
    elementos.pfBotoes = document.querySelectorAll('.pf-btn');
    elementos.faixas = document.querySelectorAll('.faixa-item');
    elementos.estados = document.querySelectorAll('.estado-item');
    
    // === 2. ESTADO DO PERSONAGEM ===
    const estado = {
        pv: { max: 10, atual: 10, bonus: 0 },
        pf: { max: 10, atual: 10 }
    };
    
    // === 3. FUNÇÕES AUXILIARES ===
    
    function atualizarPV() {
        console.log('Atualizando PV:', estado.pv);
        
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
        
        salvarEstado();
    }
    
    function atualizarPF() {
        console.log('Atualizando PF:', estado.pf);
        
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
        
        salvarEstado();
    }
    
    function atualizarMarcadorST() {
        if (!elementos.marcadorSt) return;
        
        const stThreshold = Math.floor(estado.pv.max / 2);
        elementos.marcadorSt.textContent = `ST (${stThreshold})`;
        
        // Mover marcador visual
        const marcador = document.querySelector('.pv-marcador[style*="left: 0%"]');
        if (marcador) {
            const posicaoSt = (stThreshold / estado.pv.max) * 100;
            marcador.style.left = `${Math.min(posicaoSt, 100)}%`;
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
    
    // === 4. FUNÇÕES DE ALTERAÇÃO ===
    
    function alterarPV(quantidade) {
        estado.pv.atual += quantidade;
        
        // Limites
        if (estado.pv.atual < -50) estado.pv.atual = -50;
        if (estado.pv.atual > estado.pv.max * 2) estado.pv.atual = estado.pv.max * 2;
        
        atualizarPV();
    }
    
    function alterarPF(quantidade) {
        estado.pf.atual += quantidade;
        
        // Limites
        if (estado.pf.atual < -10) estado.pf.atual = -10;
        if (estado.pf.atual > estado.pf.max * 2) estado.pf.atual = estado.pf.max * 2;
        
        atualizarPF();
    }
    
    // === 5. SINCRONIZAÇÃO COM ATRIBUTOS ===
    
    function sincronizarComAtributos() {
        console.log('Sincronizando com atributos...');
        
        // Método 1: Usar função do atributos.js
        if (window.obterDadosAtributos) {
            const dados = window.obterDadosAtributos();
            
            if (dados.PV && dados.PV !== estado.pv.max) {
                console.log('PV do atributos.js:', dados.PV);
                estado.pv.max = dados.PV;
                if (estado.pv.atual > dados.PV) estado.pv.atual = dados.PV;
            }
            
            if (dados.PF && dados.PF !== estado.pf.max) {
                console.log('PF do atributos.js:', dados.PF);
                estado.pf.max = dados.PF;
                if (estado.pf.atual > dados.PF) estado.pf.atual = dados.PF;
            }
        } 
        // Método 2: Pegar direto dos elementos
        else {
            const pvTotalElem = document.getElementById('PVTotal');
            const pfTotalElem = document.getElementById('PFTotal');
            
            if (pvTotalElem && pvTotalElem.textContent) {
                const pv = parseInt(pvTotalElem.textContent);
                if (!isNaN(pv) && pv > 0) {
                    estado.pv.max = pv;
                    if (estado.pv.atual > pv) estado.pv.atual = pv;
                }
            }
            
            if (pfTotalElem && pfTotalElem.textContent) {
                const pf = parseInt(pfTotalElem.textContent);
                if (!isNaN(pf) && pf > 0) {
                    estado.pf.max = pf;
                    if (estado.pf.atual > pf) estado.pf.atual = pf;
                }
            }
        }
        
        // Atualizar visual
        atualizarTudo();
    }
    
    // === 6. FUNÇÃO ATUALIZAR TUDO (QUE ESTAVA FALTANDO) ===
    
    function atualizarTudo() {
        console.log('Atualizando tudo...');
        atualizarPV();
        atualizarPF();
    }
    
    // === 7. EVENT LISTENERS ===
    
    // Botões PV
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
    
    // Botões PF
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
    
    // Inputs PV
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
        sincronizarComAtributos();
    });
    
    // Inputs PF
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
    
    // === 8. PERSISTÊNCIA ===
    
    function salvarEstado() {
        try {
            localStorage.setItem('gurps-pv-pf', JSON.stringify(estado));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    }
    
    function carregarEstado() {
        try {
            const salvo = localStorage.getItem('gurps-pv-pf');
            if (salvo) {
                const dados = JSON.parse(salvo);
                
                if (dados.pv) {
                    estado.pv = { ...estado.pv, ...dados.pv };
                }
                if (dados.pf) {
                    estado.pf = { ...estado.pf, ...dados.pf };
                }
                
                console.log('Estado carregado:', estado);
                return true;
            }
        } catch (e) {
            console.error('Erro ao carregar:', e);
        }
        return false;
    }
    
    // === 9. INTEGRAÇÃO COM ATRIBUTOS ===
    
    // Escutar evento do atributos.js
    document.addEventListener('atributosAlterados', sincronizarComAtributos);
    
    // Observar mudanças nos elementos de atributos
    const pvTotalElem = document.getElementById('PVTotal');
    const pfTotalElem = document.getElementById('PFTotal');
    
    if (pvTotalElem) {
        const observer = new MutationObserver(() => {
            setTimeout(sincronizarComAtributos, 100);
        });
        observer.observe(pvTotalElem, { childList: true, subtree: true, characterData: true });
    }
    
    if (pfTotalElem) {
        const observer = new MutationObserver(() => {
            setTimeout(sincronizarComAtributos, 100);
        });
        observer.observe(pfTotalElem, { childList: true, subtree: true, characterData: true });
    }
    
    // === 10. INICIALIZAÇÃO FINAL ===
    
    function inicializar() {
        // Carregar estado salvo
        const estadoCarregado = carregarEstado();
        
        // Sincronizar com atributos
        sincronizarComAtributos();
        
        // Se não sincronizou, usar valores padrão
        if (estado.pv.max === 10 && !estadoCarregado) {
            console.log('Usando valores padrão');
        }
        
        // Atualizar tudo
        atualizarTudo();
        
        console.log('✅ Sistema PV/PF inicializado com sucesso!');
        console.log('Estado final:', estado);
    }
    
    // Inicializar
    inicializar();
    
    // === 11. EXPORTAR PARA DEBUG ===
    
    window.pvpf = {
        estado: estado,
        atualizarTudo: atualizarTudo,
        sincronizarComAtributos: sincronizarComAtributos,
        alterarPV: alterarPV,
        alterarPF: alterarPF
    };
    
    console.log('📊 Sistema PV/PF pronto para uso!');
}

// Função para forçar recarregamento (para debug)
window.recarregarPVPF = inicializarSistemaPVPF;