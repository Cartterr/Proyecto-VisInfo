// script.js

// Load the data
d3.csv('pokemon.csv').then(data => {
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
    
    // Add axes
    allStats.forEach(stat => {
        let axis = svg.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', d => radialScale(255) * Math.cos(angleScale(stat) - Math.PI / 2))
            .attr('y2', d => radialScale(255) * Math.sin(angleScale(stat) - Math.PI / 2))
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);

        svg.append('text')
            .attr('x', d => (radialScale(255) + 10) * Math.cos(angleScale(stat) - Math.PI / 2))
            .attr('y', d => (radialScale(255) + 10) * Math.sin(angleScale(stat) - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(stat)
            .attr('class', 'axisLabel');
    });

    // Generate random color for a Pokémon
    function generateColor() {
        let colors = ["#60D394","#ED588D","#60B2D3","#D36060","#D3CF60"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Function to draw radial path for a Pokémon
    function drawPath(pokemon, color) {
        let lineGenerator = d3.lineRadial()
            .radius(d => radialScale(d.value))
            .angle((d, i) => angleScale(allStats[i]));

        let points = allStats.map(stat => ({value: pokemon[stat]}));

        svg.append('path')
            .datum(points)
            .attr('d', lineGenerator)
            .attr('stroke-width', 1.5)
            .attr('stroke', color)
            .attr('fill', color)
            .attr('id', 'path_' + pokemon.Name)
            .attr('class', 'pokemonPath');
    }

    // Add search box functionality
    searchButton.on('click', function() {
        let searchTerm = searchBox.property('value');
        let pokemon = data.find(d => d.Name.toLowerCase() === searchTerm.toLowerCase());

        if (pokemon) {
            let existingPath = svg.select('#path_' + pokemon.Name);
            if (!existingPath.empty()) {
                existingPath.remove();
                d3.select("#analysed_" + pokemon.Name).remove();
            } else {
                let color = generateColor();
                drawPath(pokemon, color);
                d3.select("#pokemonListAnalysed").append('div')
                    .text(pokemon.Name)
                    .attr('id', 'analysed_' + pokemon.Name)
                    .style('color', color);
            }
        }
    });

    // Create list of Pokémon names
    let sortedData = data.sort((a, b) => d3.ascending(a.Name, b.Name));
    let list = d3.select('#pokemonList')
        .selectAll('button')
        .data(sortedData)
        .enter()
        .append('button')
        .text(d => d.Name);

    // Add click event to list items
    list.on('click', function(d) {
        let existingPath = svg.select('#path_' + d.Name);
        if (!existingPath.empty()) {
            existingPath.remove();
            d3.select("#analysed_" + d.Name).remove();
        } else {
            let color = generateColor();
            drawPath(d, color);
            d3.select("#pokemonListAnalysed").append('div')
                .text(d.Name)
                .attr('id', 'analysed_' + d.Name)
                .style('color', color);
        }
    });

    // Add autocomplete functionality to search box
    let searchBox = document.getElementById('pokemonSearch');
    new Awesomplete(searchBox, {list: sortedData.map(d => d.Name)});
});
