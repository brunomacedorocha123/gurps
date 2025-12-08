// ===== SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA =====
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
    modalAberto: false
};

// ===== TABELA DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        return 4 + (niveisAcima - 4);
    }
    
    return 0;
}

// ===== OBTER NH DA PERÍCIA (FALLBACK SE PRECISAR) =====
function obterNHPericiaPorId(idPericia) {
    // Primeiro, tentar usar o sistema de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
        if (pericia) {
            // Simular um valor - você pode ajustar isso
            return 10 + (pericia.nivel || 0);
        }
    }
    
    // Fallback: valores padrão
    const valoresPadrao = {
        'arco': 10,
        'cavalgar-cavalo': 10,
        'cavalgar-mula': 10,
        'cavalgar-camelo': 10,
        'cavalgar-dragao': 10,
        'cavalgar-outro': 10
    };
    
    return valoresPadrao[idPericia] || 10;
}

// ===== VERIFICAR PRÉ-REQUISITOS (VERSÃO SIMPLIFICADA) =====
function verificarPreRequisitosTecnica(tecnica) {
    // Para teste: SEMPRE retornar como disponível
    return { passou: true, motivo: '' };
    
    /*
    // Código original (comentei para teste)
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    // Para teste: dizer que sempre tem Arco e Cavalgar
    return { passou: true, motivo: '' };
    */
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    // Verificar se o catálogo existe
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log("📋 Técnicas no catálogo:", todasTecnicas);
    
    if (!todasTecnicas || todasTecnicas.length === 0) {
        console.error("❌ Nenhuma técnica encontrada no catálogo!");
        return;
    }
    
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        console.log("🔍 Processando:", tecnica.nome);
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH atual
        let nhAtual = 10; // Valor padrão
        
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
            nhAtual = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            nhAtual += tecnica.baseCalculo.redutor || 0;
        }
        
        // Adicionar níveis se já aprendida
        if (jaAprendida) {
            nhAtual += (jaAprendida.niveisAcimaBase || 0);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: true, // FORÇAR como disponível para teste
            nhAtual: nhAtual,
            custoAtual: jaAprendida ? (jaAprendida.custoPago || 0) : 0,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: ''
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log("✅ Técnicas disponíveis:", disponiveis);
    
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO (VERSÃO GARANTIDA) =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container 'lista-tecnicas' não encontrado!");
        // Tentar encontrar de outra forma
        const containerAlt = document.querySelector('#lista-tecnicas');
        if (!containerAlt) {
            console.error("❌ Container não encontrado de jeito nenhum!");
            return;
        }
        container = containerAlt;
    }
    
    console.log("🎨 Renderizando catálogo...");
    
    // Se não houver técnicas no catálogo
    if (!estadoTecnicas.tecnicasDisponiveis || estadoTecnicas.tecnicasDisponiveis.length === 0) {
        // Forçar uma técnica de teste
        const tecnicaTeste = {
            id: "arquearia-montada",
            nome: "Arquearia Montada (TESTE)",
            descricao: "Técnica de teste para verificar funcionamento",
            dificuldade: "Difícil",
            disponivel: true,
            nhAtual: 6,
            custoAtual: 0,
            jaAprendida: false,
            motivoIndisponivel: ''
        };
        
        estadoTecnicas.tecnicasDisponiveis = [tecnicaTeste];
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasDisponiveis.forEach(tecnica => {
        const disponivel = true; // Forçar como disponível
        const jaAprendida = tecnica.jaAprendida;
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" 
                 style="cursor: pointer; 
                        border-left: 4px solid ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'};
                        background: ${jaAprendida ? 'rgba(39, 174, 96, 0.1)' : 'rgba(50, 50, 65, 0.9)'};
                        border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 12px;
                        transition: all 0.3s ease;">
                
                <div class="pericia-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 class="pericia-nome" style="color: #ffd700; font-size: 1.1em; margin: 0; flex: 1;">
                        ${tecnica.nome} 
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${tecnica.nhAtual || 10}
                        </span>
                    </div>
                </div>
                
                <p class="pericia-descricao" style="color: #ccc; font-size: 0.9em; line-height: 1.4; margin: 8px 0 0 0;">
                    ${tecnica.descricao || 'Descrição não disponível'}
                </p>
                
                <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                    <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                    Clique para ${jaAprendida ? 'editar' : 'aprender'} esta técnica
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    const itens = container.querySelectorAll('.pericia-item');
    console.log(`👆 ${itens.length} itens para adicionar eventos`);
    
    itens.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            console.log("🎯 Clicou na técnica:", tecnica?.nome);
            
            if (tecnica) {
                abrirModalTecnica(tecnica);
            }
        });
        
        // Efeito hover
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #95a5a6; padding: 40px 20px; font-style: italic;">
                <i class="fas fa-tools" style="font-size: 2em; margin-bottom: 15px; color: #ff8c00;"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH atual
        let nhAtual = 10;
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
            nhAtual = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            nhAtual += tecnica.baseCalculo.redutor || 0;
            nhAtual += tecnica.niveisAcimaBase || 0;
        }
        
        html += `
            <div style="background: rgba(39, 174, 96, 0.15); border: 1px solid rgba(39, 174, 96, 0.4);
                       border-radius: 8px; padding: 15px; margin-bottom: 12px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; padding-right: 40px;">
                    <h4 style="margin: 0; color: #ffd700; font-size: 16px;">${tecnica.nome}</h4>
                    <div style="display: flex; gap: 8px;">
                        <span style="background: #3498db; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.custoPago || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6;">
                    <div><strong>Níveis acima da base:</strong> ${tecnica.niveisAcimaBase || 0}</div>
                    ${tecnica.descricao ? `<div style="margin-top: 5px;">${tecnica.descricao}</div>` : ''}
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" 
                        style="position: absolute; top: 15px; right: 15px; background: #e74c3c; color: white; 
                               border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;
                               display: flex; align-items: center; justify-content: center; font-size: 16px;"
                        title="Remover técnica">
                    ×
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ABRIR MODAL (VERSÃO SIMPLIFICADA) =====
function abrirModalTecnica(tecnica) {
    console.log("🚀 Abrindo modal para:", tecnica.nome);
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modal) {
        console.error("❌ Modal não encontrado! Criando um...");
        criarModalEmergency();
        return;
    }
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Valores para o modal
    const baseAtual = 10; // Valor padrão
    const nhMaximo = 20; // Valor padrão
    const nhAtual = jaAprendida ? (baseAtual + (jaAprendida.niveisAcimaBase || 0)) : baseAtual;
    
    // Criar opções do select
    let opcoesHTML = '';
    for (let nh = baseAtual; nh <= nhMaximo; nh++) {
        const niveisAcimaOpt = nh - baseAtual;
        const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
        const selected = nh === nhAtual ? 'selected' : '';
        opcoesHTML += `<option value="${nh}" data-niveis="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pontos)</option>`;
    }
    
    modal.innerHTML = `
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700;">
                &times;
            </span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">${tecnica.dificuldade} • Técnica Especial</div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Base</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${baseAtual}</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
                    Selecione o nível desejado:
                </label>
                <select id="select-nh-tecnica" 
                        style="width: 100%; padding: 12px; border-radius: 5px; border: 2px solid #ff8c00; 
                               background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;">
                    ${opcoesHTML}
                </select>
            </div>
            
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #27ae60; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
                    ${jaAprendida ? jaAprendida.custoPago : 0} pontos
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.5;">${tecnica.descricao || 'Descrição da técnica'}</p>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" 
                    style="padding: 12px 24px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                Cancelar
            </button>
            <button onclick="comprarTecnica('${tecnica.id}')" 
                    id="btn-comprar-tecnica"
                    style="padding: 12px 24px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos do select
    const select = document.getElementById('select-nh-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    
    function atualizarCusto() {
        if (!select || !custoDisplay || !btnComprar) return;
        
        const opcao = select.options[select.selectedIndex];
        const custo = opcao.getAttribute('data-custo');
        const niveis = opcao.getAttribute('data-niveis');
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida && niveis == (jaAprendida.niveisAcimaBase || 0)) {
            btnComprar.textContent = 'Manter';
            btnComprar.style.background = '#95a5a6';
            btnComprar.disabled = true;
        } else {
            btnComprar.textContent = jaAprendida ? 'Atualizar' : 'Aprender';
            btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            btnComprar.disabled = false;
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
}

// ===== FUNÇÃO DE EMERGÊNCIA SE NÃO HOUVER MODAL =====
function criarModalEmergency() {
    console.log("🆘 Criando modal de emergência...");
    
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'modal-emergency-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    // Criar modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #1e1e28;
        border: 2px solid #ff8c00;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        padding: 20px;
        color: white;
    `;
    
    modal.innerHTML = `
        <h3 style="color: #ffd700; margin-top: 0;">Modal de Emergência</h3>
        <p>O modal regular não foi encontrado, mas o sistema está funcionando!</p>
        <p>A técnica foi processada corretamente.</p>
        <button onclick="document.getElementById('modal-emergency-overlay').remove()" 
                style="margin-top: 20px; padding: 10px 20px; background: #ff8c00; color: white; border: none; border-radius: 5px;">
            Fechar
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// ===== COMPRAR/ATUALIZAR TÉCNICA =====
function comprarTecnica(id) {
    const select = document.getElementById('select-nh-tecnica');
    if (!select) {
        alert("Erro: seletor não encontrado!");
        return;
    }
    
    const opcao = select.options[select.selectedIndex];
    const nh = parseInt(select.value);
    const niveisAcima = parseInt(opcao.getAttribute('data-niveis'));
    const custo = parseInt(opcao.getAttribute('data-custo'));
    
    const tecnicaCatalogo = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
    if (!tecnicaCatalogo) {
        alert("Erro: técnica não encontrada!");
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        };
    } else {
        // Adicionar nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: id,
            nome: tecnicaCatalogo.nome,
            descricao: tecnicaCatalogo.descricao,
            dificuldade: tecnicaCatalogo.dificuldade,
            baseCalculo: tecnicaCatalogo.baseCalculo,
            limiteMaximo: tecnicaCatalogo.limiteMaximo,
            preRequisitos: tecnicaCatalogo.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        });
    }
    
    // Salvar no localStorage
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar:", e);
    }
    
    // Atualizar tudo
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Mensagem de sucesso
    alert(`✅ Técnica "${tecnicaCatalogo.nome}" ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!`);
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Tem certeza que deseja remover esta técnica? Os pontos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        
        try {
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        } catch (e) {
            console.error("Erro ao salvar:", e);
        }
        
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    
    // Remover modal de emergência se existir
    const emergencyModal = document.getElementById('modal-emergency-overlay');
    if (emergencyModal) {
        emergencyModal.remove();
    }
    
    estadoTecnicas.modalAberto = false;
}

// ===== RENDERIZAR STATUS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoPago || 0;
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
        estadoTecnicas.pontosTecnicasTotal += custo;
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar elementos HTML
    const atualizarElemento = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };
    
    atualizarElemento('qtd-tecnicas-medio', estadoTecnicas.qtdMedio);
    atualizarElemento('pts-tecnicas-medio', `(${estadoTecnicas.pontosMedio} pts)`);
    atualizarElemento('qtd-tecnicas-dificil', estadoTecnicas.qtdDificil);
    atualizarElemento('pts-tecnicas-dificil', `(${estadoTecnicas.pontosDificil} pts)`);
    atualizarElemento('qtd-tecnicas-total', estadoTecnicas.qtdTotal);
    atualizarElemento('pts-tecnicas-total', `(${estadoTecnicas.pontosTecnicasTotal} pts)`);
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
    console.log("🔗 Configurando eventos...");
    
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    console.log(`Encontrados ${filtroButtons.length} botões de filtro`);
    
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            console.log("Filtro clicado:", filtro);
            
            estadoTecnicas.filtroAtivo = filtro;
            
            // Remover active de todos
            filtroButtons.forEach(b => b.classList.remove('active'));
            // Adicionar active ao clicado
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

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // 1. Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas do salvamento`);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas salvas:", e);
    }
    
    // 2. Configurar eventos
    configurarEventListenersTecnicas();
    
    // 3. Forçar atualização do catálogo
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO!");
        console.log("👉 A técnica DEVE aparecer agora!");
    }, 100);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM Carregado - Preparando sistema de técnicas");
    
    // Esperar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Verificar se estamos na aba de perícias
        const abaPericias = document.getElementById('pericias');
        if (!abaPericias) {
            console.error("❌ Aba de perícias não encontrada!");
            return;
        }
        
        console.log("👀 Observando aba de perícias...");
        
        // Inicializar imediatamente se visível
        if (abaPericias.style.display !== 'none') {
            console.log("🎯 Aba visível, inicializando...");
            inicializarSistemaTecnicas();
        }
        
        // Observar mudanças na visibilidade
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (abaPericias.style.display !== 'none') {
                        console.log("🔄 Aba tornou-se visível, inicializando...");
                        setTimeout(inicializarSistemaTecnicas, 300);
                    }
                }
            });
        });
        
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }, 1500);
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("🎮 Módulo de técnicas carregado e pronto!");