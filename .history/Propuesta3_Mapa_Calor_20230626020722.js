var svgWidth = 800;
var svgHeight = 800;
var chartWidth = 600;
var chartHeight = 600;
var cellPadding = 5;
var columnLabelPadding = 10;

d3.csv("typing_chart.csv").then(function(data) {
  var types = data.columns.slice(1);
  var rows = data.map(function(d) { return d.Types; });

  var colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
                     .domain([0, 2]);

  var svg = d3.select("#chart")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

  var chartX = (svgWidth - chartWidth) / 2;
  var chartY = (svgHeight - chartHeight) / 2;

  var chartGroup = svg.append("g")
                      .attr("transform", "translate(" + chartX + "," + chartY + ")");

  var cells = chartGroup.selectAll("g")
                        .data(data)
                        .enter()
                        .append("g")
                        .attr("transform", function(d, i) { return "translate(0," + i * (chartHeight / rows.length) + ")"; });

  cells.selectAll("rect")
       .data(function(d) { return types.map(function(type) { return { type: type, value: +d[type] }; }); })
       .enter()
       .append("rect")
       .attr("x", function(d, i) { return i * (chartWidth / types.length); })
       .attr("width", chartWidth / types.length)
       .attr("height", chartHeight / rows.length)
       .style("fill", function(d) { return colorScale(d.value); });

  // Agrega etiquetas de texto sobre las celdas
  // cells.selectAll("text")
  //      .data(function(d) { return types.map(function(type) { return { type: type, value: +d[type] }; }); })
  //      .enter()
  //      .append("text")
  //      .attr("x", function(d, i) { return (i + 0.5) * (chartWidth / types.length); })
  //      .attr("y", (chartHeight / rows.length) / 2)
  //      .attr("text-anchor", "middle")
  //      .attr("dominant-baseline", "middle")
  //      .attr("dy", "0.35em") // Ajusta la posición vertical del texto
  //      .text(function(d) { return d.value; });

  chartGroup.selectAll(".row-label")
            .data(rows)
            .enter()
            .append("text")
            .attr("class", "row-label")
            .attr("x", -cellPadding)
            .attr("y", function(d, i) { return (i + 0.5) * (chartHeight / rows.length); })
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "auto")
            .attr("dy", "0.35em")
            .text(function(d) { return d; });

  chartGroup.selectAll(".column-label")
            .data(types)
            .enter()
            .append("text")
            .attr("class", "column-label")
            .attr("x", function(d, i) { return (i + 0.5) * (chartWidth / types.length); })
            .attr("y", -columnLabelPadding)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "auto")
            .attr("dy", "0.35em")
            .attr("transform", function(d, i) { return "rotate(-90," + ((i + 0.5) * (chartWidth / types.length)) + "," + (-columnLabelPadding) + ")"; })
            .text(function(d) { return d; });
});
