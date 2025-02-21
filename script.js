const BASE_URL = 'https://pokeapi.co/api/v2';
const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
let allPokemon = [];

// Traduções
const typeTranslations = {
    'normal': 'Normal',
    'fire': 'Fogo',
    'water': 'Água',
    'electric': 'Elétrico',
    'grass': 'Planta',
    'ice': 'Gelo',
    'fighting': 'Lutador',
    'poison': 'Venenoso',
    'ground': 'Terra',
    'flying': 'Voador',
    'psychic': 'Psíquico',
    'bug': 'Inseto',
    'rock': 'Pedra',
    'ghost': 'Fantasma',
    'dragon': 'Dragão',
    'dark': 'Sombrio',
    'steel': 'Aço',
    'fairy': 'Fada'
};

const statTranslations = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defesa Especial',
    'speed': 'Velocidade'
};

// Função para adicionar movimento na imagem do Pokémon
function addMovementToPokemonImage(pokemonImage) {
    pokemonImage.classList.add('animated', 'pulse'); // Usando uma animação CSS simples
}

// Função para adicionar a música de cada Pokémon
let currentAudio = null;  // Variável global para armazenar o áudio

function playPokemonMusic(pokemonName) {
    // Se houver um áudio tocando, pare-o antes de carregar o novo
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;  // Resetar o áudio
    }

    // Carrega o novo áudio
    currentAudio = new Audio(`musicas/${pokemonName.toLowerCase()}.mp3`);
    currentAudio.play();
}

const modalElement = document.getElementById('pokemonModal');

// Quando o modal for fechado, pare a música
modalElement.addEventListener('hidden.bs.modal', () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;  // Resetar o áudio
    }
});

// Busca a lista de Pokémon da API
async function fetchPokemonList(limit = 100000) { //aumentei o limit para trazer todos os pokemons da api
    try {
        const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erro ao buscar lista de Pokémon:', error);
        return [];
    }
}

// Faz uma requisição GET para a URL fornecida (que é a URL de detalhes de um Pokémon).
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar detalhes do Pokémon:', error);
        return null;
    }
}

// Primeiro, busca os detalhes da espécie do Pokémon e, em seguida, a cadeia de evolução.
async function fetchEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        return getEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error('Erro ao buscar cadeia de evolução:', error);
        return [];
    }
}

// Itera sobre a cadeia de evolução e extrai o nome, ID e imagem de cada Pokémon na cadeia.
function getEvolutionChain(chain) {
    const evoChain = [];
    let currentChain = chain;

    do {
        const numberFromUrl = currentChain.species.url.split('/').slice(-2, -1)[0];

        evoChain.push({
            name: currentChain.species.name,
            id: numberFromUrl,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numberFromUrl}.png` // Alterar para HQ
        });

        currentChain = currentChain.evolves_to[0];
    } while (currentChain && currentChain.hasOwnProperty('evolves_to'));

    return evoChain;
}

// Gera o HTML para o card, incluindo imagem, nome, número e tipos do Pokémon.
function createPokemonCard(pokemon) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';

    const types = pokemon.types.map(type =>
        `<span class="badge type-${type.type.name} type-badge">${typeTranslations[type.type.name]}</span>`
    ).join('');

    col.innerHTML = `
    <div class="card pokemon-card h-100 shadow-lg rounded-3" data-pokemon-url="${pokemon.species.url}">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" 
             class="card-img-top pokemon-image p-3 rounded-circle  border-dark" 
             alt="${pokemon.name}">
        <div class="card-body">
            <h5 class="card-title text-center text-capitalize text-primary">
                #${String(pokemon.id).padStart(3, '0')} ${pokemon.name}
            </h5>
            <div class="text-center mb-3">
                ${types}
            </div>
            <div class="d-flex justify-content-between">
                <button class="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#pokemonModal" onclick="showPokemonDetails(pokemon)">Ver Detalhes</button>
            </div>
        </div>
    </div>
`;

    col.querySelector('.pokemon-card').addEventListener('click', () => showPokemonDetails(pokemon));

    return col;
}

// Atualiza o conteúdo do modal com as informações do Pokémon, incluindo imagem, tipos, estatísticas, habilidades e cadeia de evolução.
async function showPokemonDetails(pokemon) {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');

    modalTitle.textContent = `#${String(pokemon.id).padStart(3, '0')} ${pokemon.name.toUpperCase()}`;

    // Imagem e tipos
    modalBody.querySelector('img').src = pokemon.sprites.other['official-artwork'].front_default;
    modalBody.querySelector('.types').innerHTML = pokemon.types.map(type =>
        `<span class="badge type-${type.type.name} type-badge">${typeTranslations[type.type.name]}</span>`
    ).join('');
    // Toca a música do Pokémon
    playPokemonMusic('pokemon-sound');

    // Estatísticas
    const statsHTML = pokemon.stats.map(stat => `
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <small>${statTranslations[stat.stat.name]}</small>
                <small>${stat.base_stat}/100</small>
            </div>
            <div class="progress">
                <div class="progress-bar bg-success" 
                     role="progressbar" 
                     style="width: ${stat.base_stat}%" 
                     aria-valuenow="${stat.base_stat}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
        </div>
    `).join('');
    modalBody.querySelector('.stats').innerHTML = statsHTML;

    // Dimensões
    modalBody.querySelector('.dimensions').innerHTML = `Altura: ${pokemon.height / 10}m | Peso: ${pokemon.weight / 10}kg`;

    // Habilidades
    modalBody.querySelector('.abilities').innerHTML = pokemon.abilities
        .map(ability => `<span class="badge bg-secondary me-1">${ability.ability.name}</span>`)
        .join('');

    // Cadeia de evolução
    const evolutionChain = await fetchEvolutionChain(pokemon.species.url);
    const evolutionHTML = evolutionChain.map((evo, index) => `
        ${index > 0 ? '<div class="fs-3">→</div>' : ''}
        <div class="text-center">
            <!-- Usando imagem de alta qualidade na evolução -->
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png" alt="${evo.name}" class="img-fluid evolution-img" data-pokemon-id="${evo.id}">
            <div class="text-capitalize">${evo.name}</div>
        </div>
    `).join('');
    modalBody.querySelector('.evolution-chain > div').innerHTML = evolutionHTML;

    // Adiciona evento de clique nas imagens de evolução
    modalBody.querySelectorAll('.evolution-img').forEach(img => {
        img.addEventListener('click', async () => {
            const pokemonId = img.getAttribute('data-pokemon-id');
            const pokemon = allPokemon.find(p => p.id == pokemonId);
            if (pokemon) {
                await showPokemonDetails(pokemon);
            }
        });
    });

    modal.show();
}

// Preenche a grade de Pokémon e configura a funcionalidade de busca.
async function initPokedex() {
    const loading = document.getElementById('loading');
    const pokemonGrid = document.getElementById('pokemonGrid');
    const searchInput = document.getElementById('searchInput');

    try {
        const pokemonList = await fetchPokemonList();
        const pokemonDetails = await Promise.all(
            pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url))
        );

        allPokemon = pokemonDetails;

        loading.style.display = 'none';

        pokemonDetails.forEach(pokemon => {
            if (pokemon) {
                pokemonGrid.appendChild(createPokemonCard(pokemon));
            }
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            pokemonGrid.innerHTML = '';

            const filteredPokemon = allPokemon.filter(pokemon =>
                pokemon.name.toLowerCase().includes(searchTerm) ||
                String(pokemon.id).includes(searchTerm)
            );

            filteredPokemon.forEach(pokemon => {
                pokemonGrid.appendChild(createPokemonCard(pokemon));
            });
        });

    } catch (error) {
        console.error('Erro ao inicializar a Pokédex:', error);
        loading.innerHTML = '<p class="text-danger">Erro ao carregar os Pokémon. Por favor, tente novamente.</p>';
    }
}



initPokedex();
