// script.js

Promise.all([
    d3.csv("pokemon.csv"),
    d3.csv("generacion_region.csv")
]).then(([pokemonData, regionData]) => {
    // Parse numeric attributes
    pokemonData.forEach(d => {
        d["#"] = +d["#"];
        d.Total = +d.Total;
        d.HP = +d.HP;
        d.Attack = +d.Attack;
        d.Defense = +d.Defense;
        d["Sp. Atk"] = +d["Sp. Atk"];
        d["Sp. Def"] = +d["Sp. Def"];
        d.Speed = +d.Speed;
        d.Generation = +d.Generation;
    });

    regionData.forEach(d => {
        d.Generation = +d.Generation;
        d["Number of Pokémon"] = +d["Number of Pokémon"];
    });

    // Aggregating total stats per generation
    let statsPerGeneration = d3.nest()
        .key(d => d.Generation)
        .rollup(v => d3.sum(v, d => d.Total))
        .entries(pokemonData);

    // Add total stats to region data
    regionData.forEach(d => {
        let matchedGeneration = statsPerGeneration.find(g => g.key == d.Generation);
        if (matchedGeneration) {
            d.TotalStats = matchedGeneration.value;
        } else {
            d.TotalStats = 0;
        }
    });

    // Generate artificial coordinates for simplicity
    let xCoord = d3.scalePoint()
        .domain(regionData.map(d => d.Region))
        .range([100, window.innerWidth - 100]);

    let yCoord = d3.scalePoint()
        .domain(regionData.map(d => d.Region))
        .range([100, window.innerHeight - 100]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);
    
    let svg = d3.select("#chart").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .append("g")
        .attr("transform", "translate(" + window.innerWidth / 4 + "," + window.innerHeight / 4 + ")");
        
    svg.append("text")
        .attr("x", (window.innerWidth / 2) - 100)
        .attr("y", 50)
        .attr("class", "title")
        .style("text-anchor", "middle")
        .text("Pokemon Generations Bubble Map");

    let bubbles = svg.selectAll("circle")
        .data(regionData)
        .enter()
        .append("circle")
        .attr("cx", d => xCoord(d.Region))
        .attr("cy", d => yCoord(d.Region))
        .attr("r", d => Math.sqrt(d.TotalStats) / 2)
        .style("fill", d => color(d.Generation));

    bubbles.append("title")
        .text(d => `Region: ${d.Region}\nGeneration: ${d.Generation}\nTotal Stats: ${d.TotalStats}`);

    let legend = svg.selectAll(".legend")
        .data(regionData)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", (window.innerWidth / 2) + 95)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.Generation));

    legend.append("text")
        .attr("x", (window.innerWidth / 2) + 75)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => `Generation: ${d.Generation}`);
        
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -((window.innerHeight / 2) - 100))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Region");

    svg.append("text")
        .attr("transform", "translate(" + ((window.innerWidth / 2) - 100) + " ," + (window.innerHeight - 60) + ")")
        .style("text-anchor", "middle")
        .text("Region");
}).catch(error => {
    console.log(error);
});
