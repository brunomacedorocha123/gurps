// ===== CATÁLOGO DE MAGIAS - APENAS ÁGUA E AR =====
const catalogoMagias = [
    // === ESCOLA DA ÁGUA ===
    {
        id: 600,
        nome: "Localizar Água",
        escola: "agua",
        classe: "informacao",
        duracao: "Instantânea",
        custoMana: 2,
        tempoOperacao: "10 segundos",
        nhBase: 15,
        preRequisitos: "Nenhum",
        descricao: "Encontra a fonte de água mais próxima, direção e distância. Requer forquilha (-3 sem ela).",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 601,
        nome: "Purificar a Água",
        escola: "agua",
        classe: "especiais",
        duracao: "Permanente",
        custoMana: 1,
        tempoOperacao: "5-10 segundos/4L",
        nhBase: 15,
        preRequisitos: "Localizar Água",
        descricao: "Remove impurezas da água. Custo de 1 mana para cada 4 litros purificados.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 602,
        nome: "Criar Água",
        escola: "agua",
        classe: "comuns",
        duracao: "Permanente",
        custoMana: 2,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Purificar a Água",
        descricao: "Cria água pura do nada. 2 mana para cada 4 litros. Pode apagar fogo em área pequena.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 603,
        nome: "Dissipar Água",
        escola: "agua",
        classe: "area",
        duracao: "Permanente",
        custoMana: 3,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Criar Água",
        descricao: "Faz água desaparecer, secando objetos ou salvando de afogamento. Área limitada em águas profundas.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 604,
        nome: "Respirar Água",
        escola: "agua",
        classe: "comuns",
        duracao: "1 minuto",
        custoMana: 4,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Criar Ar e Dissipar Água",
        descricao: "Permite respirar água como se fosse ar. Mantém capacidade de respirar ar comum. Custo 2 para manter.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 605,
        nome: "Moldar Água",
        escola: "agua",
        classe: "comuns",
        duracao: "1 minuto",
        custoMana: 1,
        tempoOperacao: "2 segundos",
        nhBase: 15,
        preRequisitos: "Criar Água",
        descricao: "Esculpir e mover água/gelo/vapor. Custo por 80 litros. Pode criar muros contra fogo.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 606,
        nome: "Nevoeiro",
        escola: "agua",
        classe: "area",
        duracao: "1 minuto",
        custoMana: 2,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Moldar Água",
        descricao: "Cria área de nevoeiro denso que bloqueia visão e reduz dano de ataques de fogo. Metade do custo para manter.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 607,
        nome: "Arma Congelante",
        escola: "agua",
        classe: "comuns",
        duracao: "1 minuto",
        custoMana: 3,
        tempoOperacao: "3 segundos",
        nhBase: 15,
        preRequisitos: "Criar Água",
        descricao: "Torna arma gélida, causando +2 de dano. Bônus multiplicado por vulnerabilidade a gelo/frio.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },

    // === ESCOLA DO AR ===
    {
        id: 608,
        nome: "Purificar o Ar",
        escola: "ar",
        classe: "area",
        duracao: "Instantânea",
        custoMana: 1,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Nenhum",
        descricao: "Remove impurezas, gases venenosos e fumaça do ar. Transforma ar viciado em respirável.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 609,
        nome: "Criar Ar",
        escola: "ar",
        classe: "area",
        duracao: "5 segundos (brisas/bolhas), Permanente (ar)",
        custoMana: 1,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Purificar o Ar",
        descricao: "Produz ar onde não existe. Cria brisas, bolhas ou ar respirável no vácuo. Ar criado é permanente.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 610,
        nome: "Moldar Ar",
        escola: "ar",
        classe: "comuns",
        duracao: "1 minuto",
        custoMana: "1-10",
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Criar Ar",
        descricao: "Cria correntes de vento de 1m de largura. Pode projetar pessoas. Custo varia com intensidade do vento.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 611,
        nome: "Eliminar Odor",
        escola: "ar",
        classe: "comuns",
        duracao: "1 hora",
        custoMana: 2,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Purificar o Ar",
        descricao: "Remove odor do alvo e impede identificação por olfato. Afeta todos os itens pertencentes ao alvo.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 612,
        nome: "Previsão do Tempo",
        escola: "ar",
        classe: "informacao",
        duracao: "Instantânea",
        custoMana: "Variável (2 por dia)",
        tempoOperacao: "5 segundos por dia",
        nhBase: 15,
        preRequisitos: "No mínimo 4 magias de Ar",
        descricao: "Prevê o tempo com precisão para área e período definidos. Custo varia com duração e localização.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 613,
        nome: "Andar no Ar",
        escola: "ar",
        classe: "comuns",
        duracao: "1 minuto",
        custoMana: 3,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Moldar Ar",
        descricao: "Concede capacidade de caminhar no ar. Se cair, magia cessa. Custo 2 para manter.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 614,
        nome: "Terra em Ar",
        escola: "ar",
        classe: "comuns",
        duracao: "Permanente",
        custoMana: "1 ou 5 por 0,03 m³",
        tempoOperacao: "2 segundos",
        nhBase: 15,
        preRequisitos: "Criar Ar e Moldar Terra",
        descricao: "Transforma terra/pedra em ar. Útil para escapar de soterramento. Custo varia com quantidade.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 615,
        nome: "Mau Cheiro",
        escola: "ar",
        classe: "area",
        duracao: "5 minutos",
        custoMana: 1,
        tempoOperacao: "Instantâneo",
        nhBase: 15,
        preRequisitos: "Purificar o Ar",
        descricao: "Cria nuvem de gás fedorento que causa dano e sufocamento. Dissipa mais rápido com vento.",
        custoPontos: 1,
        dificuldade: "Difícil"
    },
    {
        id: 616,
        nome: "Relâmpago",
        escola: "ar",
        classe: "projetil",
        duracao: "Instantânea",
        custoMana: "Variável (até Aptidão Mágica por segundo)",
        tempoOperacao: "1-3 segundos",
        nhBase: 15,
        preRequisitos: "Aptidão Mágica 1 e no mínimo 6 outras magias de Ar",
        descricao: "Lança raio que causa 1d-1 de dano por ponto de mana. Pode atordoar e afetar equipamentos eletrônicos.",
        custoPontos: 1,
        dificuldade: "Difícil"
    }
];

// ✅ FUNÇÃO PARA ADICIONAR MAIS MAGIAS
function adicionarMagia(magia) {
    const idsExistentes = catalogoMagias.map(m => m.id);
    const maiorId = idsExistentes.length > 0 ? Math.max(...idsExistentes) : 599;
    const proximoId = maiorId + 1;
    
    const novaMagia = { 
        id: proximoId, 
        ...magia,
        dificuldade: magia.dificuldade || "Difícil"
    };
    catalogoMagias.push(novaMagia);
    return novaMagia;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log(`✅ Catálogo de magias carregado: ${catalogoMagias.length} magias`);
    console.log(`✅ IDs das magias: ${catalogoMagias.map(m => m.id).join(', ')}`);
    
    if (typeof sistemaMagia !== 'undefined') {
        sistemaMagia.filtrarCatalogo();
    }
});