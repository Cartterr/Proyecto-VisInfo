// script.js


// Cargar los datos
d3.csv('pokemon.csv').then(data => {
    let activePokemonSet = new Set();
    let activePokemon = {};

    // Parsear los atributos numéricos
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

    // Dimensiones del gráfico
    let margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    // Lista de estadísticas
    let allStats = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

    // Escalas
    let radialScale = d3.scaleLinear()
        .domain([0, 255])
        .range([0, width / 2]);

    let angleScale = d3.scaleOrdinal()
        .domain(allStats)
        .range([...Array(allStats.length).keys()].map(i => i * 2 * Math.PI / allStats.length));

    // Crear el área svg
    let svg = d3.select("#radialGraph")
    .append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);



    // Generar un color aleatorio para un Pokémon
    function generateColor() {
        let colors = ["#60D394", "#ED588D", "#60B2D3", "#D36060", "#D3CF60", "#9F61A2", "#51C8C0", "#F79256", "#A6B1E1", "#FCC89B", "#FF7F00", "#4DD2C8", "#DE5285", "#536878", "#C4FFEB", "#FFC3A0", "#7DCE82", "#FFA69E", "#C9CBA8", "#FF4E50", "#6A0572", "#00A8B5", "#FF6B6B", "#A8EB12", "#FFD700", "#007BA7", "#FF9999", "#6D2E46", "#8E8D8A", "#728C00", "#6B4423", "#F0C05A", "#003366", "#E75480", "#8E001C", "#757575", "#FF2800", "#FCF6BD", "#0B0B61", "#E4717A", "#00A9B5", "#CC333F", "#EB6841", "#FF7A5A", "#7FFF00", "#5D8AA8", "#00FFFF", "#A4243B", "#856088", "#CCFF00", "#1B4D3E", "#D65282", "#5B92E5", "#8C271E", "#D68E7C", "#FFB200", "#803A4B", "#FF033E", "#A2A2D0", "#DA614E", "#2F847C", "#FF8C69", "#53FF4C", "#C71585", "#A50B5E", "#6A0572", "#00A8B5", "#FF6B6B", "#A8EB12", "#FFD700", "#007BA7", "#FF9999", "#6D2E46", "#8E8D8A", "#728C00", "#6B4423", "#F0C05A", "#003366", "#E75480", "#8E001C", "#757575", "#FF2800", "#FCF6BD", "#0B0B61", "#E4717A", "#00A9B5", "#CC333F", "#EB6841", "#FF7A5A", "#7FFF00", "#5D8AA8", "#00FFFF", "#A4243B", "#856088", "#CCFF00", "#1B4D3E", "#D65282", "#5B92E5", "#8C271E", "#D68E7C", "#FFB200", "#803A4B", "#FF033E", "#A2A2D0", "#DA614E", "#2F847C", "#FF8C69", "#53FF4C", "#C71585", "#A50B5E"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Función para dibujar la ruta radial de un Pokémon
    function drawPath(pokemon, color) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        let lineGenerator = d3.lineRadial()
            .radius(d => radialScale(d.value))
            .angle((d, i) => angleScale(allStats[i]))
            .curve(d3.curveLinearClosed); // Cerrar la línea

        let points = allStats.map(stat => ({value: pokemon[stat]}));

        svg.append('path')
            .datum(points)
            .attr('d', lineGenerator)
            .attr('stroke-width', 1.5)
            .attr('stroke', color)
            .attr('fill', color)
            .attr('id', 'path_' + sanitizedPokemonName)
            .attr('class', 'pokemonPath');
    }

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
          // Add the "X" button
          d3.select('#button_' + sanitizedPokemonName)
            .append('span')
            .attr('class', 'remove-button')
            .text('X')
            .on('click', function() {
              removePokemonFromGraph(pokemon);
              removePokemonFromList(pokemon);
              d3.select(this.parentNode).classed('highlight', false);
            });
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

    // Agregar ejes
    allStats.forEach(stat => {
        let axis = svg.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', d => radialScales[stat](statDomains[stat][1]) * Math.cos(angleScale(stat) - Math.PI / 2))
            .attr('y2', d => radialScales[stat](statDomains[stat][1]) * Math.sin(angleScale(stat) - Math.PI / 2))
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);

        svg.append('text')
            .attr('x', d => (radialScales[stat](statDomains[stat][1]) + 55) * Math.cos(angleScale(stat) - Math.PI / 2))
            .attr('y', d => (radialScales[stat](statDomains[stat][1]) + 25) * Math.sin(angleScale(stat) - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(stat)
            .attr('class', 'axisLabel');

        // Agregar círculos concéntricos y etiquetas para cada estadística
        [0.25, 0.5, 0.75, 1].forEach((percentage) => {
            let value = percentage * statDomains[stat][1];
            svg.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', radialScales[stat](value))
                .attr('stroke', 'lightgray')
                .attr('fill', 'none');

            svg.append('text')
                .attr('x', d => radialScales[stat](value) * Math.cos(angleScale(stat) - Math.PI / 2) + 5)
                .attr('y', d => radialScales[stat](value) * Math.sin(angleScale(stat) - Math.PI / 2) + 15) // Posicionar las etiquetas ligeramente por encima del círculo
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('fill', 'cyan')
                .text(Math.round(value));
        });
    });



    // Función para agregar Pokémon a la lista del lado derecho
    function addPokemonToList(pokemon) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        d3.select('#analyzedPokemons')
            .append('p')
            .attr('id', 'analyzed_' + sanitizedPokemonName)
            .text(pokemon.Name);
    }

    // Función para eliminar un Pokémon del gráfico
    function removePokemonFromGraph(pokemon) {
        let sanitizedPokemonName = pokemon.Name.replace(/\s/g, '_');
        svg.select('#path_' + sanitizedPokemonName).remove();
    }
    
  

    // Agregar funcionalidad de búsqueda al cuadro
    d3.select('#addPokemon').on('click', function() {
        let input = d3.select('#pokemonSearch').property('value');
        let pokemon = data.find(d => d.Name.toLowerCase() === input.toLowerCase());
        if (pokemon) {
            addPokemonToGraph(pokemon);
            if (activePokemonSet.has(pokemon.Name)) {
                d3.select('#button_' + pokemon.Name.replace(/\s/g, '_')).classed('activePokemon', true);

            }
        } else {
            alert('¡No se encontró ningún Pokémon con ese nombre!');
        }
    });


    // Crear lista de nombres de Pokémon
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


    // Agregar evento de clic a los elementos de la lista
    list.on('click', function(d) {
        addPokemonToGraph(d);
    });

    // Agregar funcionalidad de autocompletar al cuadro de búsqueda
    let searchBox = document.getElementById('pokemonSearch');
    new Awesomplete(searchBox, {list: sortedData.map(d => d.Name)});

    
});
