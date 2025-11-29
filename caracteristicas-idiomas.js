// caracteristicas-idiomas.js
class SistemaIdiomas {
    constructor() {
        this.idiomaMaterno = {
            nome: 'Comum',
            nivelFala: 6,
            nivelEscrita: 6,
            custoTotal: 0
        };
        
        this.idiomasAdicionais = [];
        
        // NÍVEIS COMPLETOS DO GURPS
        this.niveisFala = [
            { valor: 0, nome: 'Nenhum', custo: 0, descricao: 'Não fala o idioma' },
            { valor: 2, nome: 'Rudimentar', custo: 2, descricao: 'Frases simples, vocabulário limitado' },
            { valor: 4, nome: 'Sotaque', custo: 4, descricao: 'Conversação fluente mas com sotaque' },
            { valor: 6, nome: 'Nativo', custo: 6, descricao: 'Fluência completa como nativo' }
        ];
        
        this.niveisEscrita = [
            { valor: 0, nome: 'Nenhum', custo: 0, descricao: 'Não lê/escreve o idioma' },
            { valor: 2, nome: 'Rudimentar', custo: 1, descricao: 'Lê/escreve frases simples' },
            { valor: 4, nome: 'Sotaque', custo: 2, descricao: 'Lê/escreve bem mas com erros' },
            { valor: 6, nome: 'Nativo', custo: 3, descricao: 'Lê/escreve perfeitamente' }
        ];

        this.inicializado = false;
        this.inicializar();
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        console.log('🌐 Inicializando Sistema de Idiomas...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.atualizarPreviewCusto();
        this.atualizarTudo();
        this.inicializado = true;
    }
    
    configurarEventos() {
        // Evento do botão adicionar idioma
        const btnAdicionar = document.getElementById('btnAdicionarIdioma');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => this.adicionarIdioma());
        }
        
        // Evento do idioma materno
        const inputMaterno = document.getElementById('idiomaMaternoNome');
        if (inputMaterno) {
            inputMaterno.addEventListener('input', (e) => {
                this.idiomaMaterno.nome = e.target.value;
                this.atualizarCardIdiomas();
                this.salvarDados();
            });
        }
        
        // Eventos dos selects de nível
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala) {
            selectFala.addEventListener('change', () => this.atualizarPreviewCusto());
        }
        if (selectEscrita) {
            selectEscrita.addEventListener('change', () => this.atualizarPreviewCusto());
        }

        // Evento do input do novo idioma (Enter para adicionar)
        const inputNovoIdioma = document.getElementById('novoIdiomaNome');
        if (inputNovoIdioma) {
            inputNovoIdioma.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adicionarIdioma();
                }
            });
        }
    }
    
    // ✅ ATUALIZAR PREVIEW DO CUSTO
    atualizarPreviewCusto() {
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala && selectEscrita) {
            const nivelFala = parseInt(selectFala.value);
            const nivelEscrita = parseInt(selectEscrita.value);
            const custo = this.calcularCustoIdioma(nivelFala, nivelEscrita);
            
            const preview = document.getElementById('custoIdiomaPreview');
            if (preview) {
                preview.textContent = `+${custo} pts`;
                preview.style.color = custo > 0 ? '#27ae60' : '#7f8c8d';
                preview.style.fontWeight = 'bold';
            }
        }
    }
    
    // ✅ ADICIONAR IDIOMA
    adicionarIdioma() {
        console.log('➕ Adicionando idioma...');
        
        // ✅ PEGAR NOME DIGITADO
        const inputNome = document.getElementById('novoIdiomaNome');
        const nomeDigitado = inputNome ? inputNome.value.trim() : '';
        
        if (!nomeDigitado) {
            this.mostrarMensagem('Por favor, digite um nome para o idioma!', 'erro');
            inputNome?.focus();
            return null;
        }
        
        // ✅ VERIFICAR SE JÁ EXISTE
        if (this.idiomaJaExiste(nomeDigitado)) {
            this.mostrarMensagem('Este idioma já foi adicionado!', 'erro');
            return null;
        }
        
        // ✅ PEGAR NÍVEIS SELECIONADOS  
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        const nivelFala = selectFala ? parseInt(selectFala.value) : 2;
        const nivelEscrita = selectEscrita ? parseInt(selectEscrita.value) : 0;
        
        // ✅ CALCULAR CUSTO
        const custoTotal = this.calcularCustoIdioma(nivelFala, nivelEscrita);
        
        const novoIdioma = {
            id: Date.now() + Math.random(),
            nome: nomeDigitado,
            nivelFala: nivelFala,
            nivelEscrita: nivelEscrita,
            custoTotal: custoTotal,
            dataAdicao: new Date()
        };
        
        this.idiomasAdicionais.push(novoIdioma);
        console.log('✅ Idioma adicionado:', novoIdioma);
        
        // ✅ LIMPAR FORMULÁRIO E MANTER FOCUS
        if (inputNome) {
            inputNome.value = '';
            inputNome.focus();
        }
        
        this.atualizarPreviewCusto();
        this.atualizarTudo();
        this.salvarDados();
        this.notificarSistemaPrincipal();
        
        this.mostrarMensagem(`Idioma "${nomeDigitado}" adicionado com sucesso!`, 'sucesso');
        
        return novoIdioma;
    }

    idiomaJaExiste(nome) {
        return this.idiomasAdicionais.some(idioma => 
            idioma.nome.toLowerCase() === nome.toLowerCase()
        );
    }

    mostrarMensagem(mensagem, tipo) {
        // Implementação simples de mensagem - pode ser melhorada com UI
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        
        // Poderia adicionar um toast notification aqui
        const existingMessage = document.getElementById('idiomaMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'idiomaMessage';
        messageDiv.textContent = mensagem;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${tipo === 'erro' ? '#e74c3c' : '#27ae60'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    removerIdioma(id) {
        const idiomaIndex = this.idiomasAdicionais.findIndex(i => i.id === id);
        if (idiomaIndex !== -1) {
            const idiomaRemovido = this.idiomasAdicionais[idiomaIndex];
            this.idiomasAdicionais.splice(idiomaIndex, 1);
            
            this.atualizarTudo();
            this.salvarDados();
            this.notificarSistemaPrincipal();
            
            this.mostrarMensagem(`Idioma "${idiomaRemovido.nome}" removido!`, 'sucesso');
        }
    }
    
    atualizarIdioma(id, campo, valor) {
        const idioma = this.idiomasAdicionais.find(i => i.id === id);
        if (idioma) {
            idioma[campo] = campo === 'nome' ? valor : parseInt(valor);
            
            // Recalcular custo se for nível de fala/escrita
            if (campo === 'nivelFala' || campo === 'nivelEscrita') {
                idioma.custoTotal = this.calcularCustoIdioma(idioma.nivelFala, idioma.nivelEscrita);
            }
            
            this.atualizarTudo();
            this.salvarDados();
            this.notificarSistemaPrincipal();
        }
    }
    
    calcularCustoIdioma(nivelFala, nivelEscrita) {
        const nivelFalaObj = this.niveisFala.find(n => n.valor === nivelFala);
        const nivelEscritaObj = this.niveisEscrita.find(n => n.valor === nivelEscrita);
        
        const custoFala = nivelFalaObj ? nivelFalaObj.custo : 0;
        const custoEscrita = nivelEscritaObj ? nivelEscritaObj.custo : 0;
        
        return custoFala + custoEscrita;
    }
    
    calcularPontosIdiomas() {
        const pontos = this.idiomasAdicionais.reduce((total, idioma) => total + idioma.custoTotal, 0);
        return pontos;
    }
    
    atualizarTudo() {
        this.atualizarCardIdiomas();
        this.atualizarListaAdquiridos();
        this.atualizarDisplayAdicionais();
    }
    
    atualizarCardIdiomas() {
        const card = document.getElementById('card-idiomas-info');
        if (!card) return;
        
        const pontos = this.calcularPontosIdiomas();
        const total = this.idiomasAdicionais.length;
        
        let html = `
            <div style="margin-bottom: 8px;">
                <strong>Materno:</strong> ${this.idiomaMaterno.nome}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Adicionais:</strong> ${total} idioma${total !== 1 ? 's' : ''}
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-weight: bold; color: #27ae60;">
                Total: ${pontos} pts
            </div>
        `;

        if (total > 0) {
            html += `<div style="font-size: 11px; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px; max-height: 60px; overflow-y: auto;">`;
            this.idiomasAdicionais.forEach(idioma => {
                const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
                const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
                const nivelTexto = idioma.nivelFala === idioma.nivelEscrita 
                    ? nivelFala
                    : `F:${nivelFala.substr(0,3)} E:${nivelEscrita.substr(0,3)}`;
                    
                html += `<div style="margin-bottom: 2px;">• ${idioma.nome} <small>(${nivelTexto})</small></div>`;
            });
            html += `</div>`;
        }

        card.innerHTML = html;
    }
    
    atualizarListaAdquiridos() {
        const container = document.getElementById('idiomas-adquiridos');
        if (!container) return;
        
        const totalElement = document.getElementById('totalIdiomas');
        if (totalElement) {
            totalElement.textContent = this.idiomasAdicionais.length;
        }

        if (this.idiomasAdicionais.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Nenhum idioma adicional</div>';
            return;
        }
        
        container.innerHTML = this.idiomasAdicionais.map(idioma => {
            const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
            const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
            let nivelTexto = nivelFala;
            
            if (idioma.nivelFala !== idioma.nivelEscrita) {
                nivelTexto = `Fala: ${nivelFala}, Escrita: ${nivelEscrita}`;
            }
            
            return `
                <div class="idioma-item">
                    <div class="idioma-info">
                        <input type="text" 
                               value="${idioma.nome}" 
                               placeholder="Nome do idioma"
                               onchange="sistemaIdiomas.atualizarIdioma(${idioma.id}, 'nome', this.value)"
                               style="border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; margin-bottom: 5px; width: 100%;">
                        <div class="idioma-niveis">
                            <small>${nivelTexto}</small>
                        </div>
                    </div>
                    <div class="idioma-actions">
                        <span class="idioma-pontos">+${idioma.custoTotal}</span>
                        <button onclick="sistemaIdiomas.removerIdioma(${idioma.id})" class="btn-remove">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    atualizarDisplayAdicionais() {
        const badge = document.getElementById('pontosIdiomas');
        if (badge) {
            const pontos = this.calcularPontosIdiomas();
            badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badge.style.background = pontos > 0 ? '#27ae60' : '#95a5a6';
        }
    }
    
    gerarOpcoesNivel(nivelSelecionado, tipo) {
        const niveis = tipo === 'fala' ? this.niveisFala : this.niveisEscrita;
        
        return niveis.map(nivel => `
            <option value="${nivel.valor}" ${nivel.valor === nivelSelecionado ? 'selected' : ''}>
                ${nivel.nome} (${nivel.custo} pts)
            </option>
        `).join('');
    }
    
    obterTextoNivel(nivel, tipo) {
        const niveis = tipo === 'fala' ? this.niveisFala : this.niveisEscrita;
        const nivelObj = niveis.find(n => n.valor === nivel);
        return nivelObj ? nivelObj.nome : 'Desconhecido';
    }
    
    // SISTEMA DE SALVAMENTO
    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaIdiomas_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.idiomaMaterno) {
                    this.idiomaMaterno = dados.idiomaMaterno;
                    const inputMaterno = document.getElementById('idiomaMaternoNome');
                    if (inputMaterno) inputMaterno.value = this.idiomaMaterno.nome;
                }
                if (dados.idiomasAdicionais) {
                    this.idiomasAdicionais = dados.idiomasAdicionais;
                }
                console.log('✅ Dados de idiomas carregados:', this.idiomasAdicionais.length, 'idiomas');
            }
        } catch (error) {
            console.log('❌ Erro ao carregar dados de idiomas:', error);
        }
    }

    salvarDados() {
        try {
            const dadosParaSalvar = {
                idiomaMaterno: this.idiomaMaterno,
                idiomasAdicionais: this.idiomasAdicionais,
                ultimaAtualizacao: new Date().toISOString()
            };
            localStorage.setItem('sistemaIdiomas_data', JSON.stringify(dadosParaSalvar));
        } catch (error) {
            console.log('❌ Erro ao salvar dados de idiomas:', error);
        }
    }

    notificarSistemaPrincipal() {
        if (window.sistemaCaracteristicas && typeof window.sistemaCaracteristicas.atualizarPontosTotais === 'function') {
            window.sistemaCaracteristicas.atualizarPontosTotais();
        }
        
        const evento = new CustomEvent('idiomasAlterados', {
            detail: {
                pontos: this.calcularPontosIdiomas(),
                totalIdiomas: this.idiomasAdicionais.length
            }
        });
        document.dispatchEvent(evento);
    }

    // MÉTODOS PARA INTEGRAÇÃO
    exportarDados() {
        return {
            idiomaMaterno: this.idiomaMaterno,
            idiomasAdicionais: this.idiomasAdicionais,
            pontosTotais: this.calcularPontosIdiomas()
        };
    }

    carregarDados(dados) {
        if (dados.idiomaMaterno) {
            this.idiomaMaterno = dados.idiomaMaterno;
            const input = document.getElementById('idiomaMaternoNome');
            if (input) input.value = this.idiomaMaterno.nome;
        }
        
        if (dados.idiomasAdicionais) {
            this.idiomasAdicionais = dados.idiomasAdicionais;
        }
        
        this.atualizarTudo();
    }

    // VALIDAÇÕES
    validarIdiomas() {
        const pontos = this.calcularPontosIdiomas();
        return {
            valido: true,
            pontos: pontos,
            totalIdiomas: this.idiomasAdicionais.length,
            mensagem: `Idiomas: ${this.idiomasAdicionais.length} adicional(is) (${pontos >= 0 ? '+' : ''}${pontos} pts)`
        };
    }
}

// INICIALIZAÇÃO E EXPORTAÇÃO
let sistemaIdiomas;

document.addEventListener('DOMContentLoaded', function() {
    sistemaIdiomas = new SistemaIdiomas();
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaIdiomas = SistemaIdiomas;
window.sistemaIdiomas = sistemaIdiomas;

// Event listener para quando a aba características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaIdiomas) {
        sistemaIdiomas.inicializar();
    }
});

// Funções globais para uso no HTML
window.adicionarIdioma = () => sistemaIdiomas.adicionarIdioma();
window.removerIdioma = (id) => sistemaIdiomas.removerIdioma(id);