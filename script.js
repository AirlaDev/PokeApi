// script.js
document.addEventListener('DOMContentLoaded', () => {
    const pokedex = document.getElementById('pokedex');
    const searchInput = document.getElementById('search');

    // Função para buscar Pokémon
    const fetchPokemon = async (query = '') => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=150`);
        const data = await response.json();
        const pokemons = data.results;

        pokedex.innerHTML = '';

        pokemons.filter(pokemon => pokemon.name.includes(query.toLowerCase())).forEach(async (pokemon) => {
            const pokemonData = await fetch(pokemon.url).then(res => res.json());
            displayPokemon(pokemonData);
        });
    };

    // Função para exibir Pokémon
    const displayPokemon = (pokemon) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('card');
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
            <div class="card-body">
                <h5 class="card-title">${pokemon.name}</h5>
                <p class="card-text">Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            </div>
        `;

        pokemonCard.addEventListener('click', () => showPokemonDetails(pokemon));

        pokedex.appendChild(pokemonCard);
    };

    // Função para mostrar detalhes do Pokémon
    const showPokemonDetails = (pokemon) => {
        const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = pokemon.name;
        modalBody.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>Altura:</strong> ${pokemon.height / 10}m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10}kg</p>
            <p><strong>Tipo:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        `;

        modal.show();
    };

    // Evento de pesquisa
    searchInput.addEventListener('input', (e) => {
        fetchPokemon(e.target.value);
    });

    // Carregar Pokémon inicialmente
    fetchPokemon();
});

// Modal HTML (adicione no final do body)
document.body.innerHTML += `
<div class="modal fade" id="pokemonModal" tabindex="-1" aria-labelledby="pokemonModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle">Detalhes do Pokémon</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Detalhes do Pokémon serão inseridos aqui -->
            </div>
        </div>
    </div>
</div>
`;