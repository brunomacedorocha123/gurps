// pv-pf.js — VERSÃO CORRIGIDA INTEGRADA COM SEU HTML
(function() {
    'use strict';

    // Estado
    const estado = {
        st: 10,
        ht: 10,
        pv: { atual: 10, maximo: 10, modificador: 0 },
        pf: { atual: 10, maximo: 10, modificador: 0 },
        fadigaAtiva: false
    };

    // ========== FUNÇÕES QUE SEU HTML ESPERA ==========
    // (MANTIDAS EXATAMENTE IGUAIS)
    window.danoPV5 = () => alterarPV(-5);
    window.danoPV2 = () => alterarPV(-2);
    window.danoPV1 = () => alterarPV(-1);
    window.curaPV1 = () => alterarPV(1);
    window.curaPV2 = () => alterarPV(2);
    window.curaPV5 = () => alterarPV(5);
    window.modPVMais = () => modificarPV('mod', 1);
    window.modPVMenos = () => modificarPV('mod', -1);
    window.resetPV = () => resetarPV();
    window.atualizarPVInput = () => atualizarPVManual();

    window.fadigaPF3 = () => alterarPF(-3);
    window.fadigaPF1 = () => alterarPF(-1);
    window.descansoPF1 = () => alterarPF(1);
    window.descansoPF3 = () => alterarPF(3);
    window.modPFMais = () => modificarPF('mod', 1);
    window.modPFMenos = () => modificarPF('mod', -1);
    window.resetPF = () => resetarPF();
    window.atualizarPFInput = () => atualizarPFManual();

    // ========== FUNÇÕES INTERNAS CORRIGIDAS ==========

    function alterarPV(delta) {
        estado.pv.atual += delta;
        const limite = -5 * estado.st;
        estado.pv.atual = Math.max(limite, Math.min(estado.pv.maximo, estado.pv.atual));
        atualizarTudo();
        aplicarEfeito('pvFill', delta > 0 ? 'cura-recebida' : 'dano-recebido');
    }

    function alterarPF(delta) {
        estado.pf.atual += delta;
        const limite = -1 * estado.ht;
        estado.pf.atual = Math.max(limite, Math.min(estado.pf.maximo, estado.pf.atual));
        
        // NOVO: Se PF chegar a 0 ou negativo, começa a perder PV
        if (estado.pf.atual <= 0) {
            aplicarDanoPorExaustao();
        }
        
        atualizarTudo();
        aplicarEfeito('pfFill', delta > 0 ? 'cura-recebida' : 'dano-recebido');
    }

    function aplicarDanoPorExaustao() {
        if (estado.pf.atual < 0) {
            // Cada ponto NEGATIVO de PF = 1 ponto de dano em PV
            const dano = Math.abs(estado.pf.atual);
            estado.pv.atual -= dano;
            
            // Garante que não passe do limite de morte
            const limiteMorte = -5 * estado.st;
            if (estado.pv.atual < limiteMorte) {
                estado.pv.atual = limiteMorte;
            }
            
            console.log(`⚠️ Exaustão! PF negativo causou ${dano} de dano em PV`);
        }
    }

    function modificarPV(_, valor) {
        estado.pv.modificador = Math.max(-10, Math.min(10, estado.pv.modificador + valor));
        estado.pv.maximo = estado.st + estado.pv.modificador;
        if (estado.pv.atual > estado.pv.maximo) estado.pv.atual = estado.pv.maximo;
        atualizarTudo();
    }

    function modificarPF(_, valor) {
        estado.pf.modificador = Math.max(-10, Math.min(10, estado.pf.modificador + valor));
        estado.pf.maximo = estado.ht + estado.pf.modificador;
        if (estado.pf.atual > estado.pf.maximo) estado.pf.atual = estado.pf.maximo;
        atualizarTudo();
    }

    function resetarPV() {
        estado.pv.atual = estado.pv.maximo;
        atualizarTudo();
    }

    function resetarPF() {
        estado.pf.atual = estado.pf.maximo;
        estado.fadigaAtiva = false;
        atualizarTudo();
    }

    function atualizarPVManual() {
        const v = parseInt(document.getElementById('pvAtualDisplay')?.value) || estado.pv.maximo;
        estado.pv.atual = Math.max(-5 * estado.st, Math.min(estado.pv.maximo, v));
        atualizarTudo();
    }

    function atualizarPFManual() {
        const v = parseInt(document.getElementById('pfAtualDisplay')?.value) || estado.pf.maximo;
        estado.pf.atual = Math.max(-1 * estado.ht, Math.min(estado.pf.maximo, v));
        
        // Verifica se manualmente colocou PF ≤ 0
        if (estado.pf.atual <= 0) {
            aplicarDanoPorExaustao();
        }
        
        atualizarTudo();
    }

    // ========== LÓGICA DE FADIGA (1/3) ==========

    function calcularLimiteFadiga() {
        // 1/3 dos PF máximos, arredondado PARA CIMA
        return Math.ceil(estado.pf.maximo / 3);
    }

    function verificarFadiga() {
        const limite = calcularLimiteFadiga();
        const estavaFadigado = estado.fadigaAtiva;
        const agoraFadigado = estado.pf.atual <= limite;
        
        // Se ACABA de entrar em fadiga
        if (agoraFadigado && !estavaFadigado) {
            estado.fadigaAtiva = true;
            console.log(`⚠️ PERSONAGEM FADIGADO! PF (${estado.pf.atual}) ≤ ${limite} (1/3 do máximo)`);
            aplicarEfeitosFadiga(true);
        }
        
        // Se ACABA de sair da fadiga
        if (!agoraFadigado && estavaFadigado) {
            estado.fadigaAtiva = false;
            console.log(`✅ Fadiga removida. PF (${estado.pf.atual}) > ${limite}`);
            aplicarEfeitosFadiga(false);
        }
        
        return agoraFadigado;
    }

    function aplicarEfeitosFadiga(ativar) {
        if (ativar) {
            // Quando entra em fadiga:
            // 1. Perde deslocamento
            // 2. Perde esquiva
            // 3. ST reduzido pela metade (arredondado para cima)
            // 4. MAS NÃO perde dano (como você especificou)
            
            console.log("Efeitos aplicados: Deslocamento=0, Esquiva=0, ST reduzido pela metade");
            
            // Atualiza o marcador visual no HTML (que você já tem)
            const marcador = document.querySelector('.marcador-fadiga');
            if (marcador) {
                marcador.style.backgroundColor = '#e74c3c'; // Vermelho forte
            }
            
        } else {
            // Quando sai da fadiga, restaura tudo
            console.log("Efeitos removidos: Deslocamento/Esquiva/ST restaurados");
            
            const marcador = document.querySelector('.marcador-fadiga');
            if (marcador) {
                marcador.style.backgroundColor = 'rgba(0,0,0,0.3)'; // Volta ao normal
            }
        }
        
        // Atualiza os displays de defesa (se existirem)
        atualizarDefesas();
    }

    function atualizarDefesas() {
        // Aqui você integra com o sistema de defesas que já tem
        // Mas só vou mostrar os valores se os elementos existirem
        
        if (estado.fadigaAtiva) {
            // ST reduzido pela metade (arredondado para cima)
            const stReduzido = Math.ceil(estado.st / 2);
            
            // Atualiza displays (se existirem)
            const stDisplay = document.getElementById('stEfetivoDisplay');
            if (stDisplay) stDisplay.textContent = `${stReduzido} (reduzido)`;
            
            const deslocamentoDisplay = document.getElementById('deslocamentoDisplay');
            if (deslocamentoDisplay) deslocamentoDisplay.textContent = 'Perdido';
            
            const esquivaDisplay = document.getElementById('esquivaDisplay');
            if (esquivaDisplay) esquivaDisplay.textContent = 'Perdida';
        } else {
            // Volta ao normal
            const stDisplay = document.getElementById('stEfetivoDisplay');
            if (stDisplay) stDisplay.textContent = estado.st;
            
            const deslocamentoDisplay = document.getElementById('deslocamentoDisplay');
            if (deslocamentoDisplay) deslocamentoDisplay.textContent = 'Normal';
            
            const esquivaDisplay = document.getElementById('esquivaDisplay');
            if (esquivaDisplay) esquivaDisplay.textContent = 'Normal';
        }
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function atualizarTudo() {
        console.log('🔄 Atualizando PV-PF...');
        
        // 1. Pega ST/HT dos atributos
        try {
            const stInput = document.getElementById('ST');
            const htInput = document.getElementById('HT');
            if (stInput) estado.st = parseInt(stInput.value) || 10;
            if (htInput) estado.ht = parseInt(htInput.value) || 10;
        } catch (e) {
            console.log('Usando valores padrão ST/HT');
        }

        // 2. Recalcula máximos
        estado.pv.maximo = estado.st + estado.pv.modificador;
        estado.pf.maximo = estado.ht + estado.pf.modificador;

        // 3. Verifica fadiga (1/3 dos PF)
        verificarFadiga();

        // 4. Atualiza marcador de 1/3 na barra
        atualizarMarcadorFadiga();

        // 5. PV
        setTexto('pvBaseDisplay', estado.st);
        setTexto('pvMaxDisplay', estado.pv.maximo);
        setInput('pvAtualDisplay', estado.pv.atual);
        setInput('pvModificador', estado.pv.modificador);
        setTexto('pvTexto', `${estado.pv.atual}/${estado.pv.maximo}`);
        atualizarBarraPV();
        atualizarEstadoPV();

        // 6. PF
        setTexto('pfBaseDisplay', estado.ht);
        setTexto('pfMaxDisplay', estado.pf.maximo);
        setInput('pfAtualDisplay', estado.pf.atual);
        setInput('pfModificador', estado.pf.modificador);
        setTexto('pfTexto', `${estado.pf.atual}/${estado.pf.maximo}`);
        atualizarBarraPF();
        atualizarEstadoPF();
        
        // 7. Atualiza a condição "Fadigado" na lista de condições
        atualizarCondicaoFadigado();
    }

    function atualizarMarcadorFadiga() {
        const marcador = document.querySelector('.marcador-fadiga');
        if (!marcador) return;
        
        // Calcula a posição CORRETA do marcador (1/3 dos PF máximos)
        const porcentagemLimite = (calcularLimiteFadiga() / estado.pf.maximo) * 100;
        marcador.style.left = `${Math.min(100, Math.max(0, porcentagemLimite))}%`;
        
        // Muda a cor se estiver em fadiga
        if (estado.fadigaAtiva) {
            marcador.style.backgroundColor = '#e74c3c';
            marcador.style.boxShadow = '0 0 5px #e74c3c';
        } else {
            marcador.style.backgroundColor = 'rgba(0,0,0,0.3)';
            marcador.style.boxShadow = 'none';
        }
    }

    function atualizarBarraPF() {
        const barra = document.getElementById('pfFill');
        if (!barra) return;
        
        const porcentagem = Math.max(0, Math.min(100, (estado.pf.atual / estado.pf.maximo) * 100));
        barra.style.width = `${porcentagem}%`;
        
        // Cores baseadas no estado
        let cor = '#3498db'; // Azul normal
        
        if (estado.fadigaAtiva) {
            cor = '#e67e22'; // Laranja - Fadigado (PF ≤ 1/3)
        }
        
        if (estado.pf.atual <= 0) {
            cor = '#e74c3c'; // Vermelho - Exausto
        }
        
        barra.style.background = cor;
    }

    function atualizarEstadoPF() {
        const elemento = document.getElementById('pfEstadoDisplay');
        if (!elemento) return;
        
        let estadoTexto = 'Normal';
        let cor = '#3498db';
        
        if (estado.fadigaAtiva) {
            estadoTexto = 'Fadigado';
            cor = '#e67e22';
        }
        
        if (estado.pf.atual <= 0) {
            estadoTexto = 'Exausto';
            cor = '#e74c3c';
        }
        
        if (estado.pf.atual < 0) {
            estadoTexto = 'Perdendo PV!';
            cor = '#8e44ad';
        }
        
        elemento.textContent = estadoTexto;
        elemento.style.color = cor;
    }

    function atualizarCondicaoFadigado() {
        // Atualiza o checkbox de "Fadigado" na lista de condições
        const condicaoItem = document.querySelector('[data-condicao="fadigado"]');
        if (condicaoItem) {
            const checkbox = condicaoItem.querySelector('.condicao-checkbox');
            if (checkbox) {
                if (estado.fadigaAtiva) {
                    checkbox.classList.add('checked');
                    condicaoItem.classList.add('ativa');
                } else {
                    checkbox.classList.remove('checked');
                    condicaoItem.classList.remove('ativa');
                }
            }
        }
    }

    // Resto das funções permanece igual...
    function atualizarBarraPV() {
        const barra = document.getElementById('pvFill');
        if (!barra) return;
        
        const limiteMorte = -5 * estado.st;
        const rangeTotal = estado.st - limiteMorte;
        const posicao = estado.pv.atual - limiteMorte;
        const porcentagem = Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
        
        barra.style.width = `${porcentagem}%`;
        
        let cor = '#27ae60';
        if (estado.pv.atual <= 0) cor = '#f1c40f';
        if (estado.pv.atual <= -estado.st) cor = '#e67e22';
        if (estado.pv.atual <= -2 * estado.st) cor = '#e74c3c';
        if (estado.pv.atual <= -3 * estado.st) cor = '#8e44ad';
        if (estado.pv.atual <= -4 * estado.st) cor = '#95a5a6';
        if (estado.pv.atual <= -5 * estado.st) cor = '#7f8c8d';
        
        barra.style.background = cor;
    }

    function atualizarEstadoPV() {
        const elemento = document.getElementById('pvEstadoDisplay');
        if (!elemento) return;
        
        let estadoTexto = 'Saudável';
        let cor = '#27ae60';
        
        if (estado.pv.atual <= 0) {
            estadoTexto = 'Machucado';
            cor = '#f1c40f';
        }
        if (estado.pv.atual <= -estado.st) {
            estadoTexto = 'Ferido';
            cor = '#e67e22';
        }
        if (estado.pv.atual <= -2 * estado.st) {
            estadoTexto = 'Crítico';
            cor = '#e74c3c';
        }
        if (estado.pv.atual <= -3 * estado.st) {
            estadoTexto = 'Morrendo';
            cor = '#8e44ad';
        }
        if (estado.pv.atual <= -4 * estado.st) {
            estadoTexto = 'Inconsciente';
            cor = '#95a5a6';
        }
        if (estado.pv.atual <= -5 * estado.st) {
            estadoTexto = 'Morto';
            cor = '#7f8c8d';
        }
        
        elemento.textContent = estadoTexto;
        elemento.style.color = cor;
    }

    function setTexto(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    function setInput(id, valor) {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    }

    function aplicarEfeito(id, classe) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('cura-recebida', 'dano-recebido');
        void el.offsetWidth;
        el.classList.add(classe);
        setTimeout(() => el.classList.remove(classe), 800);
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        console.log('🚀 Inicializando sistema PV-PF com fadiga corrigida...');
        
        atualizarTudo();
        
        const pvInput = document.getElementById('pvAtualDisplay');
        const pfInput = document.getElementById('pfAtualDisplay');
        
        if (pvInput) {
            pvInput.onchange = atualizarPVManual;
            pvInput.onblur = atualizarPVManual;
        }
        
        if (pfInput) {
            pfInput.onchange = atualizarPFManual;
            pfInput.onblur = atualizarPFManual;
        }
        
        console.log('✅ Sistema PV-PF com fadiga corrigida pronto!');
    }

    document.addEventListener('DOMContentLoaded', function() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) return;
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && 
                    combateTab.classList.contains('active')) {
                    
                    console.log('🎯 Aba Combate ativada');
                    setTimeout(inicializar, 300);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
        
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializar, 500);
        }
    });

})();