// script.js


// Load the data
d3.csv('pokemon.csv').then(data => {
    let activePokemonSet = new Set();
    let activePokemon = {};

    


    // Parse numeric attributes
    data.forEach(d => {
        d.Total = +d.Total;
        d.HP = +d.HP;
        d.Attack = +d.Attack;
        d.Defense = +d.Defense;
        d['Sp. Atk'] = +d['Sp. Atk'];
        d['Sp. Def'] = +d['Sp. Def'];
        d.Speed = +d.Speed;
        d.Generation = +d.Generation;
    });

    // Dimensions of the chart
    let margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    // List of stats
    let allStats = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

    // Scales
    let radialScale = d3.scaleLinear()
        .domain([0, 255])
        .range([0, width / 2]);

    let angleScale = d3.scaleOrdinal()
        .domain(allStats)
        .range([...Array(allStats.length).keys()].map(i => i * 2 * Math.PI / allStats.length));
    
    // Create the svg area
    let svg = d3.select("#radialGraph")
      .append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);
    
    

    // Generate random color for a Pokémon
    function generateColor() {
        let colors = ["#60D394","#ED588D","#60B2D3","#D36060","#D3CF60"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Function to draw radial path for a Pokémon
    function drawPath(pokemon, color) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        let lineGenerator = d3.lineRadial()
            .radius(d => radialScale(d.value))
            .angle((d, i) => angleScale(allStats[i]));
    
        let points = allStats.map(stat => ({value: pokemon[stat]}));
    
        svg.append('path')
            .datum(points)
            .attr('d', lineGenerator)
            .attr('stroke-width', 0)
            .attr('stroke', color)
            .attr('fill', color)
            .attr('id', 'path_' + sanitizedPokemonName)
            .attr('class', 'pokemonPath');
    
        points.forEach((point, i) => {
            svg.append('circle')
                .attr('cx', radialScale(point.value) * Math.cos(angleScale(allStats[i]) - Math.PI / 2))
                .attr('cy', radialScale(point.value) * Math.sin(angleScale(allStats[i]) - Math.PI / 2))
                .attr('r', 5)
                .attr('fill', color)
                .attr('id', 'circle_' + sanitizedPokemonName + '_' + allStats[i]); // Unique ID for each circle
        });
    }


    // Function to handle adding Pokémon to the graph
    function addPokemonToGraph(pokemon) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        let existingPath = svg.select('#path_' + sanitizedPokemonName);
        if (!existingPath.empty()) {
            existingPath.remove();
            removePokemonFromList(pokemon);
            d3.select('#button_' + sanitizedPokemonName).classed('highlight', false);
        } else {
            let color = generateColor();
            drawPath(pokemon, color);
            addPokemonToList(pokemon);
            d3.select('#button_' + sanitizedPokemonName).classed('highlight', true);
        }
    }


    let statDomains = {
        'HP': [0, 255],
        'Attack': [0, 190],
        'Defense': [0, 230],
        'Sp. Atk': [0, 194],
        'Sp. Def': [0, 230],
        'Speed': [0, 180]
    };
    
    let radialScales = {};
    allStats.forEach(stat => {
        radialScales[stat] = d3.scaleLinear()
            .domain(statDomains[stat])
            .range([0, width / 2]);
    });
    
    
    


    // Function to add Pokémon to the right side list
    function addPokemonToList(pokemon) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        d3.select('#analyzedPokemons')
            .append('p')
            .attr('id', 'analyzed_' + sanitizedPokemonName)
            .text(pokemon.Name);
    }

    // Function to remove Pokémon from the right side list
    function removePokemonFromList(pokemon) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        d3.select('#analyzed_' + sanitizedPokemonName).remove();
    }

    // Add search box functionality
    d3.select('#addPokemon').on('click', function() {
        let input = d3.select('#pokemonSearch').property('value');
        let pokemon = data.find(d => d.Name.toLowerCase() === input.toLowerCase());
        if (pokemon) {
            addPokemonToGraph(pokemon);
            if (activePokemonSet.has(pokemon.Name)) {
                d3.select('#button_' + pokemon.Name.replace(/\s/g, '_')).classed('activePokemon', true);

            }
        } else {
            alert('No Pokémon found with that name!');
        }
    });


    // Create list of Pokémon names
    let sortedData = data.sort((a, b) => d3.ascending(a.Name, b.Name));
    let list = d3.select('#pokemonList')
        .selectAll('button')
        .data(sortedData)
        .enter()
        .append('button')
        .attr('id', d => 'button_' + d.Name.replace(/\s/g, '_'))
        .text(d => d.Name)
        .each(function(d) {
            if (activePokemon[d.Name]) {
                d3.select(this).classed('activePokemon', true);
            }
        });


    // Add click event to list items
    list.on('click', function(d) {
        addPokemonToGraph(d);
    });

    // Add autocomplete functionality to search box
    let searchBox = document.getElementById('pokemonSearch');
    new Awesomplete(searchBox, {list: sortedData.map(d => d.Name)});

    
});
