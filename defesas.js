// defesas.js - SISTEMA MAIS BRABO DO MUNDO GURPS!
class SistemaDefesasUltraBrabo {
    constructor() {
        console.log('🔥🔥🔥 SISTEMA DE DEFESAS ULTRA BRABO INICIADO! 🔥🔥🔥');
        
        this.ULTRA_BRABO = true;
        this.superCache = {
            dx: 10, ht: 10,
            nhEscudo: null, nhArma: null,
            bonus: { reflexos: 0, escudo: 0, capa: 0, outros: 0 },
            defesas: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
            ultimaAtualizacao: Date.now()
        };
        
        this.monitoresAtivos = [];
        this.iniciado = false;
    }
    
    // ===== INICIALIZAÇÃO ULTRA BRABA =====
    iniciar() {
        if (this.iniciado) return;
        console.log('🚀🚀🚀 INICIANDO SISTEMA ULTRA BRABO! 🚀🚀🚀');
        
        // 1. FORÇAR PRIMEIRA ATUALIZAÇÃO
        this.atualizarTudoComForcaBruta();
        
        // 2. CONFIGURAR MONITORES BRABOS
        this.configurarMonitoresUltraBrabos();
        
        // 3. INTERCEPTAR TUDO QUE MEXE
        this.interceptarTudoQueExiste();
        
        // 4. INICIAR AUTO-DEFESA (atualiza sozinho)
        this.iniciarAutoDefesa();
        
        this.iniciado = true;
        console.log('✅✅✅ SISTEMA ULTRA BRABO PRONTO PARA DESTRUIR! ✅✅✅');
    }
    
    // ===== FORÇA BRUTA DE ATUALIZAÇÃO =====
    atualizarTudoComForcaBruta() {
        console.log('💪 ATUALIZANDO TUDO COM FORÇA BRUTA!');
        
        // Passo 1: PEGAR DADOS NA UNHA
        this.pegarDXHTNaMarra();
        this.pegarBonusNoGrito();
        this.buscarPericiasComRaiva();
        
        // Passo 2: CALCULAR TUDO
        this.calcularESQUIVABraba();
        this.calcularDESLOCAMENTOBrabo();
        this.calcularBLOQUEIOBrabo();
        this.calcularAPARARBrabo();
        
        // Passo 3: ATUALIZAR TELA COM PODER
        this.atualizarTelaComExplosao();
        
        // Passo 4: ATUALIZAR BÔNUS TOTAL
        this.atualizarBonusTotalComFuria();
        
        this.superCache.ultimaAtualizacao = Date.now();
        console.log('💥 ATUALIZAÇÃO BRUTAL CONCLUÍDA!');
    }
    
    pegarDXHTNaMarra() {
        // Método 1: Input direto
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) {
            this.superCache.dx = parseInt(dxInput.value) || 10;
            console.log(`🎯 DX BRUTO: ${this.superCache.dx}`);
        }
        
        if (htInput) {
            this.superCache.ht = parseInt(htInput.value) || 10;
            console.log(`🎯 HT BRUTO: ${this.superCache.ht}`);
        }
        
        // Método 2: Procurar em qualquer lugar (nunca falha)
        if (!dxInput || !htInput) {
            this.procurarAtributosNoDesespero();
        }
    }
    
    procurarAtributosNoDesespero() {
        console.log('🔍 PROCURANDO ATRIBUTOS NO DESESPERO...');
        
        // Varre TUDO que tem número
        const elementos = document.querySelectorAll('input, span, div, td');
        
        for (let el of elementos) {
            const texto = el.textContent || el.value || '';
            
            // DX em qualquer formato
            if (texto.includes('DX') || texto.includes('dx') || texto.includes('Destreza')) {
                const numeros = texto.match(/\d+/);
                if (numeros && !this.superCache.dx) {
                    this.superCache.dx = parseInt(numeros[0]);
                    console.log(`✅ DX ENCONTRADO NO DESESPERO: ${this.superCache.dx}`);
                }
            }
            
            // HT em qualquer formato
            if (texto.includes('HT') || texto.includes('ht') || texto.includes('Vigor')) {
                const numeros = texto.match(/\d+/);
                if (numeros && !this.superCache.ht) {
                    this.superCache.ht = parseInt(numeros[0]);
                    console.log(`✅ HT ENCONTRADO NO DESESPERO: ${this.superCache.ht}`);
                }
            }
            
            if (this.superCache.dx && this.superCache.ht) break;
        }
        
        // Garantia final (nunca retorna undefined)
        this.superCache.dx = this.superCache.dx || 10;
        this.superCache.ht = this.superCache.ht || 10;
    }
    
    pegarBonusNoGrito() {
        console.log('💰 PEGANDO BÔNUS NO GRITO!');
        
        // BÔNUS REFLEXOS
        const bonusReflexos = document.getElementById('bonusReflexos');
        if (bonusReflexos) {
            this.superCache.bonus.reflexos = parseInt(bonusReflexos.value) || 0;
            console.log(`💰 Reflexos: ${this.superCache.bonus.reflexos}`);
        }
        
        // BÔNUS ESCUDO
        const bonusEscudo = document.getElementById('bonusEscudo');
        if (bonusEscudo) {
            this.superCache.bonus.escudo = parseInt(bonusEscudo.value) || 0;
            console.log(`💰 Escudo: ${this.superCache.bonus.escudo}`);
        }
        
        // BÔNUS CAPA
        const bonusCapa = document.getElementById('bonusCapa');
        if (bonusCapa) {
            this.superCache.bonus.capa = parseInt(bonusCapa.value) || 0;
            console.log(`💰 Capa: ${this.superCache.bonus.capa}`);
        }
        
        // BÔNUS OUTROS
        const bonusOutros = document.getElementById('bonusOutros');
        if (bonusOutros) {
            this.superCache.bonus.outros = parseInt(bonusOutros.value) || 0;
            console.log(`💰 Outros: ${this.superCache.bonus.outros}`);
        }
    }
    
    buscarPericiasComRaiva() {
        console.log('😡 BUSCANDO PERÍCIAS COM RAIVA!');
        
        // Limpar cache pra forçar busca
        this.superCache.nhEscudo = null;
        this.superCache.nhArma = null;
        
        // Buscar Escudo com ódio
        this.superCache.nhEscudo = this.buscarEscudoComFuria();
        
        // Buscar Arma com violência
        this.superCache.nhArma = this.buscarArmaComViolencia();
    }
    
    buscarEscudoComFuria() {
        console.log('🛡️ BUSCANDO ESCUDO COM FÚRIA!');
        const dx = this.superCache.dx;
        
        // Método 1: Lista de perícias aprendidas
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item, .pericia-item');
            
            for (let item of itens) {
                const nome = item.textContent || '';
                if (nome.toLowerCase().includes('escudo')) {
                    // Extrair nível com REGEX BRUTO
                    const nivelMatch = nome.match(/[+-]?\d+/);
                    const nivel = nivelMatch ? parseInt(nivelMatch[0]) : 0;
                    const nh = dx + nivel;
                    console.log(`🛡️ ESCUDO ENCONTRADO! Nível ${nivel}, NH ${nh}`);
                    return nh;
                }
            }
        }
        
        // Método 2: Catálogo
        const catalogo = document.getElementById('lista-pericias');
        if (catalogo) {
            const itens = catalogo.querySelectorAll('.pericia-item');
            
            for (let item of itens) {
                const nome = item.textContent || '';
                if (nome.toLowerCase().includes('escudo')) {
                    console.log(`🛡️ ESCUDO NO CATÁLOGO! NH mínimo: ${dx}`);
                    return dx; // NH mínimo (só DX)
                }
            }
        }
        
        // Método 3: localStorage (último recurso)
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const escudo = pericias.find(p => 
                    p.nome && p.nome.toLowerCase().includes('escudo')
                );
                
                if (escudo) {
                    const nh = dx + (escudo.nivel || 0);
                    console.log(`🛡️ ESCUDO NO LOCALSTORAGE! NH ${nh}`);
                    return nh;
                }
            }
        } catch (e) {
            // Ignora
        }
        
        console.log(`🛡️ SEM ESCUDO, USANDO NH MÍNIMO: ${dx}`);
        return dx; // DX puro
    }
    
    buscarArmaComViolencia() {
        console.log('⚔️ BUSCANDO ARMA COM VIOLÊNCIA!');
        
        // Primeiro, descobrir se tem arma equipada
        const armaEquipada = this.descobrirArmaComForca();
        if (!armaEquipada) {
            console.log('⚔️ NENHUMA ARMA EQUIPADA!');
            return 0;
        }
        
        console.log(`⚔️ ARMA EQUIPADA: ${armaEquipada.nome}`);
        const dx = this.superCache.dx;
        
        // Buscar perícia correspondente
        const nh = this.buscarPericiaDaArma(armaEquipada.nome, dx);
        
        if (nh > 0) {
            console.log(`⚔️ PERÍCIA DA ARMA ENCONTRADA! NH ${nh}`);
            return nh;
        }
        
        console.log(`⚔️ SEM PERÍCIA, USANDO NH MÍNIMO: ${dx}`);
        return dx; // DX puro
    }
    
    descobrirArmaComForca() {
        // Método 1: Card de arma na aba combate
        const comArma = document.getElementById('comArma');
        if (comArma && comArma.style.display !== 'none') {
            const nomeElement = comArma.querySelector('.arma-nome, .arma-nome *');
            if (nomeElement) {
                return { nome: nomeElement.textContent.trim(), origem: 'card-combate' };
            }
        }
        
        // Método 2: Itens equipados
        const equipados = document.querySelectorAll('[class*="equipado"], [class*="equipada"]');
        for (let item of equipados) {
            const texto = item.textContent || '';
            
            // Lista de armas (completa)
            const armas = ['espada', 'adaga', 'machado', 'maça', 'arco', 'lanca', 'lança',
                          'martelo', 'faca', 'sabre', 'rapieira', 'terçado', 'bastão',
                          'tonfa', 'pistola', 'rifle', 'shotgun', 'besta', 'funda',
                          'katana', 'mangual', 'chicote', 'kusari', 'jitte', 'sai'];
            
            for (let arma of armas) {
                if (texto.toLowerCase().includes(arma)) {
                    return { nome: texto.split('\n')[0].trim(), origem: 'item-equipado' };
                }
            }
        }
        
        // Método 3: Sistema de equipamentos (se disponível)
        if (window.sistemaEquipamentos && window.sistemaEquipamentos.armasCombate) {
            const armas = window.sistemaEquipamentos.armasCombate.maos;
            if (armas && armas.length > 0) {
                return { nome: armas[0].nome, origem: 'sistema-equipamentos' };
            }
        }
        
        return null;
    }
    
    buscarPericiaDaArma(nomeArma, dx) {
        const nomeLower = nomeArma.toLowerCase();
        
        // Mapeamento BRUTO de armas para perícias
        const mapeamento = {
            'adaga': ['adaga', 'faca', 'adaga de esgrima'],
            'espada': ['espada', 'espadas', 'sabre', 'rapieira', 'terçado'],
            'machado': ['machado', 'maça/machado', 'armas de impacto'],
            'maça': ['maça', 'maça/machado', 'martelo'],
            'arco': ['arco', 'besta', 'funda'],
            'lanca': ['lança', 'bastão', 'armas de haste'],
            'martelo': ['martelo', 'maça/machado'],
            'faca': ['faca', 'adaga'],
            'sabre': ['sabre', 'espada'],
            'bastão': ['bastão', 'lança'],
            'tonfa': ['tonfa'],
            'pistola': ['armas de fogo', 'pistola'],
            'rifle': ['armas de fogo', 'rifle'],
            'shotgun': ['armas de fogo', 'espingarda']
        };
        
        // Procurar perícia correspondente
        let tipoPericia = null;
        
        for (const [arma, pericias] of Object.entries(mapeamento)) {
            if (nomeLower.includes(arma)) {
                tipoPericia = pericias[0];
                break;
            }
        }
        
        if (!tipoPericia) {
            // Fallback: primeira palavra da arma
            const primeiraPalavra = nomeLower.split(' ')[0];
            tipoPericia = primeiraPalavra;
        }
        
        console.log(`🔍 Buscando perícia: "${tipoPericia}" para arma "${nomeArma}"`);
        
        // Buscar a perícia
        return this.buscarPericiaPorNome(tipoPericia, dx);
    }
    
    buscarPericiaPorNome(nomePericia, dx) {
        // Buscar em TODOS os lugares possíveis
        
        // 1. Perícias aprendidas
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item, .pericia-item');
            
            for (let item of itens) {
                const texto = item.textContent || '';
                if (texto.toLowerCase().includes(nomePericia.toLowerCase())) {
                    const nivelMatch = texto.match(/[+-]?\d+/);
                    const nivel = nivelMatch ? parseInt(nivelMatch[0]) : 0;
                    return dx + nivel;
                }
            }
        }
        
        // 2. localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const pericia = pericias.find(p => 
                    p.nome && p.nome.toLowerCase().includes(nomePericia.toLowerCase())
                );
                
                if (pericia) {
                    return dx + (pericia.nivel || 0);
                }
            }
        } catch (e) {
            // Ignora
        }
        
        return 0; // Não encontrou
    }
    
    // ===== CÁLCULOS BRABOS =====
    calcularESQUIVABraba() {
        console.log('🏃 CALCULANDO ESQUIVA BRABA!');
        
        const { dx, ht } = this.superCache;
        const { reflexos, outros } = this.superCache.bonus;
        
        // Base: floor((DX + HT)/4) + 3
        const base = Math.floor((dx + ht) / 4) + 3;
        
        // Modificador
        const modInput = document.getElementById('esquivaMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Redutor de carga
        const nivelCarga = document.getElementById('nivelCarga')?.textContent.toLowerCase() || 'nenhuma';
        const redutor = this.getRedutorCarga(nivelCarga);
        
        // Total COM BÔNUS
        const total = base + modificador + reflexos + outros + redutor;
        
        this.superCache.defesas.esquiva = Math.max(total, 1);
        console.log(`🏃 ESQUIVA: ${this.superCache.defesas.esquiva} (base:${base} +reflexos:${reflexos} +outros:${outros})`);
    }
    
    calcularDESLOCAMENTOBrabo() {
        console.log('👣 CALCULANDO DESLOCAMENTO BRABO!');
        
        const { dx, ht } = this.superCache;
        const { outros } = this.superCache.bonus;
        
        // Base: (DX + HT)/4
        const base = (dx + ht) / 4;
        
        // Modificador
        const modInput = document.getElementById('deslocamentoMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Redutor de carga
        const nivelCarga = document.getElementById('nivelCarga')?.textContent.toLowerCase() || 'nenhuma';
        const redutor = this.getRedutorCarga(nivelCarga);
        
        // Total COM BÔNUS
        const total = base + modificador + outros + redutor;
        
        this.superCache.defesas.deslocamento = Math.max(total, 0);
        console.log(`👣 DESLOCAMENTO: ${total.toFixed(2)} (base:${base.toFixed(2)} +outros:${outros})`);
    }
    
    calcularBLOQUEIOBrabo() {
        console.log('🛡️ CALCULANDO BLOQUEIO BRABO!');
        
        const nhEscudo = this.superCache.nhEscudo || this.superCache.dx;
        const { escudo, outros } = this.superCache.bonus;
        
        // Base: floor(NH/2) + 3
        const base = Math.floor(nhEscudo / 2) + 3;
        
        // Modificador
        const modInput = document.getElementById('bloqueioMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Total COM BÔNUS DO ESCUDO E OUTROS
        const total = base + modificador + escudo + outros;
        
        this.superCache.defesas.bloqueio = Math.max(total, 1);
        console.log(`🛡️ BLOQUEIO: ${total} (NH:${nhEscudo} base:${base} +escudo:${escudo} +outros:${outros})`);
    }
    
    calcularAPARARBrabo() {
        console.log('⚔️ CALCULANDO APARAR BRABO!');
        
        const nhArma = this.superCache.nhArma;
        const { outros } = this.superCache.bonus;
        
        if (!nhArma || nhArma <= 0) {
            this.superCache.defesas.aparar = 0;
            console.log('⚔️ APARAR: Nenhuma arma equipada');
            return;
        }
        
        // Base: floor(NH/2) + 3
        const base = Math.floor(nhArma / 2) + 3;
        
        // Modificador
        const modInput = document.getElementById('apararMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Total COM BÔNUS OUTROS
        const total = base + modificador + outros;
        
        this.superCache.defesas.aparar = Math.max(total, 1);
        console.log(`⚔️ APARAR: ${total} (NH:${nhArma} base:${base} +outros:${outros})`);
    }
    
    getRedutorCarga(nivelCarga) {
        const redutores = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4,
            'sobrecarregado': -4
        };
        return redutores[nivelCarga] || 0;
    }
    
    // ===== ATUALIZAÇÃO DA TELA =====
    atualizarTelaComExplosao() {
        console.log('💥 ATUALIZANDO TELA COM EXPLOSÃO!');
        
        // ESQUIVA
        const esquivaTotal = document.getElementById('esquivaTotal');
        if (esquivaTotal) {
            esquivaTotal.textContent = this.superCache.defesas.esquiva;
        }
        
        // DESLOCAMENTO
        const deslocamentoTotal = document.getElementById('deslocamentoTotal');
        if (deslocamentoTotal) {
            deslocamentoTotal.textContent = this.superCache.defesas.deslocamento.toFixed(2);
        }
        
        // BLOQUEIO
        const bloqueioTotal = document.getElementById('bloqueioTotal');
        if (bloqueioTotal) {
            bloqueioTotal.textContent = this.superCache.defesas.bloqueio;
        }
        
        // APARAR
        const apararTotal = document.getElementById('apararTotal');
        if (apararTotal) {
            apararTotal.textContent = this.superCache.defesas.aparar || 0;
        }
        
        // MODIFICADORES (mantém o que usuário digitou)
        this.atualizarModificadores();
    }
    
    atualizarModificadores() {
        // Só atualiza se mudou no cache
        const defesas = ['esquiva', 'bloqueio', 'aparar', 'deslocamento'];
        
        defesas.forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                // Não sobrescreve o que o usuário digitou
                // Só atualiza se for NaN
                if (isNaN(parseInt(input.value))) {
                    input.value = '0';
                }
            }
        });
    }
    
    atualizarBonusTotalComFuria() {
        console.log('💰💰💰 ATUALIZANDO BÔNUS TOTAL COM FÚRIA!');
        
        const { reflexos, escudo, capa, outros } = this.superCache.bonus;
        const total = reflexos + escudo + capa + outros;
        
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
            console.log(`💰 BÔNUS TOTAL: ${total >= 0 ? '+' : ''}${total}`);
        }
    }
    
    // ===== MONITORES ULTRA BRABOS =====
    configurarMonitoresUltraBrabos() {
        console.log('👁️‍🗨️👁️‍🗨️👁️‍🗨️ CONFIGURANDO MONITORES ULTRA BRABOS! 👁️‍🗨️👁️‍🗨️👁️‍🗨️');
        
        // Monitorar INPUTS DE BÔNUS (IMPORTANTE!)
        this.monitorarBonusComLoucura();
        
        // Monitorar ATRIBUTOS
        this.monitorarAtributosComVigor();
        
        // Monitorar CARGA
        this.monitorarCargaComForca();
        
        // Monitorar EQUIPAMENTOS
        this.monitorarEquipamentosComRaiva();
        
        // Monitorar PERÍCIAS
        this.monitorarPericiasComOdio();
        
        // Monitorar QUALQUER MUDANÇA NO DOM
        this.monitorarTudoQueSeMexe();
    }
    
    monitorarBonusComLoucura() {
        console.log('💰 MONITORANDO BÔNUS COM LOUCURA!');
        
        const bonusIds = ['Reflexos', 'Escudo', 'Capa', 'Outros'];
        
        bonusIds.forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                // Evento de input (em tempo real)
                input.addEventListener('input', () => {
                    console.log(`💰 Bônus ${bonus} alterado: ${input.value}`);
                    this.superCache.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
                    this.atualizarTudoComForcaBruta();
                });
                
                // Evento de change (quando termina de digitar)
                input.addEventListener('change', () => {
                    console.log(`💰 Bônus ${bonus} confirmado: ${input.value}`);
                    this.superCache.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
                    this.atualizarTudoComForcaBruta();
                });
                
                // Valor inicial
                this.superCache.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
            }
        });
    }
    
    monitorarAtributosComVigor() {
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('input', () => {
                    setTimeout(() => {
                        this.superCache[atributo.toLowerCase()] = parseInt(input.value) || 10;
                        this.atualizarTudoComForcaBruta();
                    }, 300);
                });
                
                // Observador de mutations (catch all)
                const observer = new MutationObserver(() => {
                    this.superCache[atributo.toLowerCase()] = parseInt(input.value) || 10;
                    this.atualizarTudoComForcaBruta();
                });
                
                observer.observe(input, { attributes: true, attributeFilter: ['value'] });
            }
        });
    }
    
    monitorarCargaComForca() {
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            const observer = new MutationObserver(() => {
                console.log('🏋️ Carga alterada!');
                this.atualizarTudoComForcaBruta();
            });
            
            observer.observe(cargaElement, { 
                childList: true, 
                characterData: true,
                subtree: true 
            });
        }
    }
    
    monitorarEquipamentosComRaiva() {
        // Observa o card da arma
        const armaInfo = document.getElementById('armaInfo');
        if (armaInfo) {
            const observer = new MutationObserver(() => {
                console.log('⚔️ Arma alterada!');
                setTimeout(() => this.atualizarTudoComForcaBruta(), 500);
            });
            
            observer.observe(armaInfo, { 
                childList: true, 
                attributes: true,
                subtree: true 
            });
        }
    }
    
    monitorarPericiasComOdio() {
        // Observa container de perícias
        const container = document.getElementById('pericias-aprendidas') || 
                         document.getElementById('lista-pericias');
        
        if (container) {
            const observer = new MutationObserver(() => {
                console.log('📚 Perícias alteradas!');
                this.superCache.nhEscudo = null;
                this.superCache.nhArma = null;
                setTimeout(() => this.atualizarTudoComForcaBruta(), 700);
            });
            
            observer.observe(container, { 
                childList: true, 
                subtree: true 
            });
        }
    }
    
    monitorarTudoQueSeMexe() {
        // Observador global (só pra garantir)
        const observer = new MutationObserver((mutations) => {
            let relevante = false;
            
            for (const mutation of mutations) {
                const target = mutation.target;
                const id = target.id || '';
                const text = target.textContent || '';
                
                // Se mexeu em algo relacionado a defesas
                if (id.includes('defesa') || id.includes('bonus') || id.includes('arma') ||
                    text.includes('Escudo') || text.includes('NH') || text.includes('nível') ||
                    text.includes('equipado') || text.includes('carga')) {
                    relevante = true;
                    break;
                }
            }
            
            if (relevante) {
                console.log('👀 Algo relevante se mexeu!');
                setTimeout(() => this.atualizarTudoComForcaBruta(), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    // ===== INTERCEPTAÇÃO =====
    interceptarTudoQueExiste() {
        console.log('🎯 INTERCEPTANDO TUDO QUE EXISTE!');
        
        // Intercepta cliques nos botões de modificador
        document.querySelectorAll('.minus, .plus, .mod-btn').forEach(btn => {
            const originalClick = btn.onclick;
            
            btn.onclick = (e) => {
                if (originalClick) originalClick(e);
                setTimeout(() => this.atualizarTudoComForcaBruta(), 100);
            };
        });
        
        // Intercepta inputs de modificador
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (input.id && input.id.includes('Mod')) {
                input.addEventListener('change', () => {
                    setTimeout(() => this.atualizarTudoComForcaBruta(), 100);
                });
            }
        });
    }
    
    // ===== AUTO-DEFESA (atualiza sozinho) =====
    iniciarAutoDefesa() {
        console.log('🤖 INICIANDO AUTO-DEFESA!');
        
        // Atualiza a cada 5 segundos (só pra garantir)
        setInterval(() => {
            this.atualizarTudoComForcaBruta();
        }, 5000);
    }
    
    // ===== FUNÇÕES PÚBLICAS ULTRA BRABAS =====
    mostrarStatusBrabo() {
        console.log('=== 🦾 STATUS DO SISTEMA ULTRA BRABO 🦾 ===');
        console.log('💪 Atributos:', { DX: this.superCache.dx, HT: this.superCache.ht });
        console.log('💰 Bônus:', this.superCache.bonus);
        console.log('🎯 NHs:', { Escudo: this.superCache.nhEscudo, Arma: this.superCache.nhArma });
        console.log('🛡️ Defesas:', this.superCache.defesas);
        console.log('⏰ Última atualização:', new Date(this.superCache.ultimaAtualizacao).toLocaleTimeString());
        console.log('===========================================');
    }
    
    testarTudoBrabo() {
        console.log('🧪🧪🧪 TESTANDO TUDO BRABO! 🧪🧪🧪');
        this.mostrarStatusBrabo();
        
        // Testa cada bônus
        console.log('💰 Testando cálculo de bônus...');
        const totalBonus = this.superCache.bonus.reflexos + 
                          this.superCache.bonus.escudo + 
                          this.superCache.bonus.capa + 
                          this.superCache.bonus.outros;
        console.log(`💰 Bônus total calculado: ${totalBonus}`);
        
        // Testa se está sendo aplicado
        console.log('🎯 Verificando aplicação de bônus...');
        console.log(`🏃 Esquiva tem +${this.superCache.bonus.reflexos + this.superCache.bonus.outros} de bônus`);
        console.log(`🛡️ Bloqueio tem +${this.superCache.bonus.escudo + this.superCache.bonus.outros} de bônus`);
        console.log(`⚔️ Aparar tem +${this.superCache.bonus.outros} de bônus`);
        console.log(`👣 Deslocamento tem +${this.superCache.bonus.outros} de bônus`);
        
        console.log('✅✅✅ TESTE BRABO CONCLUÍDO! ✅✅✅');
    }
}

// ===== INICIALIZAÇÃO DO APOCALIPSE =====
let sistemaUltraBrabo;

function iniciarSistemaDoApocalypse() {
    if (sistemaUltraBrabo) {
        console.log('⚠️ Sistema já está ativo!');
        sistemaUltraBrabo.mostrarStatusBrabo();
        return sistemaUltraBrabo;
    }
    
    console.log('🌋🌋🌋 INICIANDO SISTEMA DO APOCALIPSE! 🌋🌋🌋');
    sistemaUltraBrabo = new SistemaDefesasUltraBrabo();
    window.sistemaDefesasUltraBrabo = sistemaUltraBrabo;
    
    // ESPERAR PÁGINA CARREGAR COMPLETAMENTE
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => sistemaUltraBrabo.iniciar(), 800);
        });
    } else {
        setTimeout(() => sistemaUltraBrabo.iniciar(), 800);
    }
    
    return sistemaUltraBrabo;
}

// INICIA AUTOMATICAMENTE QUANDO COMBATE É ABERTO
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function iniciarQuandoCombateAtivo() {
        if (combateTab && combateTab.classList.contains('active')) {
            console.log('🎯 ABA DE COMBATE DETECTADA! INICIANDO...');
            iniciarSistemaDoApocalypse();
        }
    }
    
    // Verificar inicialmente
    iniciarQuandoCombateAtivo();
    
    // Observar mudanças
    if (combateTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    iniciarQuandoCombateAtivo();
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
    }
});

// ===== FUNÇÕES GLOBAIS MEGA BRABAS =====
window.testarSistemaApocalypse = function() {
    if (!window.sistemaDefesasUltraBrabo) {
        console.log('❌ Sistema não iniciado. INICIANDO COM PODER...');
        iniciarSistemaDoApocalypse();
        return;
    }
    window.sistemaDefesasUltraBrabo.testarTudoBrabo();
};

window.mostrarStatusApocalypse = function() {
    if (window.sistemaDefesasUltraBrabo) {
        window.sistemaDefesasUltraBrabo.mostrarStatusBrabo();
    } else {
        console.log('❌ Sistema não está ativo!');
    }
};

window.forcarAtualizacaoApocalypse = function() {
    if (window.sistemaDefesasUltraBrabo) {
        console.log('💥💥💥 FORÇANDO ATUALIZAÇÃO APOCALÍPTICA! 💥💥💥');
        window.sistemaDefesasUltraBrabo.atualizarTudoComForcaBruta();
    } else {
        console.log('⚠️ Iniciando sistema primeiro...');
        iniciarSistemaDoApocalypse();
    }
};

// ATALHO RÁPIDO
window.D = function() { window.forcarAtualizacaoApocalypse(); };

console.log('🔥🔥🔥 SISTEMA DE DEFESAS ULTRA BRABO CARREGADO! 🔥🔥🔥');
console.log('💡 Use testarSistemaApocalypse() para testar tudo!');
console.log('💡 Use mostrarStatusApocalypse() para ver status!');
console.log('💡 Use forcarAtualizacaoApocalypse() ou D() para forçar atualização!');