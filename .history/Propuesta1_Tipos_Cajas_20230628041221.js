

let selectedType = 'Todos';

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
        let typeData;
        if (selectedType === 'Todos') {  // Add this condition
            typeData = data;
        } else {
            typeData = data.filter(d => d["Type 1"] === selectedType);
        }

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
        .data(['Todos'].concat(types))  // Add 'Todos' to the list
        .enter()
        .append("li")
        .text(d => d)
        .on("click", function () {
            let clickedType = d3.select(this).text();

            if (clickedType === selectedType) {
                selectedType = 'Todos';
            } else {
                selectedType = clickedType;
            }

            svgTreemap.selectAll("rect")
                .attr("opacity", d => d.parent.data.name === selectedType || selectedType === 'Todos' ? 1 : 0.3);

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

    // Group the data by Type 1 and Type 2
    let groupedData = d3.group(data, d => d["Type 1"], d => d["Type 2"]);

    // Convert the grouped data into a hierarchical structure
    let hierarchyData = { name: "root", children: [] };
    for (let [type1, values1] of groupedData) {
        let type1Node = { name: type1, children: [] };
        for (let [type2, values2] of values1) {
            type1Node.children.push({ name: type2, value: values2.length });
        }
        hierarchyData.children.push(type1Node);
    }

    
    // Building the treemap
    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .paddingInner(1)
        (root);

    const svgTreemap = d3.select("#treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a parent groups for Type 1
    const groups = svgTreemap.selectAll('g')
        .data(root.children)
        .enter()
        .append('g');

    let selectedTypeNode = null;

    // Create a subgroup for each leaf under Type 1 group
    groups.selectAll("rect")
        .data(d => d.leaves())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.parent.data.name)) // color according to Type 1
        .attr("stroke", "grey")
        .attr("opacity", 1)
        .on("click", function(event, d) {
            svgTreemap.selectAll("rect")
                .attr("opacity", 0.3); // reduce opacity for all rectangles
        
            if (selectedTypeNode) {

                selectedTypeNode.selectAll("rect")
                    .attr("opacity", 0.3); // reset opacity for previously selected group
            }
        
            if (selectedTypeNode === d3.select(this.parentNode)) {
                selectedTypeNode = null;
            } else {
                selectedTypeNode = d3.select(this.parentNode);

                selectedTypeNode.selectAll("rect")
                    .attr("opacity", 1); // set full opacity for selected group
            }
        
            const type = d.parent.data.name; // Type 1
            selectedType = selectedType === type ? 'Todos' : type;

            svgTreemap.selectAll("rect")
                .attr("opacity", d => selectedType === 'Todos' || d.parent.data.name === selectedType ? 1 : 0.3);


            typeList.selectAll("li")  
                .classed("selected", d => d === selectedType);
                
            updateBoxPlot(selectedType);
        });

    // Add labels for Type 2 and Type 1
    groups.selectAll("text.type2")
        .data(d => d.leaves())
        .enter()
        .append("text")
        .attr("class", "type2")
        .attr("x", d => d.x0 + 2.5)   
        .attr("y", d => d.y0 + 10)
        .text(d => {
            const textLength = d.data.name.length * 6; // Assuming 6px per character
            const rectHeight = d.y1 - d.y0;
    
            if (textLength < (d.x1 - d.x0) && rectHeight < 0) { // Check if text fits within width and height limits
                return d.data.name;
            } else {
                const truncatedText = d.data.name.slice(0, (d.x1 - d.x0) / 6) + "..."; // Truncate text if it doesn't fit
                return truncatedText;
            }
        })

        .append("title")  // Tooltip to show full name on hover
        .text(d => d.data.name);

    groups.append("text")
        .attr("class", "type1")
        .attr("x", d => d.x0 + 2.5)
        .attr("y", d => d.y0 + 10)
        .text(d => d.data.name) // show Type 1
        .append("title")  // Tooltip to show full name on hover
        .text(d => d.data.name);
});