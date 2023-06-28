d3.csv("pokemon.csv").then(data => {
    const types = Array.from(new Set(data.map(d => d["Type 1"])));
    const generations = Array.from(new Set(data.map(d => d.Generation))).sort((a, b) => a - b); // Assuming the generations are numeric
    const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];

    const margin = { top: 20, right: 30, bottom: 40, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        genHeight = 100;

    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + genHeight) // Add room for the generation plot
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const genX = d3.scaleBand()
        .domain(generations)
        .range([0, width]);

    const genY = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.Total)]) // Assuming you want to display the "Total" stat
        .range([genHeight, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    const genXAxis = d3.axisBottom(genX);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);

    const genSvg = svg.append("g")
        .attr("transform", `translate(0,${height + margin.bottom})`);

    genSvg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => genX(d.Generation))
        .attr("y", d => genY(d.Total))
        .attr("width", genX.bandwidth())
        .attr("height", d => genHeight - genY(d.Total))
        .attr("fill", "#1f77b4");

    genSvg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${genHeight})`)
        .call(genXAxis);

    const brush = d3.brushX()
        .extent([[0, 0], [width, genHeight]])
        .on("end", brushed);

    genSvg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        const indexSelection = event.selection.map(genX.invert);
        const selectedData = data.filter(d => +d.Generation >= indexSelection[0] && +d.Generation <= indexSelection[1]);
        updateBoxPlot(selectedData, types[0]);
    }
    
    const updateBoxPlot = (filteredData, selectedType) => {
        const typeData = filteredData.filter(d => d["Type 1"] === selectedType);

        const typeStats = statNames.map(stat => typeData.map(d => +d[stat]));

        x.domain(statNames);
        y.domain([0, d3.max(typeStats, d => d3.max(d))]);

        svg.select(".x-axis")
            .call(xAxis);

        svg.select(".y-axis")
            .transition()
            .duration(250)
            .call(yAxis);

        const boxWidth = Math.min(50, x.bandwidth());

        svg.selectAll(".box")
            .data(typeStats)
            .join("rect")
            .transition()
            .duration(450)
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
            .transition()
            .duration(450)
            .attr("class", "median")
            .attr("x1", (d, i) => x(statNames[i]) + (x.bandwidth() - boxWidth) / 2)
            .attr("x2", (d, i) => x(statNames[i]) + (x.bandwidth() + boxWidth) / 2)
            .attr("y1", d => y(d3.median(d)))
            .attr("y2", d => y(d3.median(d)));        
    };

    const typeList = d3.select("#typeList");
    typeList.selectAll("li")
        .data(types)
        .enter()
        .append("li")
        .text(d => d)
        .on("click", function () {
            const selectedType = d3.select(this).text();
            updateBoxPlot(data, selectedType); //pass the whole data set
        });

    // Initialize with the first type
    updateBoxPlot(data, types[0]); //pass the whole data set
});
