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

    // Add search box functionality
    d3.select('#addPokemon').on('click', function() {
        let input = d3.select('#pokemonSearch').property('value');
        let pokemon = data.find(d => d.Name.toLowerCase() === input.toLowerCase());
        if (pokemon) {
            // Code to add Pokémon to chart will go here
        } else {
            alert('No Pokémon found with that name!');
        }
    });
});
