d3.csv("pokemon.csv").then(data => {
    const types = Array.from(new Set(data.flatMap(d => [d["Type 1"], d["Type 2"]]).filter(Boolean)));
    const typeStats = types.map(type => data.filter(d => d["Type 1"] === type || d["Type 2"] === type).map(d => +d.Total));

    const margin = { top: 20, right: 30, bottom: 40, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(types)
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(typeStats, d => d3.max(d))]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    const boxWidth = Math.min(50, x.bandwidth());

    svg.selectAll(".box")
        .data(typeStats)
        .enter()
        .append("rect")
        .attr("class", "box")
        .attr("x", (d, i) => x(types[i]) + (x.bandwidth() - boxWidth) / 2)
        .attr("width", boxWidth)
        .attr("y", d => y(d3.quantile(d, 0.75)))
        .attr("height", d => y(d3.quantile(d, 0.25)) - y(d3.quantile(d, 0.75)));

    svg.selectAll(".median")
        .data(typeStats)
        .enter()
        .append("line")
        .attr("class", "median")
        .attr("x1", (d, i) => x(types[i]) + (x.bandwidth() - boxWidth) / 2)
        .attr("x2", (d, i) => x(types[i]) + (x.bandwidth() + boxWidth) / 2)
        .attr("y1", d => y(d3.median(d)))
        .attr("y2", d => y(d3.median(d)));
});
