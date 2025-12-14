// coletor-dados.js
class ColetorDados {
    // Coleta TODOS os dados do formulário
    coletarTodosDados() {
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
            // PONTOS (do sistema)
            // ======================
            pontos_totais: sistemaPontos.pontos.totais,
            pontos_gastos: sistemaPontos.pontos.gastos,
            pontos_disponiveis: sistemaPontos.pontos.disponiveis,
            limite_desvantagens: sistemaPontos.pontos.limiteDesvantagens,
            desvantagens_atuais: sistemaPontos.pontos.desvantagensAtuais,
            
            // ======================
            // ATRIBUTOS
            // ======================
            forca: this._obterNumero('ST', 10),
            destreza: this._obterNumero('DX', 10),
            inteligencia: this._obterNumero('IQ', 10),
            saude: this._obterNumero('HT', 10),
            
            // Atributos Secundários
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
            
            // Dano
            dano_gdp: this._obterTexto('danoGDP', '1d-2'),
            dano_geb: this._obterTexto('danoGEB', '1d'),
            
            // Carga
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
            desvantagens: this._coletarDesvantagens(),
            peculiaridades: this._coletarPeculiaridades(),
            
            // ======================
            // PERÍCIAS E TÉCNICAS
            // ======================
            pericias: this._coletarPericias(),
            tecnicas: this._coletarTecnicas(),
            
            // ======================
            // MAGIAS
            // ======================
            aptidao_magica: this._obterNumero('aptidao-magica', 0),
            mana_atual: this._obterNumero('mana-atual', 10),
            mana_base: this._obterNumeroTexto('mana-base', 10),
            bonus_mana: this._obterNumero('bonus-mana', 0),
            magias: this._coletarMagias(),
            
            // ======================
            // EQUIPAMENTO
            // ======================
            dinheiro: this._obterDinheiro('dinheiroEquipamento', 2000),
            peso_atual: this._obterNumeroTexto('pesoAtual', 0, true),
            peso_maximo: this._obterNumeroTexto('pesoMaximo', 60, true),
            nivel_carga: this._obterTexto('nivelCarga', 'LEVE'),
            penalidades_carga: this._obterTexto('penalidadesCarga', 'MOV +0 / DODGE +0'),
            equipamentos: this._coletarEquipamentos(),
            
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
    // MÉTODOS AUXILIARES
    // ======================
    
    _obterValor(id, padrao = '') {
        const el = document.getElementById(id);
        return el ? (el.value || el.textContent || padrao) : padrao;
    }
    
    _obterNumero(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.value || padrao;
        return decimal ? parseFloat(valor) : parseInt(valor);
    }
    
    _obterNumeroTexto(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.textContent || el.value || padrao;
        return decimal ? parseFloat(valor) : parseInt(valor);
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
        // Remove o [xx pts] do final
        return texto.split('[')[0].trim();
    }
    
    _obterValorSelect(id, padrao = 0, numero = false) {
        const select = document.getElementById(id);
        if (!select) return padrao;
        const valor = select.value;
        return numero ? parseInt(valor) : valor;
    }
    
    _obterDinheiro(id, padrao = 0) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const texto = el.textContent || el.value || '$0';
        // Remove $ e converte
        const valor = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
        return parseFloat(valor) || padrao;
    }
    
    // ======================
    // COLETORES DE LISTAS
    // ======================
    
    _coletarIdiomas() {
        const itens = document.querySelectorAll('.idioma-adicional-item');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.idioma-nome')?.textContent || '',
            fala: item.querySelector('.idioma-fala')?.textContent || '',
            escrita: item.querySelector('.idioma-escrita')?.textContent || ''
        }));
    }
    
    _coletarCaracteristicasFisicas() {
        const selecionadas = document.querySelectorAll('.caracteristica-selecionada-item');
        if (selecionadas.length === 0) return [];
        
        return Array.from(selecionadas).map(item => ({
            nome: item.querySelector('.caracteristica-nome')?.textContent || '',
            pontos: parseInt(item.getAttribute('data-pontos')) || 0
        }));
    }
    
    _coletarVantagens() {
        const itens = document.querySelectorAll('.vantagem-adquirida');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.vantagem-nome')?.textContent || '',
            pontos: parseInt(item.getAttribute('data-pontos')) || 0,
            descricao: item.querySelector('.vantagem-desc')?.textContent || ''
        }));
    }
    
    _coletarDesvantagens() {
        const itens = document.querySelectorAll('.desvantagem-adquirida');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.desvantagem-nome')?.textContent || '',
            pontos: parseInt(item.getAttribute('data-pontos')) || 0,
            descricao: item.querySelector('.desvantagem-desc')?.textContent || ''
        }));
    }
    
    _coletarPeculiaridades() {
        const itens = document.querySelectorAll('.peculiaridade-item');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => 
            item.querySelector('.peculiaridade-texto')?.textContent || ''
        );
    }
    
    _coletarPericias() {
        const itens = document.querySelectorAll('.pericia-adquirida');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.pericia-nome')?.textContent || '',
            atributo: item.getAttribute('data-atributo') || '',
            nivel: parseInt(item.querySelector('.pericia-nivel')?.textContent) || 0,
            pontos: parseInt(item.getAttribute('data-pontos')) || 0
        }));
    }
    
    _coletarTecnicas() {
        const itens = document.querySelectorAll('.tecnica-adquirida');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.tecnica-nome')?.textContent || '',
            pericia: item.getAttribute('data-pericia') || '',
            dificuldade: item.getAttribute('data-dificuldade') || '',
            pontos: parseInt(item.getAttribute('data-pontos')) || 0
        }));
    }
    
    _coletarMagias() {
        const itens = document.querySelectorAll('.magia-adquirida');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.magia-nome')?.textContent || '',
            escola: item.getAttribute('data-escola') || '',
            classe: item.getAttribute('data-classe') || '',
            nivel: parseInt(item.querySelector('.magia-nivel')?.textContent) || 0,
            pontos: parseInt(item.getAttribute('data-pontos')) || 0
        }));
    }
    
    _coletarEquipamentos() {
        const itens = document.querySelectorAll('.equipamento-adquirido');
        if (itens.length === 0) return [];
        
        return Array.from(itens).map(item => ({
            nome: item.querySelector('.equipamento-nome')?.textContent || '',
            tipo: item.getAttribute('data-tipo') || '',
            peso: parseFloat(item.getAttribute('data-peso')) || 0,
            custo: parseFloat(item.getAttribute('data-custo')) || 0,
            equipado: item.classList.contains('equipado') || false
        }));
    }
    
    // ======================
    // MÉTODOS PÚBLICOS
    // ======================
    
    // Retorna apenas os dados básicos para exibição rápida
    obterDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            classe: this._obterValor('classePersonagem'),
            raca: this._obterValor('racaPersonagem'),
            nivel: this._obterValor('nivelPersonagem'),
            pontos_gastos: sistemaPontos.pontos.gastos,
            pontos_totais: sistemaPontos.pontos.totais,
            forca: this._obterNumero('ST', 10),
            destreza: this._obterNumero('DX', 10),
            inteligencia: this._obterNumero('IQ', 10),
            saude: this._obterNumero('HT', 10)
        };
    }
}

// Instância global
const coletor = new ColetorDados();