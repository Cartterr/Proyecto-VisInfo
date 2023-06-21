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

    // Aggregate data by type and generation
    let statsPerTypeAndGeneration = d3.nest()
        .key(d => d.Generation)
        .key(d => d["Type 1"])
        .rollup(v => v.length)
        .entries(pokemonData);

    // Flatten the nested data and add the region information
    let data = [];
    statsPerTypeAndGeneration.forEach(gen => {
        let region = regionData.find(d => d.Generation == gen.key).Region;
        gen.values.forEach(type => {
            data.push({
                Generation: +gen.key,
                Type: type.key,
                Count: type.value,
                Region: region
            });
        });
    });

    // Define the scale for the coordinates and color
    let xCoord = d3.scalePoint()
        .domain(data.map(d => d.Type))
        .range([150, window.innerWidth - 150]);

    let yCoord = d3.scalePoint()
        .domain(data.map(d => d.Region))
        .range([150, window.innerHeight -290]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);
    
    let svg = d3.select("#chart").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .append("g")
        .attr("transform", "translate(" + window.innerWidth / 5 + "," + window.innerHeight / 6 + ")");
        
    svg.append("text")
        .attr("x", (window.innerWidth / 5))
        .attr("y", 20)
        .attr("class", "title")
        .style("text-anchor", "middle")
        .text("Pokemon Generations Bubble Map");

    let bubbles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xCoord(d.Type)/1.3 - 200)
        .attr("cy", d => yCoord(d.Region)/2)
        .attr("r", d => Math.sqrt(d.Count) * 4) // Adjust the radius factor
        .style("fill", d => color(d.Generation));

    bubbles.append("title")
        .text(d => `Region: ${d.Region}\nType: ${d.Type}\nGeneration: ${d.Generation}\nCount: ${d.Count}`);

    let legend = svg.selectAll(".legend")
        .data(regionData)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", window.innerWidth - 420)
        .attr("y", 60)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.Generation));

    legend.append("text")
        .attr("x", window.innerWidth - 430)
        .attr("y", 70)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => `Generation: ${d.Generation}`);
        
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 130)
        .attr("x", -((window.innerHeight / 2)) + 260)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Region");

    svg.append("text")
        .attr("transform", "translate(" + ((window.innerWidth / 2)) + " ," + (window.innerHeight - 50) + ")")
        .style("text-anchor", "middle")
        .text("Type");
}).catch(error => {
    console.log(error);
});
