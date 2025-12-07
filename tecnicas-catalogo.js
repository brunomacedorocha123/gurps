// ===== CATÁLOGO DE TÉCNICAS - VERSÃO SIMPLES =====
// Formato super fácil para adicionar novas técnicas depois

const catalogoTecnicas = {
    // TÉCNICA: ARQUEARIA MONTADA
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco eficientemente enquanto cavalga.",
        dificuldade: "Difícil", // "Média" ou "Difícil"
        
        // BASE DE CÁLCULO (obrigatório)
        basePericia: "arco", // ID da perícia base
        redutor: -4,         // Redutor ao NH da perícia base
        
        // LIMITE MÁXIMO (opcional - se não tiver, usa basePericia)
        limitePericia: "arco", // Não pode passar o NH desta perícia
        
        // PRÉ-REQUISITOS (array simples)
        // Formato 1: { pericia: "id-da-pericia", nivelMin: 4 }
        // Formato 2: { tipo: "cavalgar" } // Para qualquer cavalgar
        preRequisitos: [
            { pericia: "arco", nivelMin: 4 },    // Arco nível 4+
            { tipo: "cavalgar" }                 // Qualquer Cavalgar
        ]
    }
    
    // PARA ADICIONAR NOVA TÉCNICA, COPIAR E COLAR AQUI:
    /*
    "id-da-tecnica": {
        id: "id-da-tecnica",
        nome: "Nome da Técnica",
        descricao: "Descrição aqui",
        dificuldade: "Média", // ou "Difícil"
        basePericia: "id-pericia-base",
        redutor: -X, // número negativo ou 0
        limitePericia: "id-pericia-limite", // opcional
        preRequisitos: [
            { pericia: "id-pericia", nivelMin: X },
            { tipo: "cavalgar" } // ou outro tipo especial
        ]
    },
    */
};

// ===== FUNÇÕES SIMPLES PARA USAR O CATÁLOGO =====
window.catalogoTecnicas = {
    // Pega todas as técnicas
    todas: function() {
        return Object.values(catalogoTecnicas);
    },
    
    // Busca uma técnica pelo ID
    buscar: function(id) {
        return catalogoTecnicas[id] || null;
    },
    
    // Converte para formato antigo (para compatibilidade)
    obterTodasTecnicas: function() {
        return this.todas().map(tecnica => ({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            baseCalculo: {
                tipo: "pericia",
                idPericia: tecnica.basePericia,
                redutor: tecnica.redutor || 0
            },
            limiteMaximo: tecnica.limitePericia ? {
                tipo: "pericia",
                idPericia: tecnica.limitePericia
            } : null,
            preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                if (prereq.tipo === "cavalgar") {
                    return {
                        verificarCavalgar: true,
                        nomePericia: "Cavalgar",
                        nivelMinimo: 0
                    };
                } else {
                    return {
                        idPericia: prereq.pericia,
                        nomePericia: prereq.pericia, // O sistema vai buscar o nome
                        nivelMinimo: prereq.nivelMin || 0
                    };
                }
            }) : []
        }));
    },
    
    buscarTecnicaPorId: function(id) {
        const tecnica = this.buscar(id);
        if (!tecnica) return null;
        
        // Converte para formato antigo
        return {
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            baseCalculo: {
                tipo: "pericia",
                idPericia: tecnica.basePericia,
                redutor: tecnica.redutor || 0
            },
            limiteMaximo: tecnica.limitePericia ? {
                tipo: "pericia",
                idPericia: tecnica.limitePericia
            } : null,
            preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                if (prereq.tipo === "cavalgar") {
                    return {
                        verificarCavalgar: true,
                        nomePericia: "Cavalgar",
                        nivelMinimo: 0
                    };
                } else {
                    return {
                        idPericia: prereq.pericia,
                        nomePericia: prereq.pericia,
                        nivelMinimo: prereq.nivelMin || 0
                    };
                }
            }) : []
        };
    }
};

// ===== EXEMPLOS DE COMO ADICIONAR NOVAS TÉCNICAS DEPOIS =====

/*

// EXEMPLO 1: Técnica de Espada
const novaTecnicaEspada = {
    id: "contra-ataque-espada",
    nome: "Contra-Ataque (Espada)",
    descricao: "Após defender, ataca imediatamente o oponente.",
    dificuldade: "Difícil",
    basePericia: "espadas-curtas",
    redutor: -3,
    limitePericia: "espadas-curtas",
    preRequisitos: [
        { pericia: "espadas-curtas", nivelMin: 5 },
        { pericia: "esquiva", nivelMin: 3 }
    ]
};

// EXEMPLO 2: Técnica de Cavalgar
const novaTecnicaCavalgar = {
    id: "carreira-montada",
    nome: "Carreira Montada",
    descricao: "Ataca com lança enquanto cavalga em velocidade.",
    dificuldade: "Média",
    basePericia: "lanca",
    redutor: -2,
    limitePericia: "cavalgar-cavalo", // Limite baseado no cavalgar
    preRequisitos: [
        { pericia: "lanca", nivelMin: 3 },
        { tipo: "cavalgar" }
    ]
};

// EXEMPLO 3: Técnica simples sem limite específico
const novaTecnicaSimples = {
    id: "foco-em-mira",
    nome: "Foco em Mira",
    descricao: "Aumenta precisão ao mirar por um turno inteiro.",
    dificuldade: "Média",
    basePericia: "arco",
    redutor: -2,
    // Sem limitePericia = não tem limite máximo
    preRequisitos: [
        { pericia: "arco", nivelMin: 3 }
    ]
};

*/

console.log("✅ Catálogo de técnicas carregado (formato simplificado)");