// script.js

d3.csv("pokemon.csv").then(data => {
    // Parse numeric attributes
    data.forEach(d => {
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

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("body").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Attack)])
        .range([0, window.innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Defense)])
        .range([0, window.innerHeight]);

    const circle = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Attack))
        .attr("cy", d => yScale(d.Defense))
        .attr("r", d => Math.sqrt(d.Total) / 2) // Use square root to calculate radius so the area represents 'Total'
        .style("fill", d => color(d['Type 1'])); // Colors based on 'Type 1'

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(0," + (window.innerHeight - 20) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(20,0)")
        .call(yAxis);

}).catch(error => {
    console.log(error);
});
