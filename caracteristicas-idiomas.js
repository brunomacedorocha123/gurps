// caracteristicas-idiomas.js - VERSÃO CORRIGIDA
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
        console.log('🔧 Configurando eventos de idiomas...');
        
        // Evento do botão adicionar idioma - CORREÇÃO PRINCIPAL
        const btnAdicionar = document.getElementById('btnAdicionarIdioma');
        console.log('Botão adicionar encontrado:', !!btnAdicionar);
        
        if (btnAdicionar) {
            // Remove event listeners antigos para evitar duplicação
            btnAdicionar.replaceWith(btnAdicionar.cloneNode(true));
            const novoBtn = document.getElementById('btnAdicionarIdioma');
            
            novoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Botão clicado!');
                this.adicionarIdioma();
            });
        } else {
            console.error('❌ Botão btnAdicionarIdioma não encontrado!');
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
        
        // Eventos dos selects de nível - CORREÇÃO: usar event delegation
        document.addEventListener('change', (e) => {
            if (e.target.id === 'novoIdiomaFala' || e.target.id === 'novoIdiomaEscrita') {
                this.atualizarPreviewCusto();
            }
        });

        // Evento do input do novo idioma (Enter para adicionar)
        const inputNovoIdioma = document.getElementById('novoIdiomaNome');
        if (inputNovoIdioma) {
            inputNovoIdioma.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.adicionarIdioma();
                }
            });
        }

        // Event delegation para remoção de idiomas
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-idioma')) {
                const idiomaId = parseInt(e.target.closest('.btn-remove-idioma').dataset.id);
                this.removerIdioma(idiomaId);
            }
        });

        // Event delegation para edição de nomes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('editar-idioma-nome')) {
                const idiomaId = parseInt(e.target.dataset.id);
                this.atualizarIdioma(idiomaId, 'nome', e.target.value);
            }
        });

        // Event delegation para edição de níveis
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('editar-idioma-fala')) {
                const idiomaId = parseInt(e.target.dataset.id);
                this.atualizarIdioma(idiomaId, 'nivelFala', parseInt(e.target.value));
            }
            if (e.target.classList.contains('editar-idioma-escrita')) {
                const idiomaId = parseInt(e.target.dataset.id);
                this.atualizarIdioma(idiomaId, 'nivelEscrita', parseInt(e.target.value));
            }
        });
    }
    
    // ✅ ATUALIZAR PREVIEW DO CUSTO - CORRIGIDO
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
                preview.style.color = custo > 0 ? '#ffd700' : '#95a5a6';
                preview.style.fontWeight = 'bold';
            }
        }
    }
    
    // ✅ ADICIONAR IDIOMA - COMPLETAMENTE REFAZIDO
    adicionarIdioma() {
        console.log('➕ Tentando adicionar idioma...');
        
        // ✅ PEGAR NOME DIGITADO
        const inputNome = document.getElementById('novoIdiomaNome');
        const nomeDigitado = inputNome ? inputNome.value.trim() : '';
        
        console.log('Nome digitado:', nomeDigitado);
        
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
        
        console.log('Níveis selecionados:', { nivelFala, nivelEscrita });
        
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
        
        // ✅ RESETAR SELECTS PARA VALORES PADRÃO
        if (selectFala) selectFala.value = '2';
        if (selectEscrita) selectEscrita.value = '0';
        
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
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        
        // Remove mensagem anterior se existir
        const existingMessage = document.getElementById('idiomaMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12'
        };
        
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
            background: ${cores[tipo] || '#3498db'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
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
        if (!card) {
            console.log('❌ card-idiomas-info não encontrado');
            return;
        }
        
        const pontos = this.calcularPontosIdiomas();
        const total = this.idiomasAdicionais.length;
        
        let html = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #ffd700;">Materno:</strong> 
                <span style="color: #ccc;">${this.idiomaMaterno.nome}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #ffd700;">Adicionais:</strong> 
                <span style="color: #ccc;">${total} idioma${total !== 1 ? 's' : ''}</span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 215, 0, 0.3); font-weight: bold; color: #ffd700;">
                Total: ${pontos} pts
            </div>
        `;

        if (total > 0) {
            html += `<div style="font-size: 11px; margin-top: 8px; border-top: 1px solid rgba(255, 215, 0, 0.3); padding-top: 8px; max-height: 60px; overflow-y: auto;">`;
            this.idiomasAdicionais.forEach(idioma => {
                const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
                const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
                const nivelTexto = idioma.nivelFala === idioma.nivelEscrita 
                    ? nivelFala
                    : `F:${nivelFala.substr(0,3)} E:${nivelEscrita.substr(0,3)}`;
                    
                html += `<div style="margin-bottom: 2px; color: #ccc;">• ${idioma.nome} <small style="color: #95a5a6;">(${nivelTexto})</small></div>`;
            });
            html += `</div>`;
        }

        card.innerHTML = html;
    }
    
    atualizarListaAdquiridos() {
        const container = document.getElementById('idiomas-adquiridos');
        if (!container) {
            console.log('❌ idiomas-adquiridos não encontrado');
            return;
        }
        
        const totalElement = document.getElementById('totalIdiomas');
        if (totalElement) {
            totalElement.textContent = this.idiomasAdicionais.length;
        }

        if (this.idiomasAdicionais.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px; font-style: italic;">Nenhum idioma adicional</div>';
            return;
        }
        
        container.innerHTML = this.idiomasAdicionais.map(idioma => {
            const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
            const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
            
            return `
                <div class="idioma-item" style="background: rgba(40, 40, 50, 0.8); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <input type="text" 
                               value="${idioma.nome}" 
                               placeholder="Nome do idioma"
                               class="editar-idioma-nome"
                               data-id="${idioma.id}"
                               style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,215,0,0.3); border-radius: 4px; padding: 8px; color: #ffd700; width: 100%; margin-bottom: 8px;">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="color: #ccc; font-size: 12px; display: block; margin-bottom: 4px;">🗣️ Fala:</label>
                                <select class="editar-idioma-fala" data-id="${idioma.id}"
                                        style="width: 100%; padding: 6px; border: 1px solid rgba(255,215,0,0.3); border-radius: 4px; background: rgba(255,255,255,0.1); color: #ffd700;">
                                    ${this.niveisFala.map(nivel => `
                                        <option value="${nivel.valor}" ${nivel.valor === idioma.nivelFala ? 'selected' : ''}>
                                            ${nivel.nome} (${nivel.custo} pts)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label style="color: #ccc; font-size: 12px; display: block; margin-bottom: 4px;">📝 Escrita:</label>
                                <select class="editar-idioma-escrita" data-id="${idioma.id}"
                                        style="width: 100%; padding: 6px; border: 1px solid rgba(255,215,0,0.3); border-radius: 4px; background: rgba(255,255,255,0.1); color: #ffd700;">
                                    ${this.niveisEscrita.map(nivel => `
                                        <option value="${nivel.valor}" ${nivel.valor === idioma.nivelEscrita ? 'selected' : ''}>
                                            ${nivel.nome} (${nivel.custo} pts)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: ${idioma.custoTotal > 0 ? '#ffd700' : '#95a5a6'}; font-weight: bold; background: rgba(255,215,0,0.1); padding: 4px 8px; border-radius: 4px;">
                            +${idioma.custoTotal}
                        </span>
                        <button class="btn-remove-idioma" data-id="${idioma.id}"
                                style="background: #e74c3c; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
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

// INICIALIZAÇÃO E EXPORTAÇÃO - CORRIGIDA
let sistemaIdiomas;

// Inicialização segura
function inicializarSistemaIdiomas() {
    if (!sistemaIdiomas) {
        sistemaIdiomas = new SistemaIdiomas();
    }
    sistemaIdiomas.inicializar();
}

document.addEventListener('DOMContentLoaded', function() {
    sistemaIdiomas = new SistemaIdiomas();
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaIdiomas = SistemaIdiomas;
window.sistemaIdiomas = sistemaIdiomas;

// Event listener para quando a aba características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    console.log('🎯 Carregando sistema de idiomas...');
    inicializarSistemaIdiomas();
});

// Funções globais para uso no HTML
window.adicionarIdioma = () => {
    if (sistemaIdiomas) {
        sistemaIdiomas.adicionarIdioma();
    } else {
        console.error('Sistema de idiomas não inicializado');
    }
};

window.removerIdioma = (id) => {
    if (sistemaIdiomas) {
        sistemaIdiomas.removerIdioma(id);
    }
};