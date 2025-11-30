// vantagens-catalogo-completo.js - PARTE 1
const VANTAGENS_CATALOGO = {
    // ===== MENTAIS/SOBRENATURAIS =====
    "abafador_mana": {
        id: "abafador_mana",
        nome: "Abafador de Mana",
        custoBase: 10,
        template: "comNiveisAmpliacoes",
        niveisMax: 3,
        categoria: "mental_sobrenatural",
        descricao: "Anula energia mágica ao redor - cada nível reduz mana local em 1 ponto",
        ampliacoes: [
            {
                id: "ativada_desativada",
                nome: "Ativada/Desativada à Vontade",
                tipo: "percentual",
                valor: 100
            },
            {
                id: "efeito_area",
                nome: "Efeito de Área",
                tipo: "percentual",
                valor: 50,
                porNivel: true
            }
        ]
    },

    "abascanto_resistencia_magia": {
        id: "abascanto_resistencia_magia",
        nome: "Abascanto (Resistência à Magia)",
        custoBase: 2,
        template: "comNiveisAmpliacoes",
        niveisMax: 3,
        categoria: "mental_sobrenatural",
        descricao: "Resistência a magias - cada nível subtrai do nível de habilidade de magias contra você",
        ampliacoes: [
            {
                id: "ampliada",
                nome: "Ampliada",
                tipo: "percentual",
                valor: 150,
                descricao: "Permite ter Aptidão Mágica junto com Resistência à Magia"
            }
        ]
    },

    "abençoado": {
        id: "abençoado",
        nome: "Abençoado",
        custoBase: 10,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Sintonizado com uma entidade divina - recebe bênçãos especiais em troca de fidelidade",
        opcoes: [
            {
                id: "basico",
                nome: "Abençoado Básico",
                custo: 10,
                descricao: "Recebe visões após comunhão (+1 reação de seguidores, perde 10 PF no ritual)"
            },
            {
                id: "muito_abençoado",
                nome: "Muito Abençoado",
                custo: 20,
                descricao: "Bônus +5 em visões divinas (+2 reação de seguidores, perde 10 PF no ritual)"
            },
            {
                id: "feitos_heroicos",
                nome: "Feitos Heroicos",
                custo: 10,
                descricao: "+1 dado em ST/DX/HT por 3d segundos (1x por sessão, efeitos temporários)"
            }
        ]
    },

    "aliados": {
        id: "aliados",
        nome: "Aliados",
        custoBase: 1,
        template: "aliados",
        categoria: "social",
        descricao: "Parceiros confiáveis que acompanham o personagem em aventuras - custo varia com poder, frequência e modificadores",
        niveisPoder: [
            { valor: "25%", custo: 1, descricao: "Aliado com 25% dos pontos do personagem" },
            { valor: "50%", custo: 2, descricao: "Aliado com 50% dos pontos do personagem" },
            { valor: "75%", custo: 3, descricao: "Aliado com 75% dos pontos do personagem" },
            { valor: "100%", custo: 5, descricao: "Aliado com 100% dos pontos do personagem" },
            { valor: "150%", custo: 10, descricao: "Aliado com 150% dos pontos do personagem" }
        ],
        niveisFrequencia: [
            { valor: "6-", multiplicador: 0.5, descricao: "Aparece em 6- (9.26% das sessões)" },
            { valor: "9-", multiplicador: 1, descricao: "Aparece em 9- (37.5% das sessões)" },
            { valor: "12-", multiplicador: 2, descricao: "Aparece em 12- (74.1% das sessões)" },
            { valor: "15-", multiplicador: 3, descricao: "Aparece em 15- (95.4% das sessões)" },
            { valor: "sempre", multiplicador: 4, descricao: "Aparece sempre (100% das sessões)" }
        ],
        opcoesGrupo: [
            { valor: "unico", multiplicador: 1, descricao: "Aliado único" },
            { valor: "6-10", multiplicador: 6, descricao: "Grupo de 6-10 aliados idênticos" },
            { valor: "11-20", multiplicador: 8, descricao: "Grupo de 11-20 aliados idênticos" },
            { valor: "21-50", multiplicador: 10, descricao: "Grupo de 21-50 aliados idênticos" },
            { valor: "51-100", multiplicador: 12, descricao: "Grupo de 51-100 aliados idênticos" }
        ]
    },

    "ambidestria": {
        id: "ambidestria",
        nome: "Ambidestria",
        custo: 5,
        template: "unica",
        categoria: "fisica",
        descricao: "Usa ambas as mãos igualmente bem - sem penalidade por usar mão inábil"
    },

    "aptidao_magica": {
        id: "aptidao_magica",
        nome: "Aptidão Mágica",
        template: "niveisProgressivos",
        categoria: "mental_sobrenatural",
        descricao: "Habilidade mágica - detecta objetos encantados e melhora magias",
        niveis: [
            { nivel: 0, nome: "Nível 0", custo: 5, descricao: "Detecta objetos encantados ao ver e tocar - teste de Sentidos" },
            { nivel: 1, nome: "Nível 1", custo: 15, descricao: "+1 em magias, Percepção para detectar magia e Taumatologia" },
            { nivel: 2, nome: "Nível 2", custo: 25, descricao: "+2 em magias, reduz tempo de aprendizado em 20%" },
            { nivel: 3, nome: "Nível 3", custo: 35, descricao: "+3 em magias, reduz tempo de aprendizado em 30% - máximo para fantasia clássica" }
        ]
    },

    "atirador": {
        id: "atirador",
        nome: "Atirador",
        custo: 25,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Tiros precisos sem mirar - recebe bônus de Precisão sem manobra Apontar"
    },

    "audicao_aguçada": {
        id: "audicao_aguçada",
        nome: "Audição Aguçada",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "fisica",
        descricao: "+1 por nível em testes de audição - perceber ruídos, armas sendo manuseadas no escuro, etc."
    },

    "bom_senso": {
        id: "bom_senso",
        nome: "Bom Senso",
        custo: 10,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Aviso do Mestre antes de ações estúpidas - teste de IQ para reconsiderar"
    },

    "calculos_instantaneos": {
        id: "calculos_instantaneos",
        nome: "Cálculos Instantâneos",
        custoBase: 2,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Capacidade de realizar operações matemáticas mentalmente",
        opcoes: [
            {
                id: "calculos_basicos",
                nome: "Cálculos Instantâneos",
                custo: 2,
                descricao: "Operações matemáticas simples - pode usar calculadora em qualquer situação"
            },
            {
                id: "matematico_intuitivo",
                nome: "Matemático Intuitivo",
                custo: 5,
                descricao: "Cálculos complexos, astronavegação, engenharia - mais rápido que computador"
            }
        ]
    },

    "carga_util": {
        id: "carga_util",
        nome: "Carga Útil",
        template: "niveisProgressivos",
        categoria: "supers",
        descricao: "Transportar carga/passageiros dentro do corpo - cada nível: Base de Carga/20 kg",
        niveis: [
            { nivel: 1, nome: "Nível 1", custo: 1, descricao: "Base de Carga/20 kg de capacidade" },
            { nivel: 2, nome: "Nível 2", custo: 2, descricao: "Base de Carga/10 kg de capacidade" },
            { nivel: 3, nome: "Nível 3", custo: 3, descricao: "Base de Carga/6.67 kg de capacidade" },
            { nivel: 4, nome: "Nível 4", custo: 4, descricao: "Base de Carga/5 kg de capacidade" },
            { nivel: 5, nome: "Nível 5", custo: 5, descricao: "Base de Carga/4 kg de capacidade" }
        ]
    },

    "carisma": {
        id: "carisma",
        nome: "Carisma",
        custoBase: 5,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "mental_sobrenatural",
        descricao: "+1 por nível em testes de reação, Influência, Liderança, Oratória, etc."
    },

    "clericato": {
        id: "clericato",
        nome: "Clericato",
        custo: 5,
        template: "unica",
        categoria: "social",
        descricao: "Sacerdote ordenado - +1 em testes de reação com correligionários, preside cerimônias"
    },

    "destemor": {
        id: "destemor",
        nome: "Destemor",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "mental_sobrenatural",
        descricao: "+1 por nível em Vontade contra medo, pânico, Intimidação e poderes de medo"
    },

    "duro_de_matar": {
        id: "duro_de_matar",
        nome: "Duro de Matar",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "fisica",
        descricao: "+1 por nível em testes de HT para sobreviver abaixo de -PV ou morte instantânea"
    },

    "empatia": {
        id: "empatia",
        nome: "Empatia",
        custoBase: 5,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Sensibilidade para ler pessoas - detecta mentiras, lealdades, possessões",
        opcoes: [
            {
                id: "sensivel",
                nome: "Sensível",
                custo: 5,
                descricao: "Teste de IQ com -3, +1 em Detecção de Mentiras, Adivinhação e Psicologia"
            },
            {
                id: "empatia_completa",
                nome: "Empatia",
                custo: 15,
                descricao: "Teste de IQ normal, +3 em Detecção de Mentiras, Adivinhação e Psicologia"
            }
        ]
    },

    "empatia_animais": {
        id: "empatia_animais",
        nome: "Empatia com Animais",
        custo: 5,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Compreende motivações de animais - detecta emoções, controle sobrenatural, influencia animais"
    },

    "fleuma": {
        id: "fleuma",
        nome: "Fleuma",
        custo: 15,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Imune a Verificações de Pânico, não afetado por Intimidação, reações sempre calmas"
    },

    "hipoalgia": {
        id: "hipoalgia",
        nome: "Hipoalgia (Alto Limiar de Dor)",
        custo: 10,
        template: "unica",
        categoria: "fisica",
        descricao: "Não sofre penalidades de choque, +3 em HT contra nocaute/atordoamento/tortura"
    },

    "indomavel": {
        id: "indomavel",
        nome: "Indomável",
        custo: 15,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Imune a Testes de Influência - só pode ser influenciado por vantagens de Empatia específicas"
    },

    "intuicao": {
        id: "intuicao",
        nome: "Intuição",
        custo: 15,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Normalmente acerta em conjecturas - teste secreto de IQ com bônus/penalidades"
    },

    "memoria_eidetica": {
        id: "memoria_eidetica",
        nome: "Memória Eidética",
        custoBase: 5,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Memória excepcional - sempre bem-sucedido em testes de memória, bônus em aprendizado",
        opcoes: [
            {
                id: "memoria_eidetica",
                nome: "Memória Eidética",
                custo: 5,
                descricao: "Lembra de tudo que focaliza atenção + detalhes com teste de IQ +5 em testes de aprendizado"
            },
            {
                id: "memoria_fotografica",
                nome: "Memória Fotográfica",
                custo: 10,
                descricao: "Lembra automaticamente de todos os detalhes +10 em testes de aprendizado"
            }
        ]
    }
};

// CONTINUA NO PRÓXIMO COMENTÁRIO - SÃO MUITAS VANTAGENS!
// vantagens-catalogo-completo.js - PARTE 2
const VANTAGENS_CATALOGO_PARTE2 = {
    "mestre_armas": {
        id: "mestre_armas",
        nome: "Mestre de Armas",
        custoBase: 20,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Talento incomparável com categoria de armas motoras - bônus de dano, redução de penalidades",
        opcoes: [
            {
                id: "uma_arma_especifica",
                nome: "Uma Arma Específica",
                custo: 20,
                descricao: "Domínio completo com uma arma específica + bônus de dano + redução penalidades"
            },
            {
                id: "duas_armas_conjunto",
                nome: "Duas Armas em Conjunto",
                custo: 25,
                descricao: "Domínio com duas armas usadas em conjunto (ex: espada e escudo)"
            },
            {
                id: "classe_pequena_armas",
                nome: "Classe Pequena de Armas",
                custo: 30,
                descricao: "Domínio com classe pequena (ex: armas de esgrima ou cavaleiros)"
            },
            {
                id: "classe_intermediaria_armas",
                nome: "Classe Intermediária de Armas",
                custo: 35,
                descricao: "Domínio com classe intermediária (ex: todas as espadas)"
            },
            {
                id: "classe_ampla_armas",
                nome: "Classe Ampla de Armas",
                custo: 40,
                descricao: "Domínio com classe ampla (ex: todas as armas com lâmina)"
            },
            {
                id: "todas_armas_motoras",
                nome: "Todas as Armas Motoras",
                custo: 45,
                descricao: "Domínio completo com todas as armas motoras"
            }
        ]
    },

    "nocao_perigo": {
        id: "nocao_perigo",
        nome: "Noção do Perigo",
        custo: 15,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Sensação de que algo está errado - teste secreto de Percepção contra emboscadas e perigos iminentes"
    },

    "nocao_exata_tempo": {
        id: "nocao_exata_tempo",
        nome: "Noção Exata do Tempo",
        custoBase: 2,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Relógio mental preciso - sabe hora exata, mede lapsos de tempo, acorda quando quiser",
        opcoes: [
            {
                id: "nocao_exata_tempo",
                nome: "Noção Exata do Tempo",
                custo: 2,
                descricao: "Precisão equivalente aos melhores medidores da cultura, mede lapsos de tempo"
            },
            {
                id: "cronolocalizacao",
                nome: "Cronolocalização",
                custo: 5,
                descricao: "Sabe horas em sentido absoluto - não se confunde com viagens no tempo"
            }
        ]
    },

    "paladar_olfato_apurado": {
        id: "paladar_olfato_apurado",
        nome: "Paladar/Olfato Apurado",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "fisica",
        descricao: "+1 por nível em testes de paladar/olfato - detectar veneno em bebidas, odores suspeitos, etc."
    },

    "reflexos_combate": {
        id: "reflexos_combate",
        nome: "Reflexos em Combate",
        custo: 15,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Reações fantásticas - +1 em defesas ativas e Sacar Rápido, +2 em Verificações de Pânico"
    },

    "senso_direcao": {
        id: "senso_direcao",
        nome: "Senso de Direção",
        custoBase: 5,
        template: "comOpcoes",
        categoria: "mental_sobrenatural",
        descricao: "Excelente senso de direção - sabe onde fica o norte, refaz trajetos, bônus em navegação",
        opcoes: [
            {
                id: "senso_direcao",
                nome: "Senso de Direção",
                custo: 5,
                descricao: "Sempre sabe onde fica o norte, refaz trajetos dos últimos 30 dias, +3 em Percepção do Corpo e Navegação"
            },
            {
                id: "nocao_tridimensional_espaco",
                nome: "Noção Tridimensional do Espaço",
                custo: 10,
                descricao: "Senso de direção tridimensional - funciona no espaço sideral, +3 em Percepção do Corpo e Navegação"
            }
        ]
    },

    "sorte": {
        id: "sorte",
        nome: "Sorte",
        template: "niveisProgressivos",
        categoria: "mental_sobrenatural",
        descricao: "Personagem nasceu com sorte - pode refazer testes ruins e ficar com o melhor resultado",
        niveis: [
            {
                nivel: 1,
                nome: "Sorte",
                custo: 15,
                descricao: "Refazer teste 2x a cada hora de jogo - ficar com melhor dos 3 resultados"
            },
            {
                nivel: 2,
                nome: "Sorte Extraordinária",
                custo: 30,
                descricao: "Refazer teste 2x a cada 30 minutos - mesma mecânica da Sorte com frequência maior"
            },
            {
                nivel: 3,
                nome: "Sorte Impossível",
                custo: 60,
                descricao: "Refazer teste 2x a cada 10 minutos - mesma mecânica com frequência muito maior"
            }
        ]
    },

    "tato_apurado": {
        id: "tato_apurado",
        nome: "Tato Apurado",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "fisica",
        descricao: "+1 por nível em testes de tato - detectar armas escondidas em revistas, texturas, etc."
    },

    "treinado_por_mestre": {
        id: "treinado_por_mestre",
        nome: "Treinado por um Mestre",
        custo: 30,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Mestre das artes marciais - metade da penalidade em Golpe Rápido e Aparar múltiplo"
    },

    "visao_aguçada": {
        id: "visao_aguçada",
        nome: "Visão Aguçada",
        custoBase: 2,
        template: "comNiveis",
        niveisMax: 5,
        categoria: "fisica",
        descricao: "+1 por nível em testes de visão - perceber armadilhas, pegadas, detalhes visuais, etc."
    },

    "visao_noturna": {
        id: "visao_noturna",
        nome: "Visão Noturna",
        custoBase: 1,
        template: "comNiveis",
        niveisMax: 9,
        categoria: "fisica",
        descricao: "Adapta-se à escuridão - cada nível elimina -1 de penalidade por escuridão (até -9)"
    },

    "visao_periferica": {
        id: "visao_periferica",
        nome: "Visão Periférica",
        custo: 15,
        template: "unica",
        categoria: "fisica",
        descricao: "Campo de visão amplo (240°) - ataca em hexágonos laterais, defende sem penalidades pelos lados"
    },

    "voz_melodiosa": {
        id: "voz_melodiosa",
        nome: "Voz Melodiosa",
        custo: 10,
        template: "unica",
        categoria: "mental_sobrenatural",
        descricao: "Voz clara, atraente e ressonante - +2 em Arremedo, Atuação, Canto, Diplomacia, Lábia, Oratória"
    }
};

// JUNTAR TODAS AS VANTAGENS
const VANTAGENS_CATALOGO_COMPLETO = {
    ...VANTAGENS_CATALOGO,  // Da PARTE 1
    ...VANTAGENS_CATALOGO_PARTE2  // Da PARTE 2
};

// Exportar
if (typeof window !== 'undefined') {
    window.VANTAGENS_CATALOGO = VANTAGENS_CATALOGO_COMPLETO;
}