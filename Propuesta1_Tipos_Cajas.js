d3.csv("pokemon.csv").then(data => {
    const types = Array.from(new Set(data.map(d => d["Type 1"])));
    const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];

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
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);

    const updateBoxPlot = (selectedType) => {
        const typeData = data.filter(d => d["Type 1"] === selectedType);

        const typeStats = statNames.map(stat => typeData.map(d => +d[stat]));

        x.domain(statNames);
        y.domain([0, d3.max(typeStats, d => d3.max(d))]);

        svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(xAxis);

        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(yAxis);

        const boxWidth = Math.min(50, x.bandwidth());

        svg.selectAll(".box")
            .data(typeStats)
            .join("rect")
            .attr("class", "box")
            .attr("x", (d, i) => x(statNames[i]) + (x.bandwidth() - boxWidth) / 2)
            .attr("width", boxWidth)
            .attr("y", d => y(d3.quantile(d, 0.75)))
            .attr("height", d => y(d3.quantile(d, 0.25)) - y(d3.quantile(d, 0.75)));

        typeList.selectAll("li")
            .classed("selected", d => d === selectedType);
        

        svg.selectAll(".median")
            .data(typeStats)
            .join("line")
            .attr("class", "median")
            .attr("x1", (d, i) => x(statNames[i]) + (x.bandwidth() - boxWidth) / 2)
            .attr("x2", (d, i) => x(statNames[i]) + (x.bandwidth() + boxWidth) / 2)
            .attr("y1", d => y(d3.median(d)))
            .attr("y2", d => y(d3.median(d)));
        
            svg.selectAll(".box")
            .data(typeStats)
            .join("rect")
            .attr("class", "box")
            .attr("x", (d, i) => x(statNames[i]) + (x.bandwidth() - boxWidth) / 2)
            .attr("width", boxWidth)
            .attr("y", d => y(d3.quantile(d, 0.75)))
            .attr("height", d => y(d3.quantile(d, 0.25)) - y(d3.quantile(d, 0.75)))
            .on("mouseover", function(d) {
                const tooltip = d3.select(this.parentNode)
                    .append("div")
                    .attr("class", "tooltip")
                    .html(`Q1: ${d3.quantile(d, 0.25)}<br>Median: ${d3.median(d)}<br>Q3: ${d3.quantile(d, 0.75)}`)
                    .style("top", `${y(d3.median(d)) - 30}px`) // Posiciona el tooltip sobre el box
                    .style("left", `${parseFloat(d3.select(this).attr("x")) + boxWidth / 2}px`); // Centra el tooltip horizontalmente
        
                d3.select(this)
                    .attr("opacity", 0.7); // Cambia la opacidad del box al hacer hover
            })
            .on("mouseout", function() {
                d3.select(this.parentNode)
                    .select(".tooltip")
                    .remove();
        
                d3.select(this)
                    .attr("opacity", 1); // Restaura la opacidad del box al quitar el hover
            });
        
        
    };

    const typeList = d3.select("#typeList");
    typeList.selectAll("li")
        .data(types)
        .enter()
        .append("li")
        .text(d => d)
        .on("click", function () {
            const selectedType = d3.select(this).text();
            updateBoxPlot(selectedType);
        });

    // Initialize with the first type
    updateBoxPlot(types[0]);
});
