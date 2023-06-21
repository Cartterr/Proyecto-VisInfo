d3.csv("pokemon.csv").then(data => {
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
        .attr("r", 5)
        .style("fill", "blue");

}).catch(error => {
    console.log(error);
});
