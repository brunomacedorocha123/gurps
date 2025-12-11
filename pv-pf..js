// pv-pf.js — VERSÃO FINAL — FUNCIONA NO SEU HTML EXATO
(function() {
    'use strict';

    // Estado seguro
    const estado = {
        st: 10,
        ht: 10,
        pv: { atual: 10, maximo: 10, modificador: 0 },
        pf: { atual: 10, maximo: 10, modificador: 0 }
    };

    // Funções expostas globalmente
    window.alterarPV = (delta) => {
        estado.pv.atual += delta;
        const limite = -5 * estado.st;
        estado.pv.atual = Math.max(limite, Math.min(estado.pv.maximo, estado.pv.atual));
        atualizarTudo();
        aplicarEfeito('pvFill', delta > 0 ? 'cura-recebida' : 'dano-recebido');
    };

    window.alterarPF = (delta) => {
        estado.pf.atual += delta;
        const limite = -1 * estado.ht;
        estado.pf.atual = Math.max(limite, Math.min(estado.pf.maximo, estado.pf.atual));
        atualizarTudo();
        aplicarEfeito('pfFill', delta > 0 ? 'cura-recebida' : 'dano-recebido');
    };

    window.modificarPV = (_, valor) => {
        estado.pv.modificador = Math.max(-10, Math.min(10, estado.pv.modificador + valor));
        estado.pv.maximo = estado.st + estado.pv.modificador;
        if (estado.pv.atual > estado.pv.maximo) estado.pv.atual = estado.pv.maximo;
        atualizarTudo();
    };

    window.modificarPF = (_, valor) => {
        estado.pf.modificador = Math.max(-10, Math.min(10, estado.pf.modificador + valor));
        estado.pf.maximo = estado.ht + estado.pf.modificador;
        if (estado.pf.atual > estado.pf.maximo) estado.pf.atual = estado.pf.maximo;
        atualizarTudo();
    };

    window.resetarPV = () => {
        estado.pv.atual = estado.pv.maximo;
        atualizarTudo();
    };

    window.resetarPF = () => {
        estado.pf.atual = estado.pf.maximo;
        atualizarTudo();
    };

    window.atualizarPVManual = () => {
        const v = parseInt(document.getElementById('pvAtualDisplay').value) || 0;
        estado.pv.atual = Math.max(-5 * estado.st, Math.min(estado.pv.maximo, v));
        atualizarTudo();
    };

    window.atualizarPFManual = () => {
        const v = parseInt(document.getElementById('pfAtualDisplay').value) || 0;
        estado.pf.atual = Math.max(-1 * estado.ht, Math.min(estado.pf.maximo, v));
        atualizarTudo();
    };

    // Atualiza TODOS os elementos da aba Combate
    function atualizarTudo() {
        // Atualiza ST/HT se possível
        const stInput = document.getElementById('ST');
        const htInput = document.getElementById('HT');
        if (stInput) estado.st = parseInt(stInput.value) || 10;
        if (htInput) estado.ht = parseInt(htInput.value) || 10;

        // Recalcula máximos
        estado.pv.maximo = estado.st + estado.pv.modificador;
        estado.pf.maximo = estado.ht + estado.pf.modificador;

        // PV
        setTexto('pvBaseDisplay', estado.st);
        setTexto('pvMaxDisplay', estado.pv.maximo);
        setInput('pvAtualDisplay', estado.pv.atual);
        setInput('pvModificador', estado.pv.modificador);
        setTexto('pvTexto', `${estado.pv.atual}/${estado.pv.maximo}`);
        atualizarBarra('pvFill', estado.pv.atual, estado.st, true);

        // PF
        setTexto('pfBaseDisplay', estado.ht);
        setTexto('pfMaxDisplay', estado.pf.maximo);
        setInput('pfAtualDisplay', estado.pf.atual);
        setInput('pfModificador', estado.pf.modificador);
        setTexto('pfTexto', `${estado.pf.atual}/${estado.pf.maximo}`);
        atualizarBarra('pfFill', estado.pf.atual, estado.pf.maximo, false);

        // Dano base (copiado da aba atributos)
        const gdp = document.getElementById('danoGDP')?.textContent || '1d-2';
        const geb = document.getElementById('danoGEB')?.textContent || '1d';
        setTexto('danoGdp', gdp);
        setTexto('danoGeb', geb);

        // Defesas (valores padrão — podem ser atualizados depois)
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const ht = estado.ht;
        const esquiva = Math.floor(dx + ht / 4) + 3;
        const deslocamento = ((dx + ht) / 4).toFixed(2);
        setTexto('esquivaTotal', esquiva);
        setTexto('deslocamentoTotal', deslocamento);
    }

    function setTexto(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    function setInput(id, valor) {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    }

    function atualizarBarra(id, atual, base, isPV) {
        const el = document.getElementById(id);
        if (!el) return;

        let porcentagem, cor;
        if (isPV) {
            const limite = -5 * base;
            const range = base - limite;
            const pos = atual - limite;
            porcentagem = Math.max(0, Math.min(100, (pos / range) * 100));
            cor = getCorPV(atual, base);
        } else {
            porcentagem = Math.max(0, Math.min(100, (atual / base) * 100));
            cor = getCorPF(atual, base);
        }

        el.style.width = `${porcentagem}%`;
        el.style.background = cor;
    }

    function getCorPV(pv, st) {
        if (pv > 0) return '#27ae60';
        if (pv >= -st) return '#f1c40f';
        if (pv >= -2*st) return '#e67e22';
        if (pv >= -3*st) return '#e74c3c';
        if (pv >= -4*st) return '#8e44ad';
        if (pv >= -5*st) return '#95a5a6';
        return '#7f8c8d';
    }

    function getCorPF(pf, max) {
        if (pf >= max * 0.66) return '#3498db';
        if (pf >= max * 0.33) return '#f39c12';
        if (pf > 0) return '#e67e22';
        if (pf === 0) return '#e74c3c';
        return '#8e44ad';
    }

    function aplicarEfeito(id, classe) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('cura-recebida', 'dano-recebido');
        void el.offsetWidth;
        el.classList.add(classe);
        setTimeout(() => el.classList.remove(classe), 800);
    }

    // Inicializa quando a aba combate é aberta
    const combateTab = document.getElementById('combate');
    if (!combateTab) return;

    const observer = new MutationObserver(() => {
        if (combateTab.classList.contains('active')) {
            // Pequeno delay para garantir que o DOM das outras abas está pronto
            setTimeout(() => {
                console.log('✅ Inicializando aba Combate...');
                atualizarTudo();

                // Garante que os inputs disparem atualização
                const pvInput = document.getElementById('pvAtualDisplay');
                const pfInput = document.getElementById('pfAtualDisplay');
                if (pvInput) pvInput.onchange = window.atualizarPVManual;
                if (pfInput) pfInput.onchange = window.atualizarPFManual;
            }, 300);
        }
    });

    observer.observe(combateTab, { attributes: true, attributeFilter: ['class'] });

    // Caso já esteja ativa
    if (combateTab.classList.contains('active')) {
        setTimeout(() => {
            atualizarTudo();
            if (document.getElementById('pvAtualDisplay'))
                document.getElementById('pvAtualDisplay').onchange = window.atualizarPVManual;
        }, 500);
    }

})();