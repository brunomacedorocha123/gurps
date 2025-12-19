// ====== SISTEMA COMPLETO VANTAGENS/DESVANTAGENS PARA FICHA GM ======

// Configuração do Supabase (SEMPRE NECESSÁRIA)
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SistemaVantagensDesvantagensGM {
    constructor(dadosPersonagem) {
        this.dadosPersonagem = dadosPersonagem;
        this.vantagensProcessadas = [];
        this.desvantagensProcessadas = [];
        this.peculiaridadesProcessadas = [];
        this.init();
    }

    init() {
        console.log('🎯 Sistema Vantagens/Desvantagens GM iniciando...');
        this.processarVantagens();
        this.processarDesvantagens();
        this.processarPeculiaridades();
        this.renderizarTudo();
        this.atualizarTotais();
        return this;
    }

    // ====== PROCESSAR VANTAGENS ======
    processarVantagens() {
        console.log('🔄 Processando vantagens...');
        
        let vantagensDados = null;
        
        // 1. Campo "vantagens" (JSON string ou array)
        if (this.dadosPersonagem.vantagens) {
            if (typeof this.dadosPersonagem.vantagens === 'string') {
                try {
                    vantagensDados = JSON.parse(this.dadosPersonagem.vantagens);
                    console.log('✅ Vantagens parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear vantagens:', e);
                    vantagensDados = [];
                }
            } else if (Array.isArray(this.dadosPersonagem.vantagens)) {
                vantagensDados = this.dadosPersonagem.vantagens;
                console.log('✅ Vantagens já são array');
            } else {
                vantagensDados = [];
            }
        }
        
        // 2. Fallback: campo "advantages" (da VIEW)
        if ((!vantagensDados || vantagensDados.length === 0) && this.dadosPersonagem.advantages) {
            console.log('🔄 Tentando campo "advantages"...');
            if (typeof this.dadosPersonagem.advantages === 'string') {
                try {
                    vantagensDados = JSON.parse(this.dadosPersonagem.advantages);
                    console.log('✅ Advantages parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear advantages:', e);
                }
            } else if (Array.isArray(this.dadosPersonagem.advantages)) {
                vantagensDados = this.dadosPersonagem.advantages;
                console.log('✅ Advantages já são array');
            }
        }
        
        // 3. Se ainda não tem, array vazio
        if (!vantagensDados || !Array.isArray(vantagensDados)) {
            vantagensDados = [];
        }
        
        console.log(`📊 ${vantagensDados.length} vantagens encontradas`);
        
        // Processar cada vantagem
        this.vantagensProcessadas = vantagensDados.map((vantagem, index) => {
            return {
                nome: vantagem.nome || vantagem.name || `Vantagem ${index + 1}`,
                custo: vantagem.custo || vantagem.cost || 0,
                descricao: vantagem.descricao || vantagem.description || '',
                categoria: vantagem.categoria || vantagem.category || '',
                id: vantagem.id || `vantagem-${Date.now()}-${index}`
            };
        });
        
        return this.vantagensProcessadas;
    }

    // ====== PROCESSAR DESVANTAGENS ======
    processarDesvantagens() {
        console.log('🔄 Processando desvantagens...');
        
        let desvantagensDados = null;
        
        // 1. Campo "desvantagens"
        if (this.dadosPersonagem.desvantagens) {
            if (typeof this.dadosPersonagem.desvantagens === 'string') {
                try {
                    desvantagensDados = JSON.parse(this.dadosPersonagem.desvantagens);
                    console.log('✅ Desvantagens parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear desvantagens:', e);
                    desvantagensDados = [];
                }
            } else if (Array.isArray(this.dadosPersonagem.desvantagens)) {
                desvantagensDados = this.dadosPersonagem.desvantagens;
                console.log('✅ Desvantagens já são array');
            } else {
                desvantagensDados = [];
            }
        }
        
        // 2. Fallback: campo "disadvantages"
        if ((!desvantagensDados || desvantagensDados.length === 0) && this.dadosPersonagem.disadvantages) {
            console.log('🔄 Tentando campo "disadvantages"...');
            if (typeof this.dadosPersonagem.disadvantages === 'string') {
                try {
                    desvantagensDados = JSON.parse(this.dadosPersonagem.disadvantages);
                    console.log('✅ Disadvantages parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear disadvantages:', e);
                }
            } else if (Array.isArray(this.dadosPersonagem.disadvantages)) {
                desvantagensDados = this.dadosPersonagem.disadvantages;
                console.log('✅ Disadvantages já são array');
            }
        }
        
        if (!desvantagensDados || !Array.isArray(desvantagensDados)) {
            desvantagensDados = [];
        }
        
        console.log(`📊 ${desvantagensDados.length} desvantagens encontradas`);
        
        // Processar desvantagens
        this.desvantagensProcessadas = desvantagensDados.map((desvantagem, index) => {
            const custo = desvantagem.custo || desvantagem.cost || 0;
            
            return {
                nome: desvantagem.nome || desvantagem.name || `Desvantagem ${index + 1}`,
                custo: custo,
                custoAbsoluto: Math.abs(custo),
                descricao: desvantagem.descricao || desvantagem.description || '',
                categoria: desvantagem.categoria || desvantagem.category || '',
                id: desvantagem.id || `desvantagem-${Date.now()}-${index}`
            };
        });
        
        return this.desvantagensProcessadas;
    }

    // ====== PROCESSAR PECULIARIDADES ======
    processarPeculiaridades() {
        console.log('🔄 Processando peculiaridades...');
        
        let peculiaridadesDados = null;
        
        // 1. Campo "peculiaridades"
        if (this.dadosPersonagem.peculiaridades) {
            if (typeof this.dadosPersonagem.peculiaridades === 'string') {
                try {
                    peculiaridadesDados = JSON.parse(this.dadosPersonagem.peculiaridades);
                    console.log('✅ Peculiaridades parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear peculiaridades:', e);
                    peculiaridadesDados = [];
                }
            } else if (Array.isArray(this.dadosPersonagem.peculiaridades)) {
                peculiaridadesDados = this.dadosPersonagem.peculiaridades;
                console.log('✅ Peculiaridades já são array');
            } else {
                peculiaridadesDados = [];
            }
        }
        
        // 2. Campo "peculiarities"
        if ((!peculiaridadesDados || peculiaridadesDados.length === 0) && this.dadosPersonagem.peculiarities) {
            console.log('🔄 Tentando campo "peculiarities"...');
            if (typeof this.dadosPersonagem.peculiarities === 'string') {
                try {
                    peculiaridadesDados = JSON.parse(this.dadosPersonagem.peculiarities);
                    console.log('✅ Peculiarities parseadas de string JSON');
                } catch (e) {
                    console.error('❌ Erro ao parsear peculiarities:', e);
                }
            } else if (Array.isArray(this.dadosPersonagem.peculiarities)) {
                peculiaridadesDados = this.dadosPersonagem.peculiarities;
                console.log('✅ Peculiarities já são array');
            }
        }
        
        if (!peculiaridadesDados || !Array.isArray(peculiaridadesDados)) {
            peculiaridadesDados = [];
        }
        
        console.log(`📊 ${peculiaridadesDados.length} peculiaridades encontradas`);
        
        // Processar peculiaridades (custo fixo de -1 cada)
        this.peculiaridadesProcessadas = peculiaridadesDados.map((peculiaridade, index) => {
            return {
                nome: peculiaridade.nome || peculiaridade.name || peculiaridade.texto || `Peculiaridade ${index + 1}`,
                descricao: peculiaridade.descricao || peculiaridade.description || '',
                custo: -1,
                id: peculiaridade.id || `peculiaridade-${Date.now()}-${index}`
            };
        });
        
        return this.peculiaridadesProcessadas;
    }

    // ====== RENDERIZAR TUDO ======
    renderizarTudo() {
        this.renderizarVantagens('listaVantagensGM');
        this.renderizarDesvantagens('listaDesvantagensGM');
        this.renderizarPeculiaridades('listaPeculiaridadesGM');
    }

    renderizarVantagens(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} não encontrado`);
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        if (this.vantagensProcessadas.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma vantagem', '0');
            container.appendChild(emptyItem);
            return;
        }
        
        // Ordenar por custo (maior primeiro)
        const vantagensOrdenadas = [...this.vantagensProcessadas]
            .sort((a, b) => (b.custo || 0) - (a.custo || 0));
        
        vantagensOrdenadas.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            container.appendChild(item);
        });
        
        // Atualizar contador
        this.atualizarContador('totalVantagensGM', this.vantagensProcessadas.length);
    }

    renderizarDesvantagens(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} não encontrado`);
            return;
        }
        
        container.innerHTML = '';
        
        if (this.desvantagensProcessadas.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma desvantagem', '0');
            container.appendChild(emptyItem);
            return;
        }
        
        // Ordenar por custo absoluto (maior negativo primeiro)
        const desvantagensOrdenadas = [...this.desvantagensProcessadas]
            .sort((a, b) => Math.abs(b.custo || 0) - Math.abs(a.custo || 0));
        
        desvantagensOrdenadas.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            container.appendChild(item);
        });
        
        // Atualizar contador
        this.atualizarContador('totalDesvantagensGM', this.desvantagensProcessadas.length);
    }

    renderizarPeculiaridades(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} não encontrado`);
            return;
        }
        
        container.innerHTML = '';
        
        if (this.peculiaridadesProcessadas.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma peculiaridade', '0');
            container.appendChild(emptyItem);
            return;
        }
        
        this.peculiaridadesProcessadas.forEach(peculiaridade => {
            const item = this.criarItemLista(peculiaridade, 'peculiaridade');
            container.appendChild(item);
        });
    }

    // ====== CRIAR ELEMENTOS HTML ======
    criarItemLista(item, tipo = 'vantagem') {
        const div = document.createElement('div');
        
        // Classes CSS baseadas no tipo
        const classes = {
            vantagem: 'vantagem-item',
            desvantagem: 'desvantagem-item',
            peculiaridade: 'peculiaridade-item'
        };
        
        div.className = classes[tipo] || 'item-lista';
        
        // Determinar texto e classe do custo
        let custoTexto, custoClass;
        
        if (tipo === 'peculiaridade') {
            custoTexto = '-1';
            custoClass = 'negativo';
        } else {
            custoTexto = item.custo >= 0 ? `+${item.custo}` : `${item.custo}`;
            custoClass = item.custo >= 0 ? 'positivo' : 'negativo';
        }
        
        div.innerHTML = `
            <span class="nome-${tipo}">${this.escapeHtml(item.nome)}</span>
            <span class="custo-${tipo} ${custoClass}">${custoTexto}</span>
        `;
        
        // Tooltip com descrição se existir
        if (item.descricao && item.descricao.trim()) {
            div.title = this.escapeHtml(item.descricao);
            div.style.cursor = 'help';
        }
        
        // Categoria se existir
        if (item.categoria && item.categoria.trim()) {
            const categoriaSpan = document.createElement('span');
            categoriaSpan.className = 'categoria-item';
            categoriaSpan.textContent = item.categoria;
            categoriaSpan.style.cssText = 'font-size: 0.8rem; color: #95a5a6; margin-left: 10px;';
            div.appendChild(categoriaSpan);
        }
        
        return div;
    }

    criarItemVazio(texto, valor = '0') {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.style.opacity = '0.7';
        div.innerHTML = `
            <span class="nome-vantagem">${texto}</span>
            <span class="custo-vantagem">${valor}</span>
        `;
        return div;
    }

    // ====== ATUALIZAR CONTADORES E TOTAIS ======
    atualizarContador(elementoId, total) {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.textContent = total;
        }
    }

    atualizarTotais() {
        const totalVantagens = this.calcularTotalVantagens();
        const totalDesvantagens = this.calcularTotalDesvantagens();
        const totalPeculiaridades = this.calcularTotalPeculiaridades();
        const totalDesvantagensComPeculiaridades = totalDesvantagens + totalPeculiaridades;
        const saldoTotal = totalVantagens + totalDesvantagensComPeculiaridades;
        
        console.log('💰 Totais calculados:', {
            vantagens: totalVantagens,
            desvantagens: totalDesvantagens,
            peculiaridades: totalPeculiaridades,
            totalNegativo: totalDesvantagensComPeculiaridades,
            saldo: saldoTotal
        });
        
        // Atualizar elementos na interface
        this.atualizarElementosTotais(
            totalVantagens, 
            totalDesvantagensComPeculiaridades, 
            totalPeculiaridades, 
            saldoTotal
        );
    }

    calcularTotalVantagens() {
        return this.vantagensProcessadas.reduce((total, vantagem) => total + (vantagem.custo || 0), 0);
    }

    calcularTotalDesvantagens() {
        return this.desvantagensProcessadas.reduce((total, desvantagem) => total + (desvantagem.custo || 0), 0);
    }

    calcularTotalPeculiaridades() {
        return this.peculiaridadesProcessadas.reduce((total, peculiaridade) => total + (peculiaridade.custo || 0), 0);
    }

    atualizarElementosTotais(totalVantagens, totalDesvantagens, totalPeculiaridades, saldoTotal) {
        // Total de Vantagens
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = totalVantagens >= 0 ? `+${totalVantagens} pts` : `${totalVantagens} pts`;
        }
        
        // Total de Desvantagens (incluindo peculiaridades)
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            elTotalDesvantagens.textContent = `${totalDesvantagens} pts`;
            elTotalDesvantagens.style.color = '#e74c3c';
        }
        
        // Total de Peculiaridades
        const elTotalPeculiaridades = document.getElementById('total-peculiaridades');
        if (elTotalPeculiaridades) {
            elTotalPeculiaridades.textContent = `${totalPeculiaridades} pts`;
            elTotalPeculiaridades.style.color = '#9b59b6';
        }
        
        // Saldo Total (Vantagens - Desvantagens)
        const elSaldoTotal = document.getElementById('saldo-total-vantagens');
        if (elSaldoTotal) {
            elSaldoTotal.textContent = `${saldoTotal} pts`;
            if (saldoTotal > 0) {
                elSaldoTotal.style.color = '#27ae60';
            } else if (saldoTotal < 0) {
                elSaldoTotal.style.color = '#e74c3c';
            } else {
                elSaldoTotal.style.color = '#ffd700';
            }
        }
        
        // Atualizar também na aba de atributos
        this.atualizarPontosAtributos();
    }

    atualizarPontosAtributos() {
        // Atualizar pontos gastos em atributos se existirem esses elementos
        const pontosGastos = this.calcularTotalVantagens() + Math.abs(this.calcularTotalDesvantagens() + this.calcularTotalPeculiaridades());
        
        const elPontosGastos = document.getElementById('pontosGastos');
        if (elPontosGastos) {
            elPontosGastos.textContent = pontosGastos;
        }
        
        const elDesvantagensAtuais = document.getElementById('desvantagensAtuais');
        if (elDesvantagensAtuais) {
            const totalNegativo = Math.abs(this.calcularTotalDesvantagens() + this.calcularTotalPeculiaridades());
            elDesvantagensAtuais.textContent = totalNegativo;
        }
    }

    // ====== UTILITÁRIOS ======
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ====== OBTER DADOS PARA SAVE/EXPORT ======
    obterDadosParaSalvar() {
        return {
            vantagens: this.vantagensProcessadas,
            desvantagens: this.desvantagensProcessadas,
            peculiaridades: this.peculiaridadesProcessadas,
            totais: {
                vantagens: this.calcularTotalVantagens(),
                desvantagens: this.calcularTotalDesvantagens(),
                peculiaridades: this.calcularTotalPeculiaridades(),
                saldoTotal: this.calcularTotalVantagens() + this.calcularTotalDesvantagens() + this.calcularTotalPeculiaridades()
            }
        };
    }

    // ====== FUNÇÃO PARA ATUALIZAR DADOS DINAMICAMENTE ======
    atualizarComNovosDados(novosDadosPersonagem) {
        this.dadosPersonagem = novosDadosPersonagem;
        this.vantagensProcessadas = [];
        this.desvantagensProcessadas = [];
        this.peculiaridadesProcessadas = [];
        this.init();
    }
}

// ====== INICIALIZAÇÃO AUTOMÁTICA ======
// Adicionar CSS estilos para os itens
const adicionarEstilosVD = () => {
    if (!document.querySelector('#estilo-vd-gm')) {
        const style = document.createElement('style');
        style.id = 'estilo-vd-gm';
        style.textContent = `
            .vantagem-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(46, 204, 113, 0.1);
                border-left: 3px solid #27ae60;
                margin-bottom: 5px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .vantagem-item:hover {
                background: rgba(46, 204, 113, 0.2);
                transform: translateX(2px);
            }
            
            .desvantagem-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(231, 76, 60, 0.1);
                border-left: 3px solid #e74c3c;
                margin-bottom: 5px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .desvantagem-item:hover {
                background: rgba(231, 76, 60, 0.2);
                transform: translateX(2px);
            }
            
            .peculiaridade-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(155, 89, 182, 0.1);
                border-left: 3px solid #9b59b6;
                margin-bottom: 5px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .peculiaridade-item:hover {
                background: rgba(155, 89, 182, 0.2);
                transform: translateX(2px);
            }
            
            .nome-vantagem, .nome-desvantagem, .nome-peculiaridade {
                font-weight: 500;
                color: #fff;
                flex: 1;
            }
            
            .custo-vantagem, .custo-desvantagem, .custo-peculiaridade {
                font-weight: bold;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 0.9rem;
                min-width: 60px;
                text-align: center;
            }
            
            .positivo {
                background: rgba(46, 204, 113, 0.3);
                color: #27ae60;
                border: 1px solid rgba(46, 204, 113, 0.5);
            }
            
            .negativo {
                background: rgba(231, 76, 60, 0.3);
                color: #e74c3c;
                border: 1px solid rgba(231, 76, 60, 0.5);
            }
            
            .categoria-item {
                font-size: 0.8rem;
                color: #95a5a6;
                margin-left: 10px;
                font-style: italic;
            }
            
            .item-lista {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.05);
                margin-bottom: 5px;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Estilos Vantagens/Desvantagens adicionados');
    }
};

// Função para usar em qualquer lugar
const inicializarSistemaVD = (dadosPersonagem) => {
    adicionarEstilosVD();
    return new SistemaVantagensDesvantagensGM(dadosPersonagem);
};

// Exportar para uso global
window.SistemaVantagensDesvantagensGM = SistemaVantagensDesvantagensGM;
window.inicializarSistemaVD = inicializarSistemaVD;

console.log('✅ Sistema Vantagens/Desvantagens GM COMPLETO carregado!');

// Uso na sua ficha GM:
// 1. Chame assim: const sistemaVD = inicializarSistemaVD(dadosPersonagem);
// 2. Ele já vai atualizar tudo automaticamente
// 3. Para atualizar com novos dados: sistemaVD.atualizarComNovosDados(novosDados);