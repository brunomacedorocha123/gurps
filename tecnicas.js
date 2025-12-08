// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL =====
// Integração perfeita com sistema-pericias.js

console.log("🎯 SISTEMA DE TÉCNICAS - INICIANDO CARGA...");

// ===== CONFIGURAÇÃO DO SISTEMA =====
const estadoTecnicas = {
    tecnicasAprendidas: [],
    tecnicasDisponiveis: [],
    pontosTotal: 0,
    modalAtivo: false,
    tecnicaSelecionada: null,
    filtroAtual: 'todas-tecnicas',
    buscaAtual: ''
};

// ===== TABELA DE CUSTO SIMPLIFICADA =====
const CUSTO_TECNICA = {
    'Média': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'Difícil': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

// ===== FUNÇÕES CORE - CONEXÃO COM PERÍCIAS =====

function obterNHPericiaBase(idPericia) {
    console.log(`📊 Calculando NH para: ${idPericia}`);
    
    // 1. Verificar se o sistema de perícias está carregado
    if (!window.estadoPericias) {
        console.error("❌ Sistema de perícias não encontrado em window.estadoPericias");
        console.log("💡 Verificando window.sistemaPericias...");
        
        // Tentar alternativa
        if (window.sistemaPericias && window.sistemaPericias.estadoPericias) {
            window.estadoPericias = window.sistemaPericias.estadoPericias;
            console.log("✅ Usando sistemaPericias.estadoPericias");
        } else {
            console.log("⚠️ Usando valor padrão DX=10");
            return 10; // Fallback
        }
    }
    
    // 2. Buscar a perícia nas aprendidas
    const periciaAprendida = window.estadoPericias.periciasAprendidas?.find(p => {
        // Comparação direta por ID
        if (p.id === idPericia) return true;
        
        // Para Arco
        if (idPericia === 'arco' && (p.id === 'arco' || p.nome?.includes('Arco'))) return true;
        
        // Para Cavalgar
        if (idPericia.includes('cavalgar') && (p.id.includes('cavalgar') || p.nome?.includes('Cavalgar'))) return true;
        
        return false;
    });
    
    // 3. Se encontrou a perícia, calcular NH
    if (periciaAprendida) {
        console.log(`✅ Perícia encontrada: ${periciaAprendida.nome} (nível ${periciaAprendida.nivel})`);
        
        // Obter atributo base
        let atributoBase = 10;
        const atributo = periciaAprendida.atributo || 'DX';
        
        switch(atributo) {
            case 'DX':
                atributoBase = parseInt(document.getElementById('DX')?.value) || 10;
                break;
            case 'IQ':
                atributoBase = parseInt(document.getElementById('IQ')?.value) || 10;
                break;
            case 'HT':
                atributoBase = parseInt(document.getElementById('HT')?.value) || 10;
                break;
            case 'PERC':
                const iq = parseInt(document.getElementById('IQ')?.value) || 10;
                const bonusPercepcao = parseInt(document.getElementById('bonusPercepcao')?.value) || 0;
                atributoBase = iq + bonusPercepcao;
                break;
        }
        
        // Calcular NH: atributo + nível
        const nivel = periciaAprendida.nivel || 0;
        const nh = atributoBase + nivel;
        
        console.log(`🧮 NH ${periciaAprendida.nome}: ${atributoBase} (${atributo}) + ${nivel} = ${nh}`);
        return nh;
    }
    
    // 4. Se não encontrou, usar atributo base
    console.log(`⚠️ Perícia "${idPericia}" não aprendida, usando atributo base`);
    
    // Determinar qual atributo usar
    let atributoBase = 10;
    if (idPericia === 'arco' || idPericia.includes('arco')) {
        atributoBase = parseInt(document.getElementById('DX')?.value) || 10;
    } else if (idPericia.includes('cavalgar')) {
        atributoBase = parseInt(document.getElementById('DX')?.value) || 10;
    }
    
    return atributoBase;
}

// ===== VERIFICAÇÃO DE PRÉ-REQUISITOS =====

function verificarPreRequisitos(tecnica) {
    console.log(`🔍 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = {
        passou: true,
        motivos: []
    };
    
    // Verificar Arco nível 4
    if (tecnica.basePericia === 'arco') {
        const arco = window.estadoPericias?.periciasAprendidas?.find(p => 
            p.id === 'arco' || p.nome?.includes('Arco')
        );
        
        if (!arco) {
            resultados.passou = false;
            resultados.motivos.push("❌ Não possui a perícia Arco");
        } else if ((arco.nivel || 0) < 4) {
            resultados.passou = false;
            resultados.motivos.push(`❌ Arco precisa nível 4 (atual: ${arco.nivel || 0})`);
        } else {
            resultados.motivos.push(`✅ Arco nível ${arco.nivel || 0} (mínimo: 4)`);
        }
    }
    
    // Verificar Cavalgar
    const cavalgar = window.estadoPericias?.periciasAprendidas?.find(p => 
        p.id.includes('cavalgar') || p.nome?.includes('Cavalgar')
    );
    
    if (!cavalgar) {
        resultados.passou = false;
        resultados.motivos.push("❌ Precisa de alguma perícia de Cavalgar");
    } else {
        resultados.motivos.push(`✅ ${cavalgar.nome}`);
    }
    
    return resultados;
}

// ===== FUNÇÕES DE CÁLCULO =====

function calcularNHCompleto(tecnica, niveisExtras = 0) {
    const nhPericia = obterNHPericiaBase(tecnica.basePericia);
    const nhBase = nhPericia + tecnica.modificadorBase;
    const nhComExtras = nhBase + niveisExtras;
    const limiteMaximo = nhPericia;
    
    return {
        nhFinal: Math.min(nhComExtras, limiteMaximo),
        nhBase: nhBase,
        nhPericia: nhPericia,
        limiteMaximo: limiteMaximo
    };
}

function calcularCusto(niveisAcima, dificuldade) {
    if (niveisAcima < 0) return 0;
    const tabela = CUSTO_TECNICA[dificuldade] || [];
    return tabela[niveisAcima] || 0;
}

// ===== FUNÇÕES DE INTERFACE =====

function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    // Verificar se o catálogo está carregado
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    // Obter todas as técnicas
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    // Processar cada técnica
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        const preReq = verificarPreRequisitos(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        const niveisComprados = jaAprendida ? jaAprendida.niveisComprados || 0 : 0;
        const calculo = calcularNHCompleto(tecnica, niveisComprados);
        
        return {
            ...tecnica,
            disponivel: preReq.passou,
            motivoIndisponivel: preReq.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: niveisComprados,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0,
            nhAtual: calculo.nhFinal,
            nhPericia: calculo.nhPericia
        };
    });
    
    renderizarCatalogo();
}

function renderizarCatalogo() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Filtrar técnicas
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    // Aplicar filtro
    if (estadoTecnicas.filtroAtual === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtual === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    // Aplicar busca
    if (estadoTecnicas.buscaAtual) {
        const busca = estadoTecnicas.buscaAtual.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(busca) ||
            t.descricao.toLowerCase().includes(busca)
        );
    }
    
    // Renderizar
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica encontrada</div>
                <small>Verifique os pré-requisitos ou filtros</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
        
        html += `
            <div class="pericia-item" 
                 data-id="${tecnica.id}"
                 style="background: ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                        border: 1px solid ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                        border-radius: 8px; padding: 15px; margin-bottom: 10px;
                        cursor: ${tecnica.disponivel ? 'pointer' : 'not-allowed'};
                        opacity: ${tecnica.disponivel ? '1' : '0.6'};">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; color: ${tecnica.jaAprendida ? '#27ae60' : '#ffd700'};">
                        ${tecnica.nome} ${tecnica.jaAprendida ? '✓' : ''}
                    </h4>
                    <div style="display: flex; gap: 8px;">
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p style="margin: 10px 0; color: #ccc; font-size: 14px;">${tecnica.descricao}</p>
                
                <div style="font-size: 12px; color: #95a5a6;">
                    <i class="fas fa-calculator"></i> Base: ${tecnica.basePericia}${modificador}
                </div>
                
                ${!tecnica.disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px; margin-top: 10px; border-radius: 4px; font-size: 12px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> ${tecnica.motivoIndisponivel}
                    </div>
                ` : ''}
                
                ${tecnica.disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                        <i class="fas fa-bullseye"></i> Clique para ${tecnica.jaAprendida ? 'melhorar' : 'aprender'}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    container.querySelectorAll('.pericia-item').forEach(item => {
        if (!item.style.opacity || item.style.opacity !== '0.6') {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

function abrirModalTecnica(tecnica) {
    console.log(`📖 Abrindo modal: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Cálculos
    const nhPericia = obterNHPericiaBase(tecnica.basePericia);
    const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
    const nhBase = nhPericia + tecnica.modificadorBase;
    const limiteMaximo = nhPericia;
    
    let niveisCompradosAtuais = 0;
    let custoTotalAtual = 0;
    let nhAtual = nhBase;
    
    if (jaAprendida) {
        niveisCompradosAtuais = jaAprendida.niveisComprados || 0;
        custoTotalAtual = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisCompradosAtuais;
        if (nhAtual > limiteMaximo) nhAtual = limiteMaximo;
    }
    
    // Níveis possíveis
    const niveisPossiveis = Math.max(0, limiteMaximo - nhBase);
    
    // Gerar opções
    let opcoesHTML = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCusto(i, tecnica.dificuldade);
        const selected = i === niveisCompradosAtuais ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base' : `+${i} nível${i > 1 ? 's' : ''}`;
        
        opcoesHTML += `
            <option value="${i}" ${selected}>
                NH ${nhOpcao} - ${textoNivel} (${custo} pts)
            </option>
        `;
    }
    
    // Criar modal
    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • ${tecnica.basePericia}${modificador}
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc;">
            <!-- Pré-requisitos -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #9b59b6;">Pré-requisitos</h4>
                <div>${verificarPreRequisitos(tecnica).motivos.join('<br>')}</div>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Base</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">${tecnica.basePericia}${modificador}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${limiteMaximo}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">NH ${tecnica.basePericia}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">${niveisCompradosAtuais} nível(s)</div>
                </div>
            </div>
            
            <!-- Seleção -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700;">Níveis acima da base:</label>
                <select id="select-niveis-tecnica" style="width: 100%; padding: 10px; border-radius: 6px; 
                       background: #2c3e50; color: #ffd700; border: 2px solid #9b59b6;">
                    ${opcoesHTML}
                </select>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 32px; font-weight: bold; color: #27ae60;">
                    ${custoTotalAtual} pontos
                </div>
            </div>
            
            <!-- Descrição -->
            <div>
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.5; font-size: 14px;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()"
                style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="comprarTecnica()" id="btn-comprar-tecnica"
                style="padding: 10px 20px; background: linear-gradient(45deg, #9b59b6, #8e44ad);
                       color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir no modal
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) {
        console.error("❌ Modal .modal-tecnica não encontrado!");
        return;
    }
    
    modal.innerHTML = modalHTML;
    document.querySelector('.modal-tecnica-overlay').style.display = 'flex';
    estadoTecnicas.modalAtivo = true;
    
    // Configurar evento de seleção
    const select = document.getElementById('select-niveis-tecnica');
    if (select) {
        select.addEventListener('change', function() {
            const niveis = parseInt(this.value);
            const custo = calcularCusto(niveis, tecnica.dificuldade);
            document.getElementById('custo-display').textContent = `${custo} pontos`;
        });
    }
}

function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) return;
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) return;
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCusto(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            basePericia: estadoTecnicas.tecnicaSelecionada.basePericia,
            modificadorBase: estadoTecnicas.tecnicaSelecionada.modificadorBase,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            niveisComprados: niveisComprados,
            custoTotal: custo
        });
    }
    
    // Salvar e atualizar
    salvarTecnicas();
    atualizarTecnicasDisponiveis();
    fecharModalTecnica();
    
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\nCusto: ${custo} pontos`);
}

function fecharModalTecnica() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    estadoTecnicas.modalAtivo = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== PERSISTÊNCIA =====

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
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

// ===== INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar dados salvos
    carregarTecnicas();
    
    // Aguardar sistema de perícias
    const verificarPericias = setInterval(() => {
        if (window.estadoPericias) {
            clearInterval(verificarPericias);
            console.log("✅ Sistema de perícias detectado!");
            
            // Inicializar após 1 segundo
            setTimeout(() => {
                atualizarTecnicasDisponiveis();
                console.log("✅ Sistema de técnicas pronto!");
            }, 1000);
        }
    }, 500);
    
    // Configurar eventos
    configurarEventos();
}

function configurarEventos() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtual = filtro;
            
            // Atualizar classes ativas
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogo();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtual = this.value;
            renderizarCatalogo();
        });
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo está carregado
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 2000);
});

// ===== EXPORTAR FUNÇÕES =====

window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("✅ SISTEMA DE TÉCNICAS CARREGADO - AGUARDANDO INICIALIZAÇÃO");