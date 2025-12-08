// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA =====
console.log("🚀 INICIANDO SISTEMA DE TÉCNICAS");

let estadoTecnicas = {
    pontosTecnicasTotal: 0,
    pontosMedio: 0,
    pontosDificil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    qtdTotal: 0,
    tecnicasAprendidas: [],
    filtroAtivo: 'todas-tecnicas',
    buscaAtiva: '',
    tecnicasDisponiveis: [],
    modalAberto: false,
    tecnicaSelecionada: null
};

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        // Difícil: 2,3,4,5,6... (média ~1 ponto por nível)
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        if (niveisAcima === 5) return 6;
        if (niveisAcima === 6) return 7;
        if (niveisAcima === 7) return 8;
        if (niveisAcima === 8) return 9;
        if (niveisAcima === 9) return 10;
        if (niveisAcima === 10) return 11;
        return niveisAcima + 1; // Padrão: n+1
    }
    
    if (dificuldade === 'Média') {
        // Média: 1,2,3,4,5... (1 ponto por nível)
        return niveisAcima;
    }
    
    return 0;
}

// ===== FUNÇÃO QUE NUNCA USA VALOR PADRÃO 10 =====
function obterNHPericiaPorId(idPericia) {
    console.log("🎯 BUSCANDO NH - SEM VALOR PADRÃO");
    
    if (idPericia === 'arco') {
        console.log("=== BUSCANDO NH ARCO REAL ===");
        
        // ❌ REMOVER ESTE VALOR PADRÃO
        // let nhArco = 10; ← ESTA LINHA É O PROBLEMA!
        
        // Em vez disso: BUSCAR ATÉ ENCONTRAR
        let nhArco = null; // Começa como null, não 10!
        
        // 1. BUSCAR NO SISTEMA DE PERÍCIAS
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
            if (periciaArco) {
                console.log("✅ Perícia Arco encontrada:", periciaArco);
                
                // O NH deve estar em alguma dessas propriedades:
                if (periciaArco.nh !== undefined) {
                    nhArco = periciaArco.nh;
                    console.log(`✅ NH da propriedade .nh: ${nhArco}`);
                } 
                else if (periciaArco.NH !== undefined) {
                    nhArco = periciaArco.NH;
                    console.log(`✅ NH da propriedade .NH: ${nhArco}`);
                }
                else if (periciaArco.valor !== undefined) {
                    nhArco = periciaArco.valor;
                    console.log(`✅ NH da propriedade .valor: ${nhArco}`);
                }
                else {
                    console.log("ℹ️ Perícia encontrada, mas sem propriedade NH clara:", periciaArco);
                    
                    // Se tiver nível, podemos buscar DX e calcular
                    if (periciaArco.nivel !== undefined) {
                        const dx = obterDXDoSistema();
                        nhArco = dx + periciaArco.nivel;
                        console.log(`📊 NH calculado: DX ${dx} + nível ${periciaArco.nivel} = ${nhArco}`);
                    }
                }
            }
        }
        
        // 2. SE AINDA NÃO ENCONTROU, BUSCAR NA INTERFACE
        if (nhArco === null) {
            console.log("🔍 Procurando NH na interface...");
            
            // Procurar elementos que mostram NH Arco
            const elementos = document.querySelectorAll('.pericia-aprendida-nivel, .pericia-nh, [class*="nh"], [class*="NH"]');
            
            for (const el of elementos) {
                const texto = el.textContent || '';
                const parent = el.closest('.pericia-aprendida-item, .pericia-item');
                
                if (parent) {
                    const nome = parent.querySelector('.pericia-aprendida-nome, .pericia-nome');
                    if (nome && nome.textContent.includes('Arco')) {
                        const match = texto.match(/(\d+)/);
                        if (match) {
                            nhArco = parseInt(match[1]);
                            console.log(`✅ NH encontrado na interface: ${nhArco}`);
                            break;
                        }
                    }
                }
            }
        }
        
        // 3. SE AINDA NÃO, BUSCAR NO LOCALSTORAGE
        if (nhArco === null) {
            try {
                const salvo = localStorage.getItem('periciasAprendidas');
                if (salvo) {
                    const pericias = JSON.parse(salvo);
                    const periciaArco = pericias.find(p => p.id === 'arco');
                    if (periciaArco) {
                        // Procurar qualquer propriedade numérica que possa ser o NH
                        for (const key in periciaArco) {
                            const valor = periciaArco[key];
                            if (typeof valor === 'number' && valor > 5 && valor < 30) {
                                nhArco = valor;
                                console.log(`✅ NH do localStorage (chave ${key}): ${nhArco}`);
                                break;
                            }
                        }
                        
                        // Se não encontrou propriedade numérica, ver nível
                        if (nhArco === null && periciaArco.nivel !== undefined) {
                            const dx = obterDXDoSistema();
                            nhArco = dx + periciaArco.nivel;
                            console.log(`📊 NH calculado do localStorage: DX ${dx} + nível ${periciaArco.nivel} = ${nhArco}`);
                        }
                    }
                }
            } catch (e) {
                console.error("Erro localStorage:", e);
            }
        }
        
        // 4. SE NADA FUNCIONOU, MOSTRAR ERRO CLARO
        if (nhArco === null) {
            console.error("❌❌❌ NÃO FOI POSSÍVEL ENCONTRAR O NH ARCO!");
            console.error("Verifique se:");
            console.error("1. A perícia Arco foi aprendida");
            console.error("2. O sistema de perícias está carregado");
            console.error("3. A propriedade 'nh' ou 'nivel' existe na perícia");
            
            // Para não quebrar tudo, usar um valor óbvio que mostre o erro
            nhArco = 0; // Zero para mostrar que tem erro
        }
        
        console.log(`✅ NH ARCO FINAL: ${nhArco}`);
        console.log(`🔧 Arquearia Montada base: ${nhArco} - 4 = ${nhArco - 4}`);
        
        return nhArco;
    }
    
    // Para outras perícias, retornar null se não encontrar
    return null;
}

// ===== FUNÇÃO AUXILIAR PARA PEGAR DX =====
function obterDXDoSistema() {
    // Esta função só é usada se precisarmos calcular
    let dx = 10;
    
    if (window.obterAtributoAtual) {
        dx = window.obterAtributoAtual('DX');
    } else {
        const dxInput = document.getElementById('DX');
        if (dxInput) dx = parseInt(dxInput.value) || 10;
    }
    
    return dx;
}

// ===== FUNÇÃO ADICIONAL: ATUALIZAR TÉCNICA EM TEMPO REAL =====
function atualizarTecnicaEmTempoReal() {
    console.log("🔄 Atualizando técnica em tempo real...");
    
    // Atualizar técnicas aprendidas
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia === 'arco') {
            // Recalcular NH base baseado no Arco atual
            const nhArcoAtual = obterNHPericiaPorId('arco');
            const nhBaseAtual = nhArcoAtual - 4;
            
            console.log(`📊 Técnica "${tecnica.nome}" atualizada: NH Arco=${nhArcoAtual}, Base=${nhBaseAtual}`);
        }
    });
    
    // Atualizar display
    if (estadoTecnicas.modalAberto && estadoTecnicas.tecnicaSelecionada) {
        // Fechar e reabrir modal para atualizar valores
        fecharModalTecnica();
        setTimeout(() => {
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === estadoTecnicas.tecnicaSelecionada.id);
            if (tecnica) {
                abrirModalTecnica(tecnica);
            }
        }, 100);
    }
    
    // Atualizar lista de técnicas aprendidas
    renderizarTecnicasAprendidas();
}

// ===== VERIFICAR SE TEM PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    console.log("🔍 Verificando pré-requisitos para:", tecnica.nome);
    
    if (!tecnica.preRequisitos || !window.estadoPericias) {
        console.log("✅ Sem pré-requisitos específicos");
        return { passou: true, motivo: '' };
    }
    
    // Verificar Arco-4
    const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
    if (reqArco) {
        const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (!periciaArco) {
            return { 
                passou: false, 
                motivo: `❌ Precisa da perícia Arco (nível ${reqArco.nivelMinimo})` 
            };
        }
        
        if (periciaArco.nivel < reqArco.nivelMinimo) {
            return { 
                passou: false, 
                motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo} (atual: ${periciaArco.nivel})` 
            };
        }
    }
    
    // Verificar Cavalgar
    const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
    if (reqCavalgar) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            reqCavalgar.idsCavalgar.includes(p.id) || p.id.includes('cavalgar')
        );
        
        if (!temCavalgar) {
            return { 
                passou: false, 
                motivo: '❌ Precisa de alguma perícia de Cavalgar' 
            };
        }
    }
    
    console.log("✅ Todos os pré-requisitos atendidos");
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    
    const disponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH base (Arco-4)
        let nhBase = 0;
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
            
            // Adicionar níveis comprados se já aprendida
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            motivoIndisponivel: verificacao.motivo,
            jaAprendida: !!jaAprendida
        };
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container não encontrado!");
        return;
    }
    
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        // Filtro por dificuldade
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        // Busca
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            return tecnica.nome.toLowerCase().includes(busca) || 
                   tecnica.descricao.toLowerCase().includes(busca);
        }
        
        return true;
    });
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica disponível</div>
                <small>Verifique se você tem os pré-requisitos necessários</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        
        html += `
            <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}" 
                 data-id="${tecnica.id}"
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; 
                        opacity: ${disponivel ? '1' : '0.6'};
                        background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                        border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};">
                
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome}
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                    </div>
                </div>
                
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${!disponivel ? `
                    <div class="tecnica-indisponivel-badge">
                        <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                    </div>
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                        <i class="fas fa-bullseye"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    const itens = container.querySelectorAll('.pericia-item');
    itens.forEach(item => {
        if (item.classList.contains('item-indisponivel')) return;
        
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica && tecnica.disponivel) {
                abrirModalTecnica(tecnica);
            }
        });
    });
}

// ===== ABRIR MODAL DE COMPRA - VERSÃO ATUALIZADA EM TEMPO REAL =====
function abrirModalTecnica(tecnica) {
    console.log("🎯 Abrindo modal para:", tecnica.nome);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores base COM VALORES ATUAIS
    const nhArco = obterNHPericiaPorId('arco');
    const nhBase = nhArco - 4; // Pré-definido: Arco-4
    const nhMaximo = nhArco; // Não pode exceder o NH em Arco
    
    // Calcular NH atual (base + níveis comprados)
    let nhAtual = nhBase;
    let niveisComprados = 0;
    let custoTotal = 0;
    
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        custoTotal = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisComprados;
    }
    
    // Garantir que não excede o máximo
    if (nhAtual > nhMaximo) {
        nhAtual = nhMaximo;
        niveisComprados = nhMaximo - nhBase;
    }
    
    // Criar opções de NH
    let opcoesHTML = '';
    const niveisPossiveis = nhMaximo - nhBase;
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisComprados ? 'selected' : '';
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal
    const modalHTML = `
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700;">×</span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">${tecnica.dificuldade} • Técnica Especial</div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <!-- Informações da Técnica -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Base (Arco-4)</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #95a5a6;">NH Arco: ${nhArco} - 4</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo (NH Arco)</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                    <div style="font-size: 11px; color: #95a5a6;">Limite máximo</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #95a5a6;">Base + ${niveisComprados}</div>
                </div>
            </div>
            
            <!-- Seleção de Nível -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica" 
                        style="width: 100%; padding: 12px; border-radius: 5px; border: 2px solid #ff8c00; 
                               background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                    Cada nível custa aproximadamente 1 ponto (média)
                </div>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #27ae60; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
                    ${custoTotal} pontos
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.5;">${tecnica.descricao}</p>
            </div>
            
            <!-- Regras -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #9b59b6;">
                <h5 style="color: #9b59b6; margin-top: 0; margin-bottom: 10px;">
                    <i class="fas fa-info-circle"></i> Regras Importantes
                </h5>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>NH base = NH em Arco - 4 (pré-definido)</li>
                    <li>Pode comprar níveis adicionais acima da base</li>
                    <li>O NH nesta técnica NUNCA pode exceder o NH em Arco</li>
                    <li>Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
                </ul>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" 
                    style="padding: 12px 24px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                Cancelar
            </button>
            <button onclick="comprarTecnica()" 
                    id="btn-comprar-tecnica"
                    style="padding: 12px 24px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }
    
    modal.innerHTML = modalHTML;
    document.querySelector('.modal-tecnica-overlay').style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    
    function atualizarCusto() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisComprados) {
                btnComprar.textContent = 'Manter';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.textContent = jaAprendida ? 'Atualizar' : 'Comprar';
                btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnComprar.disabled = false;
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
}

// ===== COMPRAR/ATUALIZAR TÉCNICA =====
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("Erro: Nenhuma técnica selecionada!");
        return;
    }
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("Erro: Seletor não encontrado!");
        return;
    }
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAquisicao: new Date().toISOString(),
            baseCalculo: estadoTecnicas.tecnicaSelecionada.baseCalculo
        });
    }
    
    // Salvar no localStorage
    salvarTecnicas();
    
    // Atualizar tudo
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Mensagem
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!`);
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH atual COM VALORES ATUAIS
        let nhArco = obterNHPericiaPorId('arco');
        const nhBase = nhArco - 4; // Sempre Arco-4
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); border-color: rgba(155, 89, 182, 0.4);">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">
                        ${tecnica.nome}
                        <span style="color: #e67e22; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (Arco-4 + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhAtual}</span>
                        <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-top: 5px;">
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>Base (Arco-4):</strong> ${nhBase}</div>
                    <div><strong>Máximo possível (NH Arco):</strong> ${nhArco}</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" 
                        class="btn-remover-pericia">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Tem certeza que deseja remover esta técnica? Os pontos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    // Zerar contadores
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    // Calcular
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoTotal || 0;
        estadoTecnicas.pontosTecnicasTotal += custo;
        
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar HTML
    const elementos = {
        'qtd-tecnicas-medio': estadoTecnicas.qtdMedio,
        'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil,
        'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`,
        'qtd-tecnicas-total': estadoTecnicas.qtdTotal,
        'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
    
    // Badge total
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
    }
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modal = document.querySelector('.modal-tecnica-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== SALVAR/CARREGAR =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar técnicas:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas`);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            // Atualizar botões ativos
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', function(e) {
        if (estadoTecnicas.modalAberto && e.target.classList.contains('modal-tecnica-overlay')) {
            fecharModalTecnica();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

// ===== OBSERVAR MUDANÇAS NAS PERÍCIAS E ATRIBUTOS =====
function observarMudancas() {
    console.log("👀 Sistema de Técnicas: Modo seguro ativado");
    
    // Flag para evitar atualizações simultâneas
    let atualizando = false;
    
    // Função de atualização segura
    function atualizarComSeguranca() {
        if (atualizando) return;
        
        atualizando = true;
        console.log("🔄 Atualizando técnicas (seguro)...");
        
        setTimeout(() => {
            try {
                atualizarTecnicasDisponiveis();
            } catch (error) {
                console.error("❌ Erro ao atualizar técnicas:", error);
            }
            atualizando = false;
        }, 300);
    }
    
    // Função específica para atualização por atributos
    function atualizarPorAtributos() {
        if (atualizando) return;
        
        atualizando = true;
        console.log("🎯 Atributos alterados, atualizando técnicas...");
        
        setTimeout(() => {
            try {
                atualizarTecnicaEmTempoReal();
                atualizarTecnicasDisponiveis();
            } catch (error) {
                console.error("❌ Erro ao atualizar por atributos:", error);
            }
            atualizando = false;
        }, 500);
    }
    
    // 1. Eventos que disparam atualização
    document.addEventListener('atributosAlterados', atualizarPorAtributos);
    
    // 2. Atualizar quando o usuário interagir com a aba de perícias
    document.addEventListener('click', function(e) {
        // Só verificar se estamos na aba de perícias
        const abaPericias = document.getElementById('pericias');
        if (!abaPericias || abaPericias.style.display === 'none') {
            return;
        }
        
        // Verificar se clicou em elementos relacionados a perícias
        const elementosPericia = [
            '.pericia-item',
            '.pericia-aprendida-item',
            '.btn-remover-pericia',
            '.filtro-btn[data-filtro]',
            '#busca-pericias',
            '#busca-tecnicas',
            '.modal-pericia-overlay',
            '.modal-especializacao-overlay'
        ];
        
        // Verificar se o clique foi em algum desses elementos
        for (const seletor of elementosPericia) {
            if (e.target.closest(seletor)) {
                setTimeout(() => {
                    atualizarComSeguranca();
                }, 1500); // Delay maior para garantir que a ação foi completada
                break;
            }
        }
    });
    
    // 3. Atualizar periodicamente, mas com intervalo longo
    // (Só quando o modal NÃO estiver aberto)
    setInterval(() => {
        if (!estadoTecnicas.modalAberto && !atualizando) {
            atualizarComSeguranca();
        }
    }, 15000); // 15 segundos é suficiente
    
    // 4. Adicionar também um listener para quando o usuário sai do modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            // Quando fecha modal com ESC, atualizar depois
            setTimeout(() => {
                atualizarComSeguranca();
            }, 500);
        }
    });
    
    // 5. Observar mudanças visíveis no DOM das perícias aprendidas
    // (Versão simplificada que não causa flicker)
    let ultimaContagemPericias = 0;
    
    const verificarMudancasPericias = () => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
            return;
        }
        
        const novaContagem = window.estadoPericias.periciasAprendidas.length;
        
        if (novaContagem !== ultimaContagemPericias) {
            console.log(`📊 Contagem de perícias mudou: ${ultimaContagemPericias} → ${novaContagem}`);
            ultimaContagemPericias = novaContagem;
            atualizarComSeguranca();
        }
    };
    
    // Verificar a cada 3 segundos
    setInterval(verificarMudancasPericias, 3000);
    
    console.log("✅ Sistema de observação configurado com segurança");
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // 1. Carregar técnicas salvas
    carregarTecnicas();
    
    // 2. Configurar eventos
    configurarEventListenersTecnicas();
    
    // 3. Observar mudanças nas perícias e atributos
    observarMudancas();
    
    // 4. Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO!");
    }, 500);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Esperar que a aba de perícias carregue
    const verificarAba = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(verificarAba);
            
            // Esperar um pouco mais para garantir que tudo carregou
            setTimeout(() => {
                if (!window.sistemaTecnicasInicializado) {
                    inicializarSistemaTecnicas();
                    window.sistemaTecnicasInicializado = true;
                }
            }, 1000);
        }
    }, 500);
    
    // Observar mudança de abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 500);
                    } else {
                        // Já inicializado, apenas atualizar
                        atualizarTecnicasDisponiveis();
                    }
                }
            }
        });
    });
    
    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicaEmTempoReal = atualizarTecnicaEmTempoReal;

console.log("🎮 Módulo de técnicas carregado e pronto!");