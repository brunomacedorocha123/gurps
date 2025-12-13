// ============================================
// SISTEMA-RESUMO.JS
// Sistema de atualização em tempo real da aba Resumo
// ============================================

// Estado do Resumo
const estadoResumo = {
    fotoCarregada: false,
    dadosSincronizados: false,
    ultimaAtualizacao: null
};

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

function carregarResumo() {
    console.log('Sistema Resumo: Inicializando...');
    
    // 1. Sincronizar dados imediatamente
    sincronizarDadosResumo();
    
    // 2. Configurar eventos
    configurarEventosResumo();
    
    // 3. Escutar alterações em outras abas
    configurarOuvintesExternos();
    
    estadoResumo.ultimaAtualizacao = new Date();
}

function sincronizarDadosResumo() {
    try {
        // Nome do personagem
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            const nome = nomeInput.value.trim().toUpperCase();
            resumoNome.textContent = nome || 'NOVO PERSONAGEM';
            
            // Atualiza em tempo real
            if (!estadoResumo.dadosSincronizados) {
                nomeInput.addEventListener('input', function() {
                    resumoNome.textContent = this.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
                });
            }
        }
        
        // Dados do Dashboard
        sincronizarDashboard();
        
        // Atributos
        sincronizarAtributos();
        
        // Características
        sincronizarCaracteristicas();
        
        estadoResumo.dadosSincronizados = true;
        console.log('Sistema Resumo: Dados sincronizados');
        
    } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
    }
}

function sincronizarDashboard() {
    // Raça
    const racaInput = document.getElementById('racaPersonagem');
    const racaResumo = document.getElementById('resumoRaca');
    if (racaInput && racaResumo) {
        racaResumo.textContent = racaInput.value || '-';
        racaInput.addEventListener('input', function() {
            racaResumo.textContent = this.value || '-';
        });
    }
    
    // Classe
    const classeInput = document.getElementById('classePersonagem');
    const classeResumo = document.getElementById('resumoClasse');
    if (classeInput && classeResumo) {
        classeResumo.textContent = classeInput.value || '-';
        classeInput.addEventListener('input', function() {
            classeResumo.textContent = this.value || '-';
        });
    }
    
    // Nível
    const nivelInput = document.getElementById('nivelPersonagem');
    const nivelResumo = document.getElementById('resumoNivel');
    if (nivelInput && nivelResumo) {
        nivelResumo.textContent = nivelInput.value || '-';
        nivelInput.addEventListener('input', function() {
            nivelResumo.textContent = this.value || '-';
        });
    }
    
    // Pontos
    const pontosTotais = document.getElementById('pontosTotais');
    const pontosGastos = document.getElementById('pontosGastos');
    const pontosSaldo = document.getElementById('pontosSaldo');
    
    if (pontosTotais && document.getElementById('resumoPontosTotais')) {
        document.getElementById('resumoPontosTotais').textContent = pontosTotais.textContent || '150';
    }
    if (pontosGastos && document.getElementById('resumoPontosGastos')) {
        document.getElementById('resumoPontosGastos').textContent = pontosGastos.textContent || '0';
    }
    if (pontosSaldo && document.getElementById('resumoSaldo')) {
        document.getElementById('resumoSaldo').textContent = pontosSaldo.textContent || '150';
    }
}

function sincronizarAtributos() {
    // Função que será chamada quando atributos mudarem
    window.atualizarResumoAtributos = function(dados) {
        if (!dados) return;
        
        // Mapeamento dos IDs
        const mapeamento = {
            'ST': 'resumoST',
            'DX': 'resumoDX',
            'IQ': 'resumoIQ',
            'HT': 'resumoHT',
            'PV': 'resumoPV',
            'PF': 'resumoPF',
            'Vontade': 'resumoVontade',
            'Percepcao': 'resumoPercepcao',
            'Deslocamento': 'resumoDeslocamento'
        };
        
        // Atualiza cada atributo
        for (const [chave, id] of Object.entries(mapeamento)) {
            const elemento = document.getElementById(id);
            if (elemento && dados[chave] !== undefined) {
                elemento.textContent = dados[chave];
            }
        }
        
        // Atualiza custos
        const custoST = document.getElementById('custoST');
        const custoDX = document.getElementById('custoDX');
        const custoIQ = document.getElementById('custoIQ');
        const custoHT = document.getElementById('custoHT');
        
        if (custoST) custoST.textContent = dados.PontosGastosAtributos?.ST || 0;
        if (custoDX) custoST.textContent = dados.PontosGastosAtributos?.DX || 0;
        if (custoIQ) custoST.textContent = dados.PontosGastosAtributos?.IQ || 0;
        if (custoHT) custoST.textContent = dados.PontosGastosAtributos?.HT || 0;
        
        // Pontos totais gastos em atributos
        const pontosAtributos = document.getElementById('pontosAtributos');
        if (pontosAtributos && dados.PontosGastosAtributos) {
            const total = Object.values(dados.PontosGastosAtributos).reduce((a, b) => a + b, 0);
            pontosAtributos.textContent = total;
        }
        
        estadoResumo.ultimaAtualizacao = new Date();
    };
    
    // Se a função obterDadosAtributos já existe, pega os dados iniciais
    if (typeof window.obterDadosAtributos === 'function') {
        setTimeout(() => {
            const dados = window.obterDadosAtributos();
            if (dados) {
                window.atualizarResumoAtributos(dados);
            }
        }, 500);
    }
}

function sincronizarCaracteristicas() {
    // Altura e Peso
    const alturaInput = document.getElementById('altura');
    const pesoInput = document.getElementById('peso');
    const alturaPesoResumo = document.getElementById('resumoAlturaPeso');
    
    if (alturaInput && pesoInput && alturaPesoResumo) {
        const atualizarAlturaPeso = () => {
            const altura = alturaInput.value || '1.70';
            const peso = pesoInput.value || '70';
            alturaPesoResumo.textContent = `${altura}m/${peso}kg`;
        };
        
        atualizarAlturaPeso();
        alturaInput.addEventListener('input', atualizarAlturaPeso);
        pesoInput.addEventListener('input', atualizarAlturaPeso);
    }
    
    // Aparência
    const aparenciaSelect = document.getElementById('nivelAparencia');
    const aparenciaResumo = document.getElementById('resumoAparencia');
    
    if (aparenciaSelect && aparenciaResumo) {
        const atualizarAparencia = () => {
            const texto = aparenciaSelect.options[aparenciaSelect.selectedIndex].text;
            // Remove os pontos entre colchetes
            const nome = texto.split('[')[0].trim();
            aparenciaResumo.textContent = nome;
        };
        
        atualizarAparencia();
        aparenciaSelect.addEventListener('change', atualizarAparencia);
    }
    
    // Riqueza
    const riquezaSelect = document.getElementById('nivelRiqueza');
    const riquezaResumo = document.getElementById('resumoRiqueza');
    
    if (riquezaSelect && riquezaResumo) {
        const atualizarRiqueza = () => {
            const texto = riquezaSelect.options[riquezaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            riquezaResumo.textContent = nome;
        };
        
        atualizarRiqueza();
        riquezaSelect.addEventListener('change', atualizarRiqueza);
    }
}

function configurarEventosResumo() {
    // Configurar upload de foto
    const fotoWrapper = document.getElementById('fotoResumoWrapper');
    const fotoInput = document.getElementById('fotoUpload');
    
    if (fotoWrapper && fotoInput) {
        fotoWrapper.addEventListener('click', () => {
            fotoInput.click();
        });
        
        fotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fotoImg = document.getElementById('fotoResumoImg');
                    if (fotoImg) {
                        fotoImg.src = e.target.result;
                        fotoImg.style.display = 'block';
                        estadoResumo.fotoCarregada = true;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Sincronizar foto da dashboard se existir
    setTimeout(() => {
        const fotoDashboard = document.getElementById('fotoPreview');
        const fotoResumo = document.getElementById('fotoResumoImg');
        
        if (fotoDashboard && fotoDashboard.src && fotoResumo) {
            fotoResumo.src = fotoDashboard.src;
            fotoResumo.style.display = 'block';
            estadoResumo.fotoCarregada = true;
        }
    }, 1000);
}

function configurarOuvintesExternos() {
    // Escuta eventos de outras abas
    document.addEventListener('atributosAlterados', function(e) {
        if (window.atualizarResumoAtributos && typeof window.obterDadosAtributos === 'function') {
            const dados = window.obterDadosAtributos();
            window.atualizarResumoAtributos(dados);
        }
    });
    
    // Escuta mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    // Força atualização quando a aba resumo for aberta
                    setTimeout(() => {
                        sincronizarDadosResumo();
                    }, 100);
                }
            }
        });
    });
    
    // Observa a aba resumo
    const resumoAba = document.getElementById('resumo');
    if (resumoAba) {
        observer.observe(resumoAba, { attributes: true });
    }
}

// ============================================
// FUNÇÕES PARA OUTROS SISTEMAS USAREM
// ============================================

function atualizarPericiasResumo(pericias) {
    const tabela = document.getElementById('tabelaPericiasResumo');
    if (!tabela) return;
    
    if (!pericias || pericias.length === 0) {
        tabela.innerHTML = `
            <tr class="vazio">
                <td colspan="3">Nenhuma perícia</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    pericias.forEach(pericia => {
        html += `
            <tr>
                <td>${pericia.nome || 'Perícia'}</td>
                <td class="nivel">${pericia.nivel || 0}</td>
                <td class="pontos">${pericia.pontos || 0}</td>
            </tr>
        `;
    });
    
    tabela.innerHTML = html;
    
    // Atualiza contador de pontos
    const totalPontos = pericias.reduce((sum, p) => sum + (p.pontos || 0), 0);
    const pontosElement = document.getElementById('pontosPericias');
    if (pontosElement) {
        pontosElement.textContent = totalPontos;
    }
}

function atualizarVantagensResumo(vantagens) {
    const lista = document.getElementById('listaVantagensResumo');
    if (!lista) return;
    
    if (!vantagens || vantagens.length === 0) {
        lista.innerHTML = `<div class="vazio">Nenhuma vantagem</div>`;
        return;
    }
    
    let html = '';
    vantagens.forEach(vantagem => {
        html += `
            <div class="item-vantagem">
                <span class="nome">${vantagem.nome}</span>
                <span class="pontos positivo">+${vantagem.pontos}</span>
            </div>
        `;
    });
    
    lista.innerHTML = html;
    
    // Atualiza contador de pontos
    const totalPontos = vantagens.reduce((sum, v) => sum + (v.pontos || 0), 0);
    const pontosElement = document.getElementById('pontosVantagens');
    if (pontosElement) {
        pontosElement.textContent = `+${totalPontos}`;
    }
}

function atualizarDesvantagensResumo(desvantagens) {
    const lista = document.getElementById('listaDesvantagensResumo');
    if (!lista) return;
    
    if (!desvantagens || desvantagens.length === 0) {
        lista.innerHTML = `<div class="vazio">Nenhuma desvantagem</div>`;
        return;
    }
    
    let html = '';
    desvantagens.forEach(desvantagem => {
        html += `
            <div class="item-desvantagem">
                <span class="nome">${desvantagem.nome}</span>
                <span class="pontos negativo">${desvantagem.pontos}</span>
            </div>
        `;
    });
    
    lista.innerHTML = html;
    
    // Atualiza contador de pontos
    const totalPontos = desvantagens.reduce((sum, d) => sum + (d.pontos || 0), 0);
    const pontosElement = document.getElementById('pontosDesvantagens');
    if (pontosElement) {
        pontosElement.textContent = totalPontos;
    }
}

// ============================================
// EXPORTAÇÃO DE FUNÇÕES
// ============================================

window.carregarResumo = carregarResumo;
window.sincronizarDadosResumo = sincronizarDadosResumo;
window.atualizarPericiasResumo = atualizarPericiasResumo;
window.atualizarVantagensResumo = atualizarVantagensResumo;
window.atualizarDesvantagensResumo = atualizarDesvantagensResumo;

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Inicializa quando a aba Resumo for carregada
document.addEventListener('DOMContentLoaded', function() {
    const resumoAba = document.getElementById('resumo');
    
    // Se a aba já estiver ativa, inicializa
    if (resumoAba && resumoAba.classList.contains('active')) {
        setTimeout(() => {
            carregarResumo();
        }, 100);
    }
    
    // Observa mudança para a aba Resumo
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        carregarResumo();
                    }, 100);
                }
            }
        });
    });
    
    if (resumoAba) {
        observer.observe(resumoAba, { attributes: true });
    }
});