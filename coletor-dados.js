// coletor-dados.js - VERSÃO COMPLETA E FUNCIONAL
class ColetorDados {
    constructor() {
        console.log('✅ Coletor de Dados inicializado');
    }

    // ======================
    // COLETA COMPLETA DE TODOS OS DADOS
    // ======================
    coletarTodosDados() {
        console.log('📦 Coletando TODOS os dados do personagem...');
        
        return {
            // ======================
            // DADOS BÁSICOS (Dashboard)
            // ======================
            nome: this._obterValor('charName', 'Novo Personagem'),
            raca: this._obterValor('racaPersonagem'),
            classe: this._obterValor('classePersonagem'),
            nivel: this._obterValor('nivelPersonagem'),
            descricao: this._obterValor('descricaoPersonagem'),
            
            // ======================
            // PONTOS (do Dashboard)
            // ======================
            pontos_totais: this._obterPontosTotais(),
            pontos_gastos: this._obterPontosGastos(),
            pontos_disponiveis: this._obterPontosDisponiveis(),
            limite_desvantagens: this._obterLimiteDesvantagens(),
            desvantagens_atuais: this._obterDesvantagensAtuais(),
            
            // ======================
            // ATRIBUTOS PRINCIPAIS
            // ======================
            forca: this._obterNumero('ST', 10),
            destreza: this._obterNumero('DX', 10),
            inteligencia: this._obterNumero('IQ', 10),
            saude: this._obterNumero('HT', 10),
            
            // ======================
            // ATRIBUTOS SECUNDÁRIOS
            // ======================
            pontos_vida: this._obterNumeroTexto('PVTotal', 10),
            bonus_pv: this._obterNumero('bonusPV', 0),
            pontos_fadiga: this._obterNumeroTexto('PFTotal', 10),
            bonus_pf: this._obterNumero('bonusPF', 0),
            vontade: this._obterNumeroTexto('VontadeTotal', 10),
            bonus_vontade: this._obterNumero('bonusVontade', 0),
            percepcao: this._obterNumeroTexto('PercepcaoTotal', 10),
            bonus_percepcao: this._obterNumero('bonusPercepcao', 0),
            deslocamento: this._obterNumeroTexto('DeslocamentoTotal', 5.00, true),
            bonus_deslocamento: this._obterNumero('bonusDeslocamento', 0, true),
            
            // ======================
            // DANO
            // ======================
            dano_gdp: this._obterTexto('danoGDP', '1d-2'),
            dano_geb: this._obterTexto('danoGEB', '1d'),
            
            // ======================
            // CARGA
            // ======================
            carga_nenhuma: this._obterNumeroTexto('cargaNenhuma', 10.0, true),
            carga_leve: this._obterNumeroTexto('cargaLeve', 20.0, true),
            carga_media: this._obterNumeroTexto('cargaMedia', 30.0, true),
            carga_pesada: this._obterNumeroTexto('cargaPesada', 60.0, true),
            carga_muito_pesada: this._obterNumeroTexto('cargaMuitoPesada', 100.0, true),
            
            // ======================
            // CARACTERÍSTICAS
            // ======================
            // Aparência
            aparencia: this._obterTextoSelect('nivelAparencia'),
            custo_aparencia: this._obterValorSelect('nivelAparencia', 0, true),
            
            // Riqueza
            riqueza: this._obterTextoSelect('nivelRiqueza'),
            custo_riqueza: this._obterValorSelect('nivelRiqueza', 0, true),
            renda_mensal: this._obterTexto('rendaMensal', '$1.000'),
            
            // Idiomas
            idioma_materno: this._obterValor('idiomaMaternoNome', 'Comum'),
            idiomas_adicionais: this._coletarIdiomas(),
            
            // Altura e Peso
            altura: this._obterNumero('altura', 1.70, true),
            peso: this._obterNumero('peso', 70),
            caracteristicas_fisicas: this._coletarCaracteristicasFisicas(),
            
            // ======================
            // VANTAGENS/DESVANTAGENS
            // ======================
            vantagens: this._coletarVantagens(),
            total_vantagens: this._contarVantagens(),
            pontos_vantagens: this._calcularPontosVantagens(),
            
            desvantagens: this._coletarDesvantagens(),
            total_desvantagens: this._contarDesvantagens(),
            pontos_desvantagens: this._calcularPontosDesvantagens(),
            
            peculiaridades: this._coletarPeculiaridades(),
            total_peculiaridades: this._contarPeculiaridades(),
            pontos_peculiaridades: this._calcularPontosPeculiaridades(),
            
            // ======================
            // PERÍCIAS E TÉCNICAS
            // ======================
            pericias: this._coletarPericias(),
            total_pericias: this._contarPericias(),
            pontos_pericias: this._calcularPontosPericias(),
            
            tecnicas: this._coletarTecnicas(),
            total_tecnicas: this._contarTecnicas(),
            pontos_tecnicas: this._calcularPontosTecnicas(),
            
            // ======================
            // MAGIAS
            // ======================
            aptidao_magica: this._obterNumero('aptidao-magica', 0),
            mana_atual: this._obterNumero('mana-atual', 10),
            mana_base: this._obterNumeroTexto('mana-base', 10),
            bonus_mana: this._obterNumero('bonus-mana', 0),
            magias: this._coletarMagias(),
            total_magias: this._contarMagias(),
            pontos_magias: this._calcularPontosMagias(),
            
            // ======================
            // EQUIPAMENTO
            // ======================
            dinheiro: this._obterDinheiro('dinheiroEquipamento', 2000),
            peso_atual: this._obterNumeroTexto('pesoAtual', 0, true),
            peso_maximo: this._obterNumeroTexto('pesoMaximo', 60, true),
            nivel_carga: this._obterTexto('nivelCarga', 'LEVE'),
            penalidades_carga: this._obterTexto('penalidadesCarga', 'MOV +0 / DODGE +0'),
            equipamentos: this._coletarEquipamentos(),
            total_equipamentos: this._contarEquipamentos(),
            
            // ======================
            // COMBATE
            // ======================
            // PV e PF
            pv_atual: this._obterNumero('pvAtualDisplay', 10),
            pv_maximo: this._obterNumeroTexto('pvMaxDisplay', 10),
            pv_modificador: this._obterNumero('pvModificador', 0),
            pv_estado: this._obterTexto('pvEstadoDisplay', 'Saudável'),
            
            pf_atual: this._obterNumero('pfAtualDisplay', 10),
            pf_maximo: this._obterNumeroTexto('pfMaxDisplay', 10),
            pf_modificador: this._obterNumero('pfModificador', 0),
            pf_estado: this._obterTexto('pfEstadoDisplay', 'Normal'),
            
            // Defesas
            esquiva: this._obterNumeroTexto('esquivaTotal', 10),
            esquiva_mod: this._obterNumero('esquivaMod', 0),
            bloqueio: this._obterNumeroTexto('bloqueioTotal', 11),
            bloqueio_mod: this._obterNumero('bloqueioMod', 0),
            aparar: this._obterNumeroTexto('apararTotal', 3),
            aparar_mod: this._obterNumero('apararMod', 0),
            
            // Bônus
            bonus_reflexos: this._obterNumero('bonusReflexos', 0),
            bonus_escudo: this._obterNumero('bonusEscudo', 0),
            bonus_capa: this._obterNumero('bonusCapa', 0),
            bonus_outros: this._obterNumero('bonusOutros', 0),
            
            // ======================
            // DATA DE ATUALIZAÇÃO
            // ======================
            updated_at: new Date().toISOString()
        };
    }
    
    // ======================
    // MÉTODOS AUXILIARES BÁSICOS
    // ======================
    
    _obterValor(id, padrao = '') {
        const el = document.getElementById(id);
        return el ? (el.value || el.textContent || padrao) : padrao;
    }
    
    _obterNumero(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.value || el.textContent || padrao;
        const num = decimal ? parseFloat(valor) : parseInt(valor);
        return isNaN(num) ? padrao : num;
    }
    
    _obterNumeroTexto(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const texto = el.textContent || el.value || padrao.toString();
        const num = decimal ? parseFloat(texto) : parseInt(texto);
        return isNaN(num) ? padrao : num;
    }
    
    _obterTexto(id, padrao = '') {
        const el = document.getElementById(id);
        if (!el) return padrao;
        return el.textContent || el.value || padrao;
    }
    
    _obterTextoSelect(id) {
        const select = document.getElementById(id);
        if (!select || !select.selectedOptions[0]) return '';
        const texto = select.selectedOptions[0].text;
        return texto.split('[')[0].trim();
    }
    
    _obterValorSelect(id, padrao = 0, numero = false) {
        const select = document.getElementById(id);
        if (!select) return padrao;
        const valor = select.value;
        return numero ? parseInt(valor) : valor;
    }
    
    // ======================
    // MÉTODOS PARA PONTOS
    // ======================
    
    _obterPontosTotais() {
        const input = document.getElementById('pontosTotaisDashboard');
        if (input) return parseInt(input.value) || 150;
        
        const display = document.getElementById('pontosTotais');
        if (display) return this._obterNumeroTexto('pontosTotais', 150);
        
        return 150;
    }
    
    _obterPontosGastos() {
        const display = document.getElementById('pontosGastosDashboard');
        if (display) return this._obterNumeroTexto('pontosGastosDashboard', 0);
        
        const display2 = document.getElementById('pontosGastos');
        if (display2) return this._obterNumeroTexto('pontosGastos', 0);
        
        return 0;
    }
    
    _obterPontosDisponiveis() {
        const display = document.getElementById('saldoDisponivelDashboard');
        if (display) return this._obterNumeroTexto('saldoDisponivelDashboard', 150);
        
        const display2 = document.getElementById('pontosSaldo');
        if (display2) return this._obterNumeroTexto('pontosSaldo', 150);
        
        return 150;
    }
    
    _obterLimiteDesvantagens() {
        const input = document.getElementById('limiteDesvantagens');
        if (input) return parseInt(input.value) || -50;
        return -50;
    }
    
    _obterDesvantagensAtuais() {
        const display = document.getElementById('desvantagensAtuais');
        if (display) return this._obterNumeroTexto('desvantagensAtuais', 0);
        return 0;
    }
    
    _obterDinheiro(id, padrao = 0) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const texto = el.textContent || el.value || '$0';
        const valor = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
        const num = parseFloat(valor);
        return isNaN(num) ? padrao : num;
    }
    
    // ======================
    // COLETORES DE LISTAS
    // ======================
    
    _coletarIdiomas() {
        try {
            const container = document.getElementById('listaIdiomasAdicionais');
            if (!container) return [];
            
            const itens = container.querySelectorAll('.idioma-adicional-item');
            if (itens.length === 0) return [];
            
            const idiomas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.idioma-nome')?.textContent?.trim();
                const fala = item.querySelector('.idioma-fala')?.textContent?.trim();
                const escrita = item.querySelector('.idioma-escrita')?.textContent?.trim();
                
                if (nome && nome !== '') {
                    idiomas.push({
                        nome: nome,
                        fala: fala || 'Rudimentar',
                        escrita: escrita || 'Nenhum',
                        pontos: this._calcularPontosIdioma(fala, escrita)
                    });
                }
            });
            
            return idiomas;
        } catch (error) {
            console.error('Erro ao coletar idiomas:', error);
            return [];
        }
    }
    
    _calcularPontosIdioma(fala, escrita) {
        let pontos = 0;
        
        // Pontos de fala
        if (fala.includes('Rudimentar')) pontos += 2;
        else if (fala.includes('Sotaque')) pontos += 4;
        else if (fala.includes('Nativo')) pontos += 6;
        
        // Pontos de escrita
        if (escrita.includes('Rudimentar')) pontos += 1;
        else if (escrita.includes('Sotaque')) pontos += 2;
        else if (escrita.includes('Nativo')) pontos += 3;
        
        return pontos;
    }
    
    _coletarCaracteristicasFisicas() {
        try {
            const container = document.getElementById('caracteristicasSelecionadas');
            if (!container) return [];
            
            const itens = container.querySelectorAll('.caracteristica-selecionada-item');
            if (itens.length === 0) return [];
            
            const caracteristicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.caracteristica-nome')?.textContent?.trim();
                const pontosTexto = item.querySelector('.caracteristica-pontos')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                
                if (nome && nome !== '') {
                    caracteristicas.push({
                        nome: nome,
                        pontos: pontos,
                        tipo: item.getAttribute('data-tipo') || ''
                    });
                }
            });
            
            return caracteristicas;
        } catch (error) {
            console.error('Erro ao coletar características:', error);
            return [];
        }
    }
    
    // ======================
    // VANTAGENS
    // ======================
    
    _coletarVantagens() {
        try {
            const lista = document.getElementById('vantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-vantagem-id]');
            if (itens.length === 0) return [];
            
            const vantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-vantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-vantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                const id = item.getAttribute('data-vantagem-id') || item.getAttribute('data-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma vantagem adquirida') {
                    vantagens.push({
                        id: id,
                        nome: nome,
                        pontos: pontos,
                        descricao: item.querySelector('.descricao-vantagem')?.textContent?.trim() || ''
                    });
                }
            });
            
            return vantagens;
        } catch (error) {
            console.error('Erro ao coletar vantagens:', error);
            return [];
        }
    }
    
    _contarVantagens() {
        const vantagens = this._coletarVantagens();
        return vantagens.length;
    }
    
    _calcularPontosVantagens() {
        const vantagens = this._coletarVantagens();
        return vantagens.reduce((total, v) => total + (v.pontos || 0), 0);
    }
    
    // ======================
    // DESVANTAGENS
    // ======================
    
    _coletarDesvantagens() {
        try {
            const lista = document.getElementById('desvantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-desvantagem-id]');
            if (itens.length === 0) return [];
            
            const desvantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-desvantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-desvantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                const id = item.getAttribute('data-desvantagem-id') || item.getAttribute('data-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma desvantagem adquirida') {
                    desvantagens.push({
                        id: id,
                        nome: nome,
                        pontos: pontos,
                        descricao: item.querySelector('.descricao-desvantagem')?.textContent?.trim() || ''
                    });
                }
            });
            
            return desvantagens;
        } catch (error) {
            console.error('Erro ao coletar desvantagens:', error);
            return [];
        }
    }
    
    _contarDesvantagens() {
        const desvantagens = this._coletarDesvantagens();
        return desvantagens.length;
    }
    
    _calcularPontosDesvantagens() {
        const desvantagens = this._coletarDesvantagens();
        return desvantagens.reduce((total, d) => total + (Math.abs(d.pontos) || 0), 0);
    }
    
    // ======================
    // PECULIARIDADES
    // ======================
    
    _coletarPeculiaridades() {
        try {
            const lista = document.getElementById('lista-peculiaridades');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.peculiaridade-item');
            if (itens.length === 0) return [];
            
            const peculiaridades = [];
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                
                if (texto && texto !== '' && texto !== 'Nenhuma peculiaridade adicionada') {
                    peculiaridades.push({
                        texto: texto,
                        pontos: -1 // Cada peculiaridade custa -1 ponto
                    });
                }
            });
            
            return peculiaridades;
        } catch (error) {
            console.error('Erro ao coletar peculiaridades:', error);
            return [];
        }
    }
    
    _contarPeculiaridades() {
        const peculiaridades = this._coletarPeculiaridades();
        return peculiaridades.length;
    }
    
    _calcularPontosPeculiaridades() {
        const peculiaridades = this._coletarPeculiaridades();
        return peculiaridades.length * -1; // -1 ponto cada
    }
    
    // ======================
    // PERÍCIAS
    // ======================
    
    _coletarPericias() {
        try {
            const lista = document.getElementById('pericias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.pericia-adquirida, [data-pericia-id]');
            if (itens.length === 0) return [];
            
            const pericias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome, .nome-pericia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.pericia-nivel, .nivel-pericia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const atributo = item.getAttribute('data-atributo') || 'DX';
                const id = item.getAttribute('data-pericia-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma perícia aprendida') {
                    pericias.push({
                        id: id,
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        atributo: atributo,
                        especializacao: item.getAttribute('data-especializacao') || ''
                    });
                }
            });
            
            return pericias;
        } catch (error) {
            console.error('Erro ao coletar perícias:', error);
            return [];
        }
    }
    
    _contarPericias() {
        const pericias = this._coletarPericias();
        return pericias.length;
    }
    
    _calcularPontosPericias() {
        const pericias = this._coletarPericias();
        return pericias.reduce((total, p) => total + (p.pontos || 0), 0);
    }
    
    // ======================
    // TÉCNICAS
    // ======================
    
    _coletarTecnicas() {
        try {
            const lista = document.getElementById('tecnicas-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.tecnica-adquirida, [data-tecnica-id]');
            if (itens.length === 0) return [];
            
            const tecnicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome, .nome-tecnica')?.textContent?.trim();
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const periciaBase = item.getAttribute('data-pericia') || '';
                const dificuldade = item.getAttribute('data-dificuldade') || 'Média';
                const id = item.getAttribute('data-tecnica-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma técnica aprendida') {
                    tecnicas.push({
                        id: id,
                        nome: nome,
                        pontos: pontos,
                        periciaBase: periciaBase,
                        dificuldade: dificuldade
                    });
                }
            });
            
            return tecnicas;
        } catch (error) {
            console.error('Erro ao coletar técnicas:', error);
            return [];
        }
    }
    
    _contarTecnicas() {
        const tecnicas = this._coletarTecnicas();
        return tecnicas.length;
    }
    
    _calcularPontosTecnicas() {
        const tecnicas = this._coletarTecnicas();
        return tecnicas.reduce((total, t) => total + (t.pontos || 0), 0);
    }
    
    // ======================
    // MAGIAS
    // ======================
    
    _coletarMagias() {
        try {
            const lista = document.getElementById('magias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.magia-adquirida, [data-magia-id]');
            if (itens.length === 0) return [];
            
            const magias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome, .nome-magia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.magia-nivel, .nivel-magia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const escola = item.getAttribute('data-escola') || '';
                const classe = item.getAttribute('data-classe') || 'Comum';
                const id = item.getAttribute('data-magia-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma magia aprendida') {
                    magias.push({
                        id: id,
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        escola: escola,
                        classe: classe,
                        descricao: item.querySelector('.descricao-magia')?.textContent?.trim() || ''
                    });
                }
            });
            
            return magias;
        } catch (error) {
            console.error('Erro ao coletar magias:', error);
            return [];
        }
    }
    
    _contarMagias() {
        const magias = this._coletarMagias();
        return magias.length;
    }
    
    _calcularPontosMagias() {
        const magias = this._coletarMagias();
        return magias.reduce((total, m) => total + (m.pontos || 0), 0);
    }
    
    // ======================
    // EQUIPAMENTOS
    // ======================
    
    _coletarEquipamentos() {
        try {
            const lista = document.getElementById('lista-equipamentos-adquiridos');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, [data-item-id]');
            if (itens.length === 0) return [];
            
            const equipamentos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome')?.textContent?.trim();
                const tipo = item.getAttribute('data-tipo') || item.querySelector('.item-tipo')?.textContent?.trim() || 'Equipamento';
                const peso = parseFloat(item.getAttribute('data-peso')) || parseFloat(item.querySelector('.item-peso')?.textContent) || 0;
                const custo = parseFloat(item.getAttribute('data-custo')) || parseFloat(item.querySelector('.item-valor')?.textContent) || 0;
                const equipado = item.classList.contains('equipado') || false;
                const id = item.getAttribute('data-item-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        id: id,
                        nome: nome,
                        tipo: tipo,
                        peso: peso,
                        custo: custo,
                        quantidade: parseInt(item.getAttribute('data-quantidade')) || 1,
                        equipado: equipado,
                        local: item.getAttribute('data-local') || 'mochila'
                    });
                }
            });
            
            return equipamentos;
        } catch (error) {
            console.error('Erro ao coletar equipamentos:', error);
            return [];
        }
    }
    
    _contarEquipamentos() {
        const equipamentos = this._coletarEquipamentos();
        return equipamentos.length;
    }
    
    // ======================
    // MÉTODOS PÚBLICOS
    // ======================
    
    obterDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            classe: this._obterValor('classePersonagem'),
            raca: this._obterValor('racaPersonagem'),
            nivel: this._obterValor('nivelPersonagem'),
            pontos_gastos: this._obterPontosGastos(),
            pontos_totais: this._obterPontosTotais(),
            forca: this._obterNumero('ST', 10),
            destreza: this._obterNumero('DX', 10),
            inteligencia: this._obterNumero('IQ', 10),
            saude: this._obterNumero('HT', 10)
        };
    }
    
    // Teste rápido de coleta
    testarColeta() {
        console.log('🧪 Testando coleta de dados...');
        
        const dados = {
            basicos: this.obterDadosBasicos(),
            vantagens: this._contarVantagens(),
            desvantagens: this._contarDesvantagens(),
            pericias: this._contarPericias(),
            magias: this._contarMagias(),
            equipamentos: this._contarEquipamentos()
        };
        
        console.log('📊 Resultado do teste:', dados);
        
        alert(`✅ Teste de coleta realizado!\n\nDados encontrados:\n• Vantagens: ${dados.vantagens}\n• Desvantagens: ${dados.desvantagens}\n• Perícias: ${dados.pericias}\n• Magias: ${dados.magias}\n• Equipamentos: ${dados.equipamentos}\n\nVerifique o console para mais detalhes.`);
        
        return dados;
    }
}

// ======================
// INSTÂNCIA GLOBAL
// ======================
let coletor;

try {
    coletor = new ColetorDados();
    window.coletor = coletor;
    
    console.log('✅ Coletor de Dados carregado globalmente');
    
    // Adicionar função de teste global
    window.testeColetor = function() {
        if (window.coletor && typeof window.coletor.testarColeta === 'function') {
            return window.coletor.testarColeta();
        } else {
            alert('❌ Coletor não disponível!');
            return null;
        }
    };
    
} catch (error) {
    console.error('❌ Erro ao carregar coletor:', error);
    
    // Fallback básico
    coletor = {
        coletarTodosDados: () => {
            console.warn('Coletor não disponível - retornando dados básicos');
            return {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                pontos_totais: 150,
                pontos_gastos: 0,
                forca: 10,
                destreza: 10,
                inteligencia: 10,
                saude: 10
            };
        },
        obterDadosBasicos: () => ({
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || ''
        })
    };
    
    window.coletor = coletor;
}