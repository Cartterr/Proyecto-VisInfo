d3.csv("pokemon.csv").then(data => {
    data.forEach(d => {
        d["Total"] = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"].reduce((total, stat) => total + +d[stat], 0);
    });

    const types = Array.from(new Set(data.map(d => d["Type 1"])));
    const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];

    const margin = { top: 20, right: 30, bottom: 40, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        brushHeight = 100;

    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + brushHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const brushX = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Total"])])
        .range([0, width]);

    const brushY = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Total"])])
        .range([brushHeight, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    const brushXAxis = d3.axisBottom(brushX);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis);

    const brushGroup = svg.append("g")
        .attr("class", "brush-group")
        .attr("transform", `translate(0,${height + margin.bottom})`);

    brushGroup.append("g")
        .attr("class", "axis x-axis-brush")
        .attr("transform", `translate(0,${brushHeight})`)
        .call(brushXAxis);

    brushGroup.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => brushX(d["Total"]))
        .attr("cy", brushHeight / 2)
        .attr("r", 2);

    const brush = d3.brushX()
        .extent([[0, 0], [width, brushHeight]])
        .on("brush end", brushended);

    brushGroup.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushended(event) {
        if (event.selection) {
            const [minTotal, maxTotal] = event.selection.map(brushX.invert);
            updateBoxPlot(selectedType, minTotal, maxTotal);
        }
    }

    let selectedType = types[0];
    const updateBoxPlot = (selectedType, minTotal, maxTotal) => {
        const typeData = data.filter(d => d["Type 1"] === selectedType && d["Total"] >= minTotal && d["Total"] <= maxTotal);

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
            selectedType = d3.select(this).text();
            updateBoxPlot(selectedType);
        });

    // Initialize with the first type
    updateBoxPlot(selectedType);
});
