let selectedType = 'Todos';

d3.csv("pokemon.csv").then(data => {
    // Ahora vamos a crear una lista de tipos únicos
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

    // Ahora vamos a definir la función para actualizar el gráfico de caja
    const updateBoxPlot = (selectedType) => {
        let typeData;
        if (selectedType === 'Todos') {  
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
            .attr("height", d => y(d3.quantile(d, 0.25)) - y(d3.quantile(d, 0.75)))
            .attr("clip-path", "url(#clip)");;

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
            .attr("y2", d => y(d3.median(d)))
            .attr("clip-path", "url(#clip)");
    };

    const typeList = d3.select("#typeList");
    typeList.selectAll("li")
        .data(['Todos'].concat(types))  
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


    // Inicializamos con el primer tipo
    updateBoxPlot(types[0]);

    // Agregamos un ID a cada Pokémon (necesario para calcular la jerarquía)
    data.forEach((d, i) => d.id = i);

   //TREEMAP
    const color = d3.scaleOrdinal()
    .domain(types)
    .range(d3.schemeSet3);

    // Agrupamos los datos por Tipo 1 y Tipo 2
    let groupedData = d3.group(data, d => d["Type 1"], d => d["Type 2"]);

    // Convertimos los datos agrupados en una estructura jerárquica
    let hierarchyData = { name: "root", children: [] };
    for (let [type1, values1] of groupedData) {
        let type1Node = { name: type1, children: [] };
        for (let [type2, values2] of values1) {
            type1Node.children.push({ name: type2, value: values2.length });
        }
        hierarchyData.children.push(type1Node);
    }

    // Construimos el treemap
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

    // Creamos grupos principales para el Tipo 1
    const groups = svgTreemap.selectAll('g')
        .data(root.children)
        .enter()
        .append('g');

    let selectedTypeNode = null;

    // Creamos subgrupos para cada hoja bajo el grupo del Tipo 1
    groups.selectAll("rect")
        .data(d => d.leaves())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.parent.data.name)) // color según el Tipo 1
        .attr("stroke", "grey")
        .attr("opacity", 1)
        .on("click", function(event, d) {
            svgTreemap.selectAll("rect")
                .attr("opacity", 0.3); // reducir la opacidad de todos los rectángulos
        
            if (selectedTypeNode) {
                selectedTypeNode.selectAll("rect")
                    .attr("opacity", 0.3); // restablecer la opacidad del grupo previamente seleccionado
            }
        
            if (selectedTypeNode === d3.select(this.parentNode)) {
                selectedTypeNode = null;
            } else {
                selectedTypeNode = d3.select(this.parentNode);

                selectedTypeNode.selectAll("rect")
                    .attr("opacity", 1); // establecer opacidad completa para el grupo seleccionado
            }
        
            const type = d.parent.data.name; // Tipo 1
            selectedType = selectedType === type ? 'Todos' : type;

            svgTreemap.selectAll("rect")
                .attr("opacity", d => selectedType === 'Todos' || d.parent.data.name === selectedType ? 1 : 0.3);

            typeList.selectAll("li")
                .classed("selected", d => d === selectedType);

            updateBoxPlot(selectedType);
        });

    // Agregamos etiquetas para el Tipo 2 y Tipo 1
    groups.selectAll("text.type2")
        .data(d => d.leaves())
        .enter()
        .append("text")
        .attr("class", "type2")
        .attr("x", d => d.x0 + 2.5)
        .attr("y", d => d.y0 + 10)
        .text(d => d.data.name.length * 6 < (d.x1 - d.x0) ? d.data.name : `${d.data.name.slice(0, (d.x1 - d.x0) / 6)}...`) // truncar el texto si no cabe
        .append("title")  // información sobre herramientas para mostrar el nombre completo al pasar el cursor
        .text(d => d.data.name);

    groups.append("text")
        .attr("class", "type1 text-highlight")
        .attr("x", d => d.x0 + 2.5)
        .attr("y", d => d.y0 + 18)
        .text(d => d.data.name) // mostrar el Tipo 1
        .append("title") // información sobre herramientas para mostrar el nombre completo al pasar el cursor
        .text(d => d.data.name);
});
