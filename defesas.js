// defesas.js - SISTEMA COMPLETO E INDEPENDENTE DE DEFESAS ATIVAS
class SistemaDefesas {
    constructor() {
        this.defesas = {
            esquiva: { base: 0, modificador: 0, total: 0 },
            bloqueio: { base: 0, modificador: 0, total: 0 },
            aparar: { base: 0, modificador: 0, total: 0 },
            deslocamento: { base: 0, modificador: 0, total: 0 }
        };
        
        this.atributos = { DX: 10, HT: 10 };
        this.nivelCarga = 'nenhuma';
        this.totalBonus = 0;
        
        this.redutoresCarga = {
            'nenhuma': 0, 'leve': -1, 'média': -2, 'pesada': -3, 'muito pesada': -4
        };
        
        this.ultimaVerificacao = Date.now();
        this.verificandoAtivo = false;
        
        console.log('🛡️ Sistema de Defesas criado!');
    }

    // ===== INICIALIZAÇÃO COMPLETA =====
    inicializar() {
        console.log('🚀 Iniciando Sistema de Defesas...');
        
        this.configurarControlesManuais();
        this.iniciarMonitoramentoContinuo();
        this.forcarRecalculoCompleto();
        
        console.log('✅ Sistema de Defesas pronto!');
    }

    // ===== MÉTODO PRINCIPAL: MONITORAMENTO CONTÍNUO =====
    iniciarMonitoramentoContinuo() {
        console.log('👀 Iniciando monitoramento contínuo...');
        
        // Monitorar mudanças na aba de combate
        setInterval(() => {
            this.verificarMudancas();
        }, 1000); // Verifica a cada 1 segundo
        
        // Monitorar atributos manualmente (sem depender de eventos)
        this.monitorarAtributos();
        
        // Monitorar nível de carga
        this.monitorarCarga();
        
        // Monitorar mudanças no DOM
        this.monitorarDOM();
    }

    // ===== VERIFICAÇÃO DE MUDANÇAS =====
    verificarMudancas() {
        if (this.verificandoAtivo) return;
        
        this.verificandoAtivo = true;
        
        try {
            const agora = Date.now();
            if (agora - this.ultimaVerificacao < 500) {
                this.verificandoAtivo = false;
                return;
            }
            
            this.ultimaVerificacao = agora;
            
            // 1. Verificar atributos
            const dxAntes = this.atributos.DX;
            const htAntes = this.atributos.HT;
            
            this.buscarAtributosAtuais();
            
            const dxMudou = dxAntes !== this.atributos.DX;
            const htMudou = htAntes !== this.atributos.HT;
            
            // 2. Verificar nível de carga
            const cargaAntes = this.nivelCarga;
            this.buscarNivelCargaAtual();
            const cargaMudou = cargaAntes !== this.nivelCarga;
            
            // 3. Verificar bônus
            const bonusAntes = this.totalBonus;
            this.atualizarBonusGerais();
            const bonusMudou = bonusAntes !== this.totalBonus;
            
            // 4. Verificar modificadores
            const modMudou = this.verificarModificadoresMudaram();
            
            // Se alguma coisa mudou, recalcular
            if (dxMudou || htMudou || cargaMudou || bonusMudou || modMudou) {
                console.log('🔄 Mudanças detectadas!', { 
                    dxMudou, htMudou, cargaMudou, bonusMudou, modMudou 
                });
                this.calcularTodasDefesas();
            }
            
        } catch (error) {
            console.error('❌ Erro na verificação:', error);
        } finally {
            this.verificandoAtivo = false;
        }
    }

    // ===== BUSCA DE DADOS - TOTALMENTE INDEPENDENTE =====
    buscarAtributosAtuais() {
        // Método DIRETO: Pegar dos inputs da aba de atributos
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) {
            this.atributos.DX = parseInt(dxInput.value) || 10;
        }
        
        if (htInput) {
            this.atributos.HT = parseInt(htInput.value) || 10;
        }
        
        // Se não encontrou, procurar em qualquer lugar do DOM
        if (this.atributos.DX === 10 || this.atributos.HT === 10) {
            this.buscarAtributosFallback();
        }
    }

    buscarAtributosFallback() {
        // Procurar atributos em qualquer lugar
        const spansDX = document.querySelectorAll('span, div, td');
        for (const element of spansDX) {
            const texto = element.textContent || '';
            
            // Procurar "DX: 12" ou similar
            if (texto.includes('DX') && /\d+/.test(texto)) {
                const numero = texto.match(/\d+/);
                if (numero) {
                    this.atributos.DX = parseInt(numero[0]);
                    break;
                }
            }
            
            if (texto.includes('HT') && /\d+/.test(texto)) {
                const numero = texto.match(/\d+/);
                if (numero) {
                    this.atributos.HT = parseInt(numero[0]);
                    break;
                }
            }
        }
    }

    buscarNivelCargaAtual() {
        const nivelCargaElement = document.getElementById('nivelCarga');
        if (nivelCargaElement) {
            const novoNivel = nivelCargaElement.textContent.toLowerCase().trim();
            this.nivelCarga = novoNivel;
        }
    }

    buscarPericiaEscudo() {
        console.log('🔍 Buscando perícia de Escudo...');
        
        // MÉTODO 1: Procurar na lista de perícias aprendidas
        const containerPericias = document.getElementById('pericias-aprendidas');
        if (containerPericias) {
            const itensPericia = containerPericias.querySelectorAll('.pericia-aprendida-item');
            
            for (const item of itensPericias) {
                const nomeElement = item.querySelector('.pericia-aprendida-nome');
                if (nomeElement) {
                    const nome = nomeElement.textContent || '';
                    
                    if (nome.toLowerCase().includes('escudo')) {
                        // Extrair nível da perícia
                        const nivelElement = item.querySelector('.pericia-aprendida-nivel');
                        const nivel = nivelElement ? parseInt(nivelElement.textContent.replace('+', '')) || 0 : 0;
                        
                        // Calcular NH: DX + nível
                        const nh = this.atributos.DX + nivel;
                        console.log(`✅ Perícia de Escudo encontrada: ${nome}, Nível ${nivel}, NH ${nh}`);
                        return { nivel, nh, encontrado: true };
                    }
                }
            }
        }
        
        // MÉTODO 2: Procurar no catálogo de perícias (se não aprendida ainda)
        const listaPericias = document.getElementById('lista-pericias');
        if (listaPericias) {
            const itensCatalogo = listaPericias.querySelectorAll('.pericia-item');
            
            for (const item of itensCatalogo) {
                const nomeElement = item.querySelector('.pericia-nome');
                if (nomeElement) {
                    const nome = nomeElement.textContent || '';
                    
                    if (nome.toLowerCase().includes('escudo')) {
                        console.log(`📘 Perícia de Escudo disponível no catálogo: ${nome}`);
                        return { nivel: 0, nh: 3, encontrado: false }; // Valor mínimo
                    }
                }
            }
        }
        
        console.log('❌ Perícia de Escudo não encontrada');
        return { nivel: 0, nh: 3, encontrado: false };
    }

    buscarPericiaArma() {
        console.log('🔍 Buscando perícia da arma equipada...');
        
        // Primeiro, descobrir qual arma está equipada
        const armaEquipada = this.descobrirArmaEquipada();
        if (!armaEquipada) {
            console.log('⚠️ Nenhuma arma equipada encontrada');
            return { nivel: 0, nh: 0, encontrado: false };
        }
        
        console.log(`⚔️ Arma equipada: ${armaEquipada.nome}`);
        
        // Mapear nome da arma para tipos de perícia
        const mapeamentoArmas = this.criarMapeamentoArmas();
        const tipoPericia = this.encontrarTipoPericia(armaEquipada.nome, mapeamentoArmas);
        
        if (!tipoPericia) {
            console.log('❌ Não foi possível determinar o tipo de perícia para:', armaEquipada.nome);
            return { nivel: 0, nh: 3, encontrado: false };
        }
        
        console.log(`📘 Procurando perícia: ${tipoPericia}`);
        
        // Procurar a perícia na lista de perícias aprendidas
        return this.buscarPericiaPorNome(tipoPericia);
    }

    descobrirArmaEquipada() {
        // Procurar na aba de combate
        const armaInfo = document.getElementById('armaInfo');
        if (armaInfo) {
            // Verificar se tem arma equipada
            const semArma = armaInfo.querySelector('.sem-arma');
            const comArma = armaInfo.querySelector('.com-arma');
            
            if (comArma && comArma.style.display !== 'none') {
                const nomeElement = comArma.querySelector('.arma-nome');
                const danoElement = comArma.querySelector('.arma-dano');
                const tipoElement = comArma.querySelector('.arma-tipo');
                
                if (nomeElement) {
                    return {
                        nome: nomeElement.textContent || 'Arma Desconhecida',
                        dano: danoElement ? danoElement.textContent : '',
                        tipo: tipoElement ? tipoElement.textContent : ''
                    };
                }
            }
        }
        
        // Procurar em equipamentos equipados
        const itensEquipados = document.querySelectorAll('.equipamento-adquirido-item.equipado');
        for (const item of itensEquipados) {
            const nomeElement = item.querySelector('h4');
            if (nomeElement) {
                const nome = nomeElement.textContent || '';
                
                // Verificar se é uma arma (por palavras-chave)
                const palavrasArmas = ['espada', 'adaga', 'machado', 'maça', 'arco', 'lanca', 'martelo', 
                                      'faca', 'sabre', 'rapieira', 'terçado', 'bastão', 'tonfa',
                                      'pistola', 'rifle', 'shotgun', 'besta', 'funda'];
                
                for (const palavra of palavrasArmas) {
                    if (nome.toLowerCase().includes(palavra)) {
                        return { nome, encontrada: true };
                    }
                }
            }
        }
        
        return null;
    }

    criarMapeamentoArmas() {
        return {
            // Armas de Esgrima
            'adaga': ['Adaga de Esgrima', 'Faca', 'Adaga'],
            'rapieira': ['Rapieira', 'Espadas de Esgrima'],
            'sabre': ['Sabre', 'Espadas de Esgrima'],
            'terçado': ['Terçado', 'Espadas de Esgrima'],
            
            // Armas de Haste
            'lanca': ['Lança', 'Armas de Haste', 'Bastão'],
            'bastao': ['Bastão', 'Armas de Haste'],
            
            // Armas de Impacto
            'machado': ['Maça/Machado', 'Armas de Impacto'],
            'maça': ['Maça/Machado', 'Armas de Impacto'],
            
            // Espadas
            'espada': ['Espadas Curtas', 'Espadas de Lâmina Larga', 'Espada de Duas Mãos'],
            'faca': ['Faca', 'Espadas Curtas'],
            
            // Armas à Distância
            'arco': ['Arco'],
            'besta': ['Arco'], // Fallback
            'funda': ['Arco'], // Fallback
            
            // Modernas
            'pistola': ['Armas de Fogo'],
            'rifle': ['Armas de Fogo'],
            'shotgun': ['Armas de Fogo']
        };
    }

    encontrarTipoPericia(nomeArma, mapeamento) {
        const nomeLower = nomeArma.toLowerCase();
        
        for (const [palavraChave, pericias] of Object.entries(mapeamento)) {
            if (nomeLower.includes(palavraChave)) {
                return pericias[0]; // Retorna a primeira perícia do array
            }
        }
        
        // Fallback: verificar palavra por palavra
        const palavras = nomeLower.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
        for (const palavra of palavras) {
            if (palavra.length > 3) {
                for (const [palavraChave, pericias] of Object.entries(mapeamento)) {
                    if (palavra.includes(palavraChave) || palavraChave.includes(palavra)) {
                        return pericias[0];
                    }
                }
            }
        }
        
        return null;
    }

    buscarPericiaPorNome(tipoPericia) {
        // Procurar na lista de perícias aprendidas
        const containerPericias = document.getElementById('pericias-aprendidas');
        if (containerPericias) {
            const itensPericia = containerPericias.querySelectorAll('.pericia-aprendida-item');
            
            for (const item of itensPericia) {
                const nomeElement = item.querySelector('.pericia-aprendida-nome');
                if (nomeElement) {
                    const nome = nomeElement.textContent || '';
                    
                    if (nome.toLowerCase().includes(tipoPericia.toLowerCase())) {
                        // Extrair nível
                        const nivelElement = item.querySelector('.pericia-aprendida-nivel');
                        const nivel = nivelElement ? parseInt(nivelElement.textContent.replace('+', '')) || 0 : 0;
                        
                        // Calcular NH
                        const nh = this.atributos.DX + nivel;
                        console.log(`✅ Perícia encontrada: ${nome}, Nível ${nivel}, NH ${nh}`);
                        return { nivel, nh, encontrado: true };
                    }
                }
            }
        }
        
        // Procurar no catálogo
        const listaPericias = document.getElementById('lista-pericias');
        if (listaPericias) {
            const itensCatalogo = listaPericias.querySelectorAll('.pericia-item');
            
            for (const item of itensCatalogo) {
                const nomeElement = item.querySelector('.pericia-nome');
                if (nomeElement) {
                    const nome = nomeElement.textContent || '';
                    
                    if (nome.toLowerCase().includes(tipoPericia.toLowerCase())) {
                        console.log(`📘 Perícia disponível no catálogo: ${nome}`);
                        return { nivel: 0, nh: 3, encontrado: false };
                    }
                }
            }
        }
        
        console.log(`❌ Perícia "${tipoPericia}" não encontrada`);
        return { nivel: 0, nh: 3, encontrado: false };
    }

    // ===== CÁLCULOS =====
    calcularTodasDefesas() {
        console.log('🧮 Calculando defesas...');
        
        this.calcularEsquiva();
        this.calcularDeslocamento();
        this.calcularBloqueio();
        this.calcularAparar();
        
        this.atualizarInterface();
    }

    calcularEsquiva() {
        // Fórmula: floor((DX + HT)/4) + 3 + bônus + redutor de carga
        const base = Math.floor((this.atributos.DX + this.atributos.HT) / 4) + 3;
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.esquiva.base = base;
        this.defesas.esquiva.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.esquiva.modificador + 
            redutorCarga,
            1
        );
        
        console.log(`🏃 Esquiva: ${this.defesas.esquiva.total} (base: ${base})`);
    }

    calcularDeslocamento() {
        // Fórmula: (DX + HT)/4 + bônus + redutor de carga
        const base = (this.atributos.DX + this.atributos.HT) / 4;
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.deslocamento.base = base;
        this.defesas.deslocamento.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.deslocamento.modificador + 
            redutorCarga,
            0
        );
        
        console.log(`👣 Deslocamento: ${this.defesas.deslocamento.total.toFixed(2)} (base: ${base.toFixed(2)})`);
    }

    calcularBloqueio() {
        // Buscar perícia de Escudo
        const periciaEscudo = this.buscarPericiaEscudo();
        
        if (periciaEscudo.encontrado) {
            // Fórmula: floor(NH/2) + 3 + bônus
            const base = Math.floor(periciaEscudo.nh / 2) + 3;
            this.defesas.bloqueio.base = base;
            this.defesas.bloqueio.total = Math.max(
                base + 
                this.totalBonus + 
                this.defesas.bloqueio.modificador,
                1
            );
            
            console.log(`🛡️ Bloqueio: ${this.defesas.bloqueio.total} (NH: ${periciaEscudo.nh}, base: ${base})`);
        } else {
            // Sem perícia de escudo
            this.defesas.bloqueio.base = 3;
            this.defesas.bloqueio.total = Math.max(
                3 + 
                this.totalBonus + 
                this.defesas.bloqueio.modificador,
                1
            );
            
            console.log(`🛡️ Bloqueio (sem perícia): ${this.defesas.bloqueio.total}`);
        }
    }

    calcularAparar() {
        // Buscar perícia da arma
        const periciaArma = this.buscarPericiaArma();
        
        if (periciaArma.encontrado && periciaArma.nh > 0) {
            // Fórmula: floor(NH/2) + 3 + bônus
            const base = Math.floor(periciaArma.nh / 2) + 3;
            this.defesas.aparar.base = base;
            this.defesas.aparar.total = Math.max(
                base + 
                this.totalBonus + 
                this.defesas.aparar.modificador,
                1
            );
            
            console.log(`⚔️ Aparar: ${this.defesas.aparar.total} (NH: ${periciaArma.nh}, base: ${base})`);
        } else {
            // Sem arma equipada ou sem perícia
            this.defesas.aparar.base = 0;
            this.defesas.aparar.total = 0;
            console.log(`⚔️ Aparar: Não disponível`);
        }
    }

    // ===== ATUALIZAÇÃO DA INTERFACE =====
    atualizarInterface() {
        // Valores totais
        this.atualizarElemento('esquivaTotal', this.defesas.esquiva.total);
        this.atualizarElemento('deslocamentoTotal', this.defesas.deslocamento.total.toFixed(2));
        this.atualizarElemento('bloqueioTotal', this.defesas.bloqueio.total);
        this.atualizarElemento('apararTotal', this.defesas.aparar.total || 0);
        
        // Modificadores (manter os que o usuário digitou)
        this.atualizarModificador('esquivaMod', this.defesas.esquiva.modificador);
        this.atualizarModificador('bloqueioMod', this.defesas.bloqueio.modificador);
        this.atualizarModificador('apararMod', this.defesas.aparar.modificador);
        this.atualizarModificador('deslocamentoMod', this.defesas.deslocamento.modificador);
    }

    atualizarElemento(id, valor) {
        const element = document.getElementById(id);
        if (element && element.textContent !== String(valor)) {
            element.textContent = valor;
        }
    }

    atualizarModificador(id, valor) {
        const element = document.getElementById(id);
        if (element && parseInt(element.value) !== valor) {
            element.value = valor;
        }
    }

    // ===== CONTROLES MANUAIS =====
    configurarControlesManuais() {
        // Configurar botões de modificador
        this.configurarBotoesModificador('esquiva');
        this.configurarBotoesModificador('bloqueio');
        this.configurarBotoesModificador('aparar');
        this.configurarBotoesModificador('deslocamento');
        
        // Configurar inputs de bônus
        this.configurarInputsBonus();
    }

    configurarBotoesModificador(defesaId) {
        const modInput = document.getElementById(`${defesaId}Mod`);
        if (!modInput) return;
        
        // Encontrar botões ao redor do input
        const container = modInput.parentElement;
        const minusBtn = container.querySelector('.minus, .mod-btn.minus');
        const plusBtn = container.querySelector('.plus, .mod-btn.plus');
        
        if (minusBtn) {
            minusBtn.onclick = () => this.alterarModificador(defesaId, -1);
        }
        
        if (plusBtn) {
            plusBtn.onclick = () => this.alterarModificador(defesaId, 1);
        }
        
        // Configurar input
        modInput.addEventListener('change', (e) => {
            const valor = parseInt(e.target.value) || 0;
            this.defesas[defesaId].modificador = valor;
            this.calcularTodasDefesas();
        });
    }

    alterarModificador(defesaId, valor) {
        const modInput = document.getElementById(`${defesaId}Mod`);
        if (!modInput) return;
        
        const atual = parseInt(modInput.value) || 0;
        const novoValor = atual + valor;
        modInput.value = novoValor;
        
        this.defesas[defesaId].modificador = novoValor;
        this.calcularTodasDefesas();
    }

    configurarInputsBonus() {
        const bonusIds = ['Reflexos', 'Escudo', 'Capa', 'Outros'];
        
        bonusIds.forEach(bonusId => {
            const input = document.getElementById(`bonus${bonusId}`);
            if (input) {
                // Inicializar valor
                input.value = input.value || '0';
                
                input.addEventListener('change', () => {
                    this.atualizarBonusGerais();
                    this.calcularTodasDefesas();
                });
                
                input.addEventListener('input', () => {
                    this.atualizarBonusGerais();
                    this.calcularTodasDefesas();
                });
            }
        });
    }

    atualizarBonusGerais() {
        let total = 0;
        
        total += parseInt(document.getElementById('bonusReflexos')?.value) || 0;
        total += parseInt(document.getElementById('bonusEscudo')?.value) || 0;
        total += parseInt(document.getElementById('bonusCapa')?.value) || 0;
        total += parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        this.totalBonus = total;
        
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            const texto = total >= 0 ? `+${total}` : `${total}`;
            if (totalElement.textContent !== texto) {
                totalElement.textContent = texto;
            }
        }
    }

    verificarModificadoresMudaram() {
        const defesas = ['esquiva', 'bloqueio', 'aparar', 'deslocamento'];
        
        for (const defesa of defesas) {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                const valorInput = parseInt(input.value) || 0;
                if (this.defesas[defesa].modificador !== valorInput) {
                    this.defesas[defesa].modificador = valorInput;
                    return true;
                }
            }
        }
        
        return false;
    }

    // ===== MONITORAMENTO DO DOM =====
    monitorarAtributos() {
        // Monitorar inputs de atributos diretamente
        const inputsAtributos = ['DX', 'HT'];
        
        inputsAtributos.forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('input', () => {
                    setTimeout(() => this.forcarRecalculoCompleto(), 100);
                });
                
                input.addEventListener('change', () => {
                    this.forcarRecalculoCompleto();
                });
            }
        });
    }

    monitorarCarga() {
        // Observar mudanças no elemento de nível de carga
        const nivelCargaElement = document.getElementById('nivelCarga');
        if (nivelCargaElement) {
            const observer = new MutationObserver(() => {
                this.buscarNivelCargaAtual();
                this.calcularTodasDefesas();
            });
            
            observer.observe(nivelCargaElement, { 
                childList: true, 
                characterData: true,
                subtree: true 
            });
        }
    }

    monitorarDOM() {
        // Observar mudanças gerais no DOM que podem afetar defesas
        const observer = new MutationObserver((mutations) => {
            let mudancaRelevante = false;
            
            for (const mutation of mutations) {
                // Verificar se mudanças foram em elementos de perícias ou equipamentos
                const target = mutation.target;
                const id = target.id || '';
                const classe = target.className || '';
                
                if (id.includes('pericia') || 
                    id.includes('arma') || 
                    classe.includes('equipado') ||
                    classe.includes('pericia')) {
                    mudancaRelevante = true;
                    break;
                }
                
                // Verificar se mudou texto que pode ser relevante
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    const texto = target.textContent || '';
                    if (texto.includes('Escudo') || 
                        texto.includes('NH') || 
                        texto.includes('nível') ||
                        texto.includes('equipado')) {
                        mudancaRelevante = true;
                        break;
                    }
                }
            }
            
            if (mudancaRelevante) {
                setTimeout(() => this.forcarRecalculoCompleto(), 300);
            }
        });
        
        // Observar todo o documento
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // ===== MÉTODOS PÚBLICOS =====
    forcarRecalculoCompleto() {
        console.log('🔄 Forçando recálculo completo das defesas!');
        
        this.buscarAtributosAtuais();
        this.buscarNivelCargaAtual();
        this.atualizarBonusGerais();
        this.calcularTodasDefesas();
    }

    obterDadosDefesas() {
        return {
            esquiva: this.defesas.esquiva.total,
            deslocamento: this.defesas.deslocamento.total,
            bloqueio: this.defesas.bloqueio.total,
            aparar: this.defesas.aparar.total,
            atributos: { ...this.atributos },
            nivelCarga: this.nivelCarga,
            totalBonus: this.totalBonus,
            detalhes: this.defesas
        };
    }

    // ===== DIAGNÓSTICO =====
    diagnostico() {
        console.log('=== DIAGNÓSTICO DO SISTEMA DE DEFESAS ===');
        console.log('📊 Atributos:', this.atributos);
        console.log('🛡️ Defesas:', this.defesas);
        console.log('🏋️ Nível de Carga:', this.nivelCarga);
        console.log('⭐ Total de Bônus:', this.totalBonus);
        
        // Buscar perícia de escudo
        const escudo = this.buscarPericiaEscudo();
        console.log('🛡️ Perícia de Escudo:', escudo);
        
        // Buscar perícia de arma
        const arma = this.buscarPericiaArma();
        console.log('⚔️ Perícia de Arma:', arma);
        
        // Verificar arma equipada
        const armaEquipada = this.descobrirArmaEquipada();
        console.log('🔫 Arma Equipada:', armaEquipada);
        
        console.log('========================================');
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaDefesas;

function inicializarSistemaDefesas() {
    if (window.sistemaDefesas) {
        console.log('⚠️ Sistema de Defesas já inicializado');
        return window.sistemaDefesas;
    }
    
    console.log('🚀 Inicializando Sistema de Defesas...');
    sistemaDefesas = new SistemaDefesas();
    window.sistemaDefesas = sistemaDefesas;
    
    // Esperar a página carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => sistemaDefesas.inicializar(), 500);
        });
    } else {
        setTimeout(() => sistemaDefesas.inicializar(), 500);
    }
    
    return sistemaDefesas;
}

// Inicializar automaticamente quando a aba de combate estiver ativa
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function verificarEInicializar() {
        if (combateTab && combateTab.classList.contains('active')) {
            if (!window.sistemaDefesas) {
                setTimeout(() => {
                    console.log('🎯 Aba de Combate ativa - Inicializando defesas');
                    inicializarSistemaDefesas();
                }, 300);
            }
        }
    }
    
    // Verificar inicialmente
    verificarEInicializar();
    
    // Observar mudanças na aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate') {
                    verificarEInicializar();
                }
            }
        });
    });
    
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ===== FUNÇÕES GLOBAIS PARA DEBUG =====
window.obterDadosDefesas = function() {
    return window.sistemaDefesas?.obterDadosDefesas() || null;
};

window.forcarRecalculoDefesas = function() {
    window.sistemaDefesas?.forcarRecalculoCompleto();
};

window.diagnosticoDefesas = function() {
    window.sistemaDefesas?.diagnostico();
};

// ===== FUNÇÃO DE TESTE RÁPIDO =====
window.testarDefesas = function() {
    console.log('🧪 Testando Sistema de Defesas...');
    
    if (!window.sistemaDefesas) {
        console.log('❌ Sistema não inicializado. Inicializando...');
        inicializarSistemaDefesas();
        return;
    }
    
    const dados = window.sistemaDefesas.obterDadosDefesas();
    console.log('📊 Dados atuais:', dados);
    
    // Testar busca de perícias
    console.log('🔍 Buscando perícia de Escudo...');
    const escudo = window.sistemaDefesas.buscarPericiaEscudo();
    console.log('🛡️ Resultado:', escudo);
    
    console.log('🔍 Buscando perícia de Arma...');
    const arma = window.sistemaDefesas.buscarPericiaArma();
    console.log('⚔️ Resultado:', arma);
    
    console.log('✅ Teste concluído!');
};

// ===== EXPORTAÇÕES =====
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado e pronto!');