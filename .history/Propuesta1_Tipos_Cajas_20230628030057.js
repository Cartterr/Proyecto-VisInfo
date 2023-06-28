

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
            updateBoxPlot(selectedType);
        });

    // Initialize with the first type
    updateBoxPlot(types[0]);

    // Add an id for each Pokemon (needed to compute hierarchy)
    data.forEach((d, i) => d.id = i);

    //TREEMAP
    const color = d3.scaleOrdinal()
        .domain(types)
        .range(d3.schemeSet3);

    // Building the treemap
    const root = d3.hierarchy({ values: data }, d => d.values)
        .sum(d => +d["Total"])
        .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(1)(root);

    const svgTreemap = d3.select("#treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svgTreemap.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.data["Type 1"]))
        .on("click", function() {
            const selectedType = d3.select(this).data()[0].data["Type 1"];
            updateBoxPlot(selectedType);
        });

    svgTreemap.selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", d => d.x0 + 5)   
        .attr("y", d => d.y0 + 20)  
        .text(d => d.data["Type 1"] + " - " + d.data["Type 2"]);
});