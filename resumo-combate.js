// resumo-combate.js - SISTEMA DE RESUMO DE COMBATE EXPANDIDO
// ✅ Mostra TODAS as informações essenciais de combate para o GM

class ResumoCombate {
    constructor() {
        this.observadorAtivo = false;
        this.intervalos = [];
        this.init();
    }

    init() {
        console.log('⚔️ Inicializando Resumo de Combate Expandido...');
        
        // Esperar um pouco para garantir que sistemas estejam carregados
        setTimeout(() => {
            this.criarEstruturaResumo();
            this.configurarObservadores();
            this.atualizarTudo();
            console.log('✅ Resumo de Combate Expandido inicializado');
        }, 800);
    }

    criarEstruturaResumo() {
        const statusLinha = document.querySelector('.resumo-status-linha');
        if (!statusLinha) return;
        
        // Remove o card antigo de combate se existir
        const cardAntigo = document.querySelector('.card-status:has(h4 i.fa-fist-raised)');
        if (cardAntigo) {
            cardAntigo.remove();
        }
        
        // Cria novo card expandido
        const novoCard = document.createElement('div');
        novoCard.className = 'card-status resumo-combate-expandido';
        novoCard.innerHTML = `
            <div class="card-header">
                <h4><i class="fas fa-fist-raised"></i> COMBATE</h4>
            </div>
            <div class="status-content">
                <!-- VITALIDADE (PV/PF) -->
                <div class="vitalidade-micro">
                    <div class="vitalidade-micro-item pv">
                        <span class="vitalidade-micro-label">
                            <i class="fas fa-heartbeat"></i> PV
                        </span>
                        <span class="vitalidade-micro-valor pv" id="resumoPVtotal">-/-</span>
                    </div>
                    <div class="vitalidade-micro-item pf">
                        <span class="vitalidade-micro-label">
                            <i class="fas fa-wind"></i> PF
                        </span>
                        <span class="vitalidade-micro-valor pf" id="resumoPFtotal">-/-</span>
                    </div>
                </div>
                
                <!-- BARRAS DE PV E PF -->
                <div class="barras-vitalidade-micro">
                    <div class="barra-micro">
                        <div class="barra-fill-micro pv" id="resumoBarraPVmicro" style="width: 100%"></div>
                        <div class="barra-texto-micro" id="resumoTextoPVmicro">-/-</div>
                    </div>
                    <div class="barra-micro">
                        <div class="barra-fill-micro pf" id="resumoBarraPFmicro" style="width: 100%"></div>
                        <div class="barra-texto-micro" id="resumoTextoPFmicro">-/-</div>
                    </div>
                </div>
                
                <!-- DEFESAS -->
                <div class="defesas-micro-grid">
                    <div class="defesa-micro-card esquiva">
                        <span class="defesa-micro-label">Esquiva</span>
                        <span class="defesa-micro-valor" id="resumoEsquivaValor">-</span>
                    </div>
                    <div class="defesa-micro-card bloqueio">
                        <span class="defesa-micro-label">Bloqueio</span>
                        <span class="defesa-micro-valor" id="resumoBloqueioValor">-</span>
                    </div>
                    <div class="defesa-micro-card aparar">
                        <span class="defesa-micro-label">Aparar</span>
                        <span class="defesa-micro-valor" id="resumoApararValor">-</span>
                    </div>
                </div>
                
                <!-- DANO BASE -->
                <div class="dano-micro-container">
                    <div class="dano-micro-header">
                        <div class="dano-micro-titulo">
                            <i class="fas fa-bolt"></i> Dano Corporal
                        </div>
                    </div>
                    <div class="dano-micro-base">
                        <div class="dano-micro-tipo">
                            <span class="dano-micro-tipo-label">GDP</span>
                            <span class="dano-micro-tipo-valor" id="resumoDanoGDP">-</span>
                        </div>
                        <div class="dano-micro-tipo">
                            <span class="dano-micro-tipo-label">GEB</span>
                            <span class="dano-micro-tipo-valor" id="resumoDanoGEB">-</span>
                        </div>
                    </div>
                </div>
                
                <!-- ARMAS EQUIPADAS (Lista com scroll) -->
                <div class="armas-micro-container" id="armasEquipadasResumo">
                    <div class="arma-micro-item">
                        <div class="arma-micro-icone">
                            <i class="fas fa-fist-raised"></i>
                        </div>
                        <div class="arma-micro-info">
                            <div class="arma-micro-nome">Armas corporais</div>
                            <div class="arma-micro-detalhes">
                                <span class="arma-micro-dano">GDP: -, GEB: -</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RD (RESISTÊNCIA A DANO) -->
                <div class="rd-micro-container">
                    <div class="rd-micro-header">
                        <div class="rd-micro-titulo">
                            <i class="fas fa-shield-alt"></i> RD Total
                        </div>
                        <div class="rd-micro-total" id="resumoRDtotal">0</div>
                    </div>
                    <div class="rd-grid-micro" id="rdGridResumo">
                        <!-- Preenchido dinamicamente -->
                    </div>
                </div>
                
                <!-- CONDIÇÕES ATIVAS -->
                <div class="condicoes-micro-container">
                    <div class="condicoes-micro-header">
                        <i class="fas fa-clipboard-list"></i> Condições
                    </div>
                    <div class="condicoes-grid-micro" id="condicoesAtivasResumo">
                        <span class="condicao-micro-item">Nenhuma</span>
                    </div>
                </div>
                
                <!-- BOTÃO PARA VER MAIS -->
                <button class="btn-ver-combate" onclick="document.querySelector('[data-tab=\"combate\"]').click()">
                    <i class="fas fa-external-link-alt"></i> Abrir aba de Combate
                </button>
            </div>
        `;
        
        // Adiciona o card na linha de status
        statusLinha.appendChild(novoCard);
        
        // Inicializa a grid de RD
        this.inicializarRDGrid();
    }

    inicializarRDGrid() {
        const rdGrid = document.getElementById('rdGridResumo');
        if (!rdGrid) return;
        
        const partesRD = [
            { nome: 'Cabeça', id: 'cabeca' },
            { nome: 'Tronco', id: 'tronco' },
            { nome: 'Rosto', id: 'rosto' },
            { nome: 'Braços', id: 'bracos' },
            { nome: 'Pernas', id: 'pernas' }
        ];
        
        rdGrid.innerHTML = partesRD.map(parte => `
            <div class="rd-parte-micro" data-parte="${parte.id}">
                <span class="rd-parte-label">${parte.nome}</span>
                <span class="rd-parte-valor" id="rd${parte.id}Resumo">0</span>
            </div>
        `).join('');
    }

    configurarObservadores() {
        if (this.observadorAtivo) return;
        
        // Observa mudanças na aba de combate
        const intervalPVPF = setInterval(() => {
            this.atualizarVitalidade();
        }, 500);
        
        const intervalDefesas = setInterval(() => {
            this.atualizarDefesas();
        }, 1000);
        
        const intervalDano = setInterval(() => {
            this.atualizarDano();
        }, 1500);
        
        const intervalArmas = setInterval(() => {
            this.atualizarArmasEquipadas();
        }, 2000);
        
        const intervalRD = setInterval(() => {
            this.atualizarRD();
        }, 2500);
        
        const intervalCondicoes = setInterval(() => {
            this.atualizarCondicoes();
        }, 3000);
        
        // Guarda referências para limpar depois
        this.intervalos = [intervalPVPF, intervalDefesas, intervalDano, intervalArmas, intervalRD, intervalCondicoes];
        
        // Observa quando a aba Resumo é ativada
        const abaResumoBtn = document.querySelector('[data-tab="resumo"]');
        if (abaResumoBtn) {
            abaResumoBtn.addEventListener('click', () => {
                setTimeout(() => this.atualizarTudo(), 100);
            });
        }
        
        this.observadorAtivo = true;
    }

    atualizarTudo() {
        console.log('🔄 Atualizando Resumo de Combate...');
        
        this.atualizarVitalidade();
        this.atualizarDefesas();
        this.atualizarDano();
        this.atualizarArmasEquipadas();
        this.atualizarRD();
        this.atualizarCondicoes();
    }

    atualizarVitalidade() {
        // PV
        const pvAtual = document.getElementById('pvAtualDisplay')?.value;
        const pvMax = document.getElementById('pvMaxDisplay')?.textContent;
        
        if (pvAtual && pvMax) {
            const pvElem = document.getElementById('resumoPVtotal');
            const pvTexto = document.getElementById('resumoTextoPVmicro');
            const pvBarra = document.getElementById('resumoBarraPVmicro');
            
            if (pvElem) pvElem.textContent = `${pvAtual}/${pvMax}`;
            if (pvTexto) pvTexto.textContent = `${pvAtual}/${pvMax}`;
            
            if (pvBarra && pvMax > 0) {
                const porcentagem = Math.max(0, Math.min(100, (pvAtual / pvMax) * 100));
                pvBarra.style.width = `${porcentagem}%`;
                
                // Cor baseada na porcentagem
                if (porcentagem <= 25) {
                    pvBarra.style.background = 'linear-gradient(90deg, #e74c3c, #ff0000)';
                } else if (porcentagem <= 50) {
                    pvBarra.style.background = 'linear-gradient(90deg, #f39c12, #e74c3c)';
                } else if (porcentagem <= 75) {
                    pvBarra.style.background = 'linear-gradient(90deg, #f1c40f, #f39c12)';
                } else {
                    pvBarra.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
                }
            }
        }
        
        // PF
        const pfAtual = document.getElementById('pfAtualDisplay')?.value;
        const pfMax = document.getElementById('pfMaxDisplay')?.textContent;
        
        if (pfAtual && pfMax) {
            const pfElem = document.getElementById('resumoPFtotal');
            const pfTexto = document.getElementById('resumoTextoPFmicro');
            const pfBarra = document.getElementById('resumoBarraPFmicro');
            
            if (pfElem) pfElem.textContent = `${pfAtual}/${pfMax}`;
            if (pfTexto) pfTexto.textContent = `${pfAtual}/${pfMax}`;
            
            if (pfBarra && pfMax > 0) {
                const porcentagem = Math.max(0, Math.min(100, (pfAtual / pfMax) * 100));
                pfBarra.style.width = `${porcentagem}%`;
                
                // Cor baseada no estado
                const pfEstado = document.getElementById('pfEstadoDisplay')?.textContent;
                if (pfEstado === 'Exausto' || pfEstado === 'Fadigado') {
                    pfBarra.style.background = 'linear-gradient(90deg, #e67e22, #d35400)';
                } else {
                    pfBarra.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
                }
            }
        }
    }

    atualizarDefesas() {
        // Esquiva
        const esquivaTotal = document.getElementById('esquivaTotal')?.textContent;
        const esquivaElem = document.getElementById('resumoEsquivaValor');
        if (esquivaTotal && esquivaElem) {
            esquivaElem.textContent = esquivaTotal;
            esquivaElem.title = `Esquiva: ${esquivaTotal}`;
        }
        
        // Bloqueio
        const bloqueioTotal = document.getElementById('bloqueioTotal')?.textContent;
        const bloqueioElem = document.getElementById('resumoBloqueioValor');
        if (bloqueioTotal && bloqueioElem) {
            bloqueioElem.textContent = bloqueioTotal;
            bloqueioElem.title = `Bloqueio: ${bloqueioTotal}`;
        }
        
        // Aparar
        const apararTotal = document.getElementById('apararTotal')?.textContent;
        const apararElem = document.getElementById('resumoApararValor');
        if (apararTotal && apararElem) {
            apararElem.textContent = apararTotal;
            apararElem.title = `Aparar: ${apararTotal}`;
        }
    }

    atualizarDano() {
        // GDP
        const danoGDP = document.getElementById('danoGdp')?.textContent;
        const danoGDPelem = document.getElementById('resumoDanoGDP');
        if (danoGDP && danoGDPelem) {
            danoGDPelem.textContent = danoGDP;
            danoGDPelem.title = `Golpe de Punho: ${danoGDP}`;
        }
        
        // GEB
        const danoGEB = document.getElementById('danoGeb')?.textContent;
        const danoGEBelem = document.getElementById('resumoDanoGEB');
        if (danoGEB && danoGEBelem) {
            danoGEBelem.textContent = danoGEB;
            danoGEBelem.title = `Golpe de Braço: ${danoGEB}`;
        }
    }

    atualizarArmasEquipadas() {
        const container = document.getElementById('armasEquipadasResumo');
        if (!container) return;
        
        // Verifica se tem arma equipada na aba de combate
        const semArma = document.getElementById('semArma');
        const comArma = document.getElementById('comArma');
        
        if (semArma && semArma.style.display !== 'none') {
            // Mostra dano corporal
            const danoGDP = document.getElementById('danoGdp')?.textContent || '-';
            const danoGEB = document.getElementById('danoGeb')?.textContent || '-';
            
            container.innerHTML = `
                <div class="arma-micro-item">
                    <div class="arma-micro-icone">
                        <i class="fas fa-fist-raised"></i>
                    </div>
                    <div class="arma-micro-info">
                        <div class="arma-micro-nome">Corpo</div>
                        <div class="arma-micro-detalhes">
                            <span class="arma-micro-dano">GDP: ${danoGDP}, GEB: ${danoGEB}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (comArma && comArma.style.display !== 'none') {
            // Extrai informações das armas do sistema-dano.js
            const armaDanoContainer = document.getElementById('armaDano');
            if (armaDanoContainer) {
                const armasHTML = armaDanoContainer.innerHTML;
                
                // Pega todos os containers de arma
                const containersArma = armaDanoContainer.querySelectorAll('div[style*="background: rgba(0, 0, 0, 0.4)"]');
                
                if (containersArma.length > 0) {
                    let html = '';
                    
                    containersArma.forEach((containerArma, index) => {
                        const nomeArma = containerArma.querySelector('div[style*="font-size: 1.1em"]')?.textContent || 'Arma';
                        const danos = containerArma.querySelectorAll('div[style*="display: flex; justify-content: space-between"]');
                        
                        let detalhesDano = '';
                        danos.forEach(dano => {
                            const base = dano.querySelector('span[style*="color:"]')?.textContent || '';
                            const valor = dano.querySelector('span[style*="font-family: \'Courier New\'"]')?.textContent || '';
                            const tipo = dano.querySelector('span[style*="color: #AAAAAA"]')?.textContent || '';
                            
                            if (base && valor) {
                                detalhesDano += `${base}: ${valor}${tipo ? ` (${tipo})` : ''}, `;
                            }
                        });
                        
                        // Remove última vírgula
                        detalhesDano = detalhesDano.replace(/, $/, '');
                        
                        html += `
                            <div class="arma-micro-item">
                                <div class="arma-micro-icone">
                                    <i class="fas ${index === 0 ? 'fa-sword' : 'fa-crosshairs'}"></i>
                                </div>
                                <div class="arma-micro-info">
                                    <div class="arma-micro-nome">${nomeArma}</div>
                                    <div class="arma-micro-detalhes">
                                        <span class="arma-micro-dano">${detalhesDano}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    container.innerHTML = html;
                } else {
                    // Fallback: mostra o que tem no armaDano
                    const armaNome = document.getElementById('armaNome')?.textContent || 'Arma';
                    const armaDano = document.getElementById('armaDano')?.textContent || '';
                    const armaTipo = document.getElementById('armaTipo')?.textContent || '';
                    
                    container.innerHTML = `
                        <div class="arma-micro-item">
                            <div class="arma-micro-icone">
                                <i class="fas fa-sword"></i>
                            </div>
                            <div class="arma-micro-info">
                                <div class="arma-micro-nome">${armaNome}</div>
                                <div class="arma-micro-detalhes">
                                    <span class="arma-micro-dano">${armaDano} ${armaTipo}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }

    atualizarRD() {
        // Total RD
        const rdTotal = document.getElementById('rdTotal')?.textContent || '0';
        const rdTotalElem = document.getElementById('resumoRDtotal');
        if (rdTotalElem) {
            rdTotalElem.textContent = rdTotal;
        }
        
        // Atualiza partes individuais do RD
        const partes = ['cabeca', 'tronco', 'rosto', 'bracos', 'pernas'];
        
        partes.forEach(parte => {
            const inputRD = document.querySelector(`.rd-input[data-parte="${parte}"]`)?.value || 0;
            const rdElem = document.getElementById(`rd${parte}Resumo`);
            const container = document.querySelector(`.rd-parte-micro[data-parte="${parte}"]`);
            
            if (rdElem) {
                rdElem.textContent = inputRD;
                
                // Adiciona classe visual
                if (container) {
                    container.classList.remove('com-protecao', 'sem-protecao');
                    
                    if (inputRD > 0) {
                        container.classList.add('com-protecao');
                        container.title = `RD ${inputRD}`;
                    } else {
                        container.classList.add('sem-protecao');
                        container.title = 'Sem proteção';
                    }
                }
            }
        });
    }

    atualizarCondicoes() {
        const container = document.getElementById('condicoesAtivasResumo');
        if (!container) return;
        
        try {
            // Verifica condições na aba de combate
            const condicoesAtivas = [];
            
            // 1. Verifica fadiga pelo sistema PV/PF
            const pfEstado = document.getElementById('pfEstadoDisplay')?.textContent;
            if (pfEstado === 'Fadigado' || pfEstado === 'Exausto') {
                condicoesAtivas.push('Fadigado');
            }
            
            // 2. Verifica PV crítico
            const pvAtual = parseInt(document.getElementById('pvAtualDisplay')?.value) || 10;
            const pvMax = parseInt(document.getElementById('pvMaxDisplay')?.textContent) || 10;
            const porcentagemPV = (pvAtual / pvMax) * 100;
            
            if (porcentagemPV <= 25) {
                condicoesAtivas.push('Ferido Grave');
            } else if (porcentagemPV <= 50) {
                condicoesAtivas.push('Ferido');
            } else if (porcentagemPV <= 0) {
                condicoesAtivas.push('Inconsciente');
            }
            
            // 3. Verifica condições marcadas na aba de combate
            const condicoesCheckboxes = document.querySelectorAll('.condicao-item.ativa');
            if (condicoesCheckboxes.length > 0) {
                condicoesCheckboxes.forEach(item => {
                    const condicao = item.getAttribute('data-condicao');
                    if (condicao && !condicoesAtivas.includes(condicao)) {
                        condicoesAtivas.push(condicao.charAt(0).toUpperCase() + condicao.slice(1));
                    }
                });
            }
            
            // Atualiza exibição
            if (condicoesAtivas.length > 0) {
                container.innerHTML = condicoesAtivas.map(condicao => `
                    <span class="condicao-micro-item ativa">${condicao}</span>
                `).join('');
            } else {
                container.innerHTML = `<span class="condicao-micro-item">Nenhuma</span>`;
            }
            
        } catch (error) {
            console.warn('Erro ao atualizar condições:', error);
            container.innerHTML = `<span class="condicao-micro-item">-</span>`;
        }
    }

    // Limpa os intervalos quando necessário
    destruir() {
        this.intervalos.forEach(interval => clearInterval(interval));
        this.intervalos = [];
        this.observadorAtivo = false;
    }
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda sistemas carregarem
    setTimeout(() => {
        // Inicializa apenas se estiver na aba Resumo
        if (document.querySelector('#resumo.tab-content.active')) {
            window.resumoCombate = new ResumoCombate();
        }
        
        // Observa mudanças de aba
        const abaResumoBtn = document.querySelector('[data-tab="resumo"]');
        if (abaResumoBtn) {
            abaResumoBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (!window.resumoCombate) {
                        window.resumoCombate = new ResumoCombate();
                    } else {
                        window.resumoCombate.atualizarTudo();
                    }
                }, 200);
            });
        }
    }, 1500);
});