// ===== CATÁLOGO DE TÉCNICAS =====
// APENAS UMA TÉCNICA PARA TESTE - Arquearia Montada

const catalogoTecnicas = {
    // TÉCNICA ÚNICA PARA TESTE
    "Arquearia Montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga. Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada (as outras penalidades são aplicadas normalmente).",
        dificuldade: "Difícil",
        preRequisitos: [
            {
                idPericia: "arco",  // ID da perícia Arco do catálogo
                nomePericia: "Arco",
                nivelMinimo: 4  // Pré-definido: Arco-4
            },
            {
                idPericia: "grupo-cavalgar",  // ID da perícia Cavalgar do catálogo
                nomePericia: "Cavalgar",
                nivelMinimo: 0  // Precisa ter a perícia, sem nível mínimo específico
            }
        ],
        regrasEspeciais: [
            "Não pode exceder o NH em Arco",
            "Exemplo: Se personagem tem Arco 13 e Arquearia Montada 11, as penalidades para disparar a cavalo nunca reduzem o NH abaixo de 11 antes de outros modificadores"
        ],
        referencia: "pág. 397",
        tipo: "tecnica-combate"
    }
};

// ===== FUNÇÕES BÁSICAS DO CATÁLOGO =====

// Obter todas as técnicas do catálogo
function obterTodasTecnicas() {
    const todas = [];
    
    for (const chave in catalogoTecnicas) {
        const tecnica = catalogoTecnicas[chave];
        todas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            regrasEspeciais: tecnica.regrasEspeciais,
            referencia: tecnica.referencia,
            tipo: tecnica.tipo
        });
    }
    
    return todas;
}

// Buscar técnica por ID
function buscarTecnicaPorId(id) {
    for (const chave in catalogoTecnicas) {
        if (catalogoTecnicas[chave].id === id) {
            return catalogoTecnicas[chave];
        }
    }
    return null;
}

// Buscar técnica por nome
function buscarTecnicaPorNome(nome) {
    for (const chave in catalogoTecnicas) {
        if (catalogoTecnicas[chave].nome.toLowerCase() === nome.toLowerCase()) {
            return catalogoTecnicas[chave];
        }
    }
    return null;
}

// Obter técnicas por dificuldade
function obterTecnicasPorDificuldade(dificuldade) {
    const todas = obterTodasTecnicas();
    return todas.filter(tecnica => tecnica.dificuldade === dificuldade);
}

// Obter técnicas por perícia requisitada
function obterTecnicasPorPericia(idPericia) {
    const todas = obterTodasTecnicas();
    return todas.filter(tecnica => 
        tecnica.preRequisitos.some(prereq => prereq.idPericia === idPericia)
    );
}

// ===== EXPORTAÇÃO PARA USO GLOBAL =====
window.catalogoTecnicas = {
    // Dados
    dados: catalogoTecnicas,
    
    // Funções principais
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId,
    buscarTecnicaPorNome: buscarTecnicaPorNome,
    obterTecnicasPorDificuldade: obterTecnicasPorDificuldade,
    obterTecnicasPorPericia: obterTecnicasPorPericia
};

// Mensagem de inicialização
console.log('Catálogo de técnicas carregado: 1 técnica disponível (Arquearia Montada)');