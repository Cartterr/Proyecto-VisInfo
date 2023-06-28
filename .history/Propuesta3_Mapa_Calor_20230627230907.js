var svgWidth = 800;
var svgHeight = 900;
var chartWidth = 600;
var chartHeight = 600;
var cellPadding = 5;
var columnLabelPadding = 10;

var xScaleStacked = d3.scaleBand().range([0, chartWidth]).padding(0.1);
var yScaleStacked = d3.scaleLinear().range([chartHeight, 0]);
var color = d3.scaleOrdinal(d3.schemeCategory10); //Color scheme for the bars



d3.csv("typing_chart.csv").then(function(data) {
     
     var types = data.columns.slice(1);
     var rows = data.map(function(d) { return d.Types; });

     var colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
                         .domain([0, 2]);

     var svg = d3.select("#chart")
               .attr("width", svgWidth)
               .attr("height", svgHeight);

     var chartX = (svgWidth - chartWidth) / 2;
     var chartY = (svgHeight - chartHeight - 100) / 2; // Reducir 100 para dejar espacio para la leyenda

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
          .style("stroke", "black")
          .style("stroke-width", "0.1")
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

     var svgStacked = d3.select("body")
          .append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);

     function formatData(data) {
          var types = data.columns.slice(2, 4); // Assuming Type 1 and Type 2 are columns 2 and 3
          var generations = Array.from(new Set(data.map(d => d.Generation)));
          var formattedData = generations.map(function(generation) {
               var temp = {Generation: generation};
               types.forEach(function(type) {
               temp[type] = d3.sum(data.filter(d => d.Generation == generation), d => d[type] == type ? 1 : 0);
               });
               return temp;
          });
          return {data: formattedData, types: types};
          }
             

     var stack = d3.stack()
          .keys(types);
     var series = stack(formattedData);

     svgStacked.selectAll("g")
          .data(series)
          .enter().append("g")
               .attr("fill", function(d) { return color(d.key); })
          .selectAll("rect")
          .data(function(d) { return d; })
          .enter().append("rect")
               .attr("x", function(d) { return xScaleStacked(d.data.Generation); })
               .attr("y", function(d) { return yScaleStacked(d[1]); })
               .attr("height", function(d) { return yScaleStacked(d[0]) - yScaleStacked(d[1]); })
               .attr("width", xScaleStacked.bandwidth());

     var brush = d3.brushX()
          .extent([[0, 0], [chartWidth, chartHeight]])
          .on("end", updateHeatmap);
     
     svgStacked.append("g")
          .attr("class", "brush")
          .call(brush);
             

     function updateHeatmap() {
          if (!d3.event.selection) return; // Ignore empty selections.
          var brushRange = d3.event.selection.map(xScaleStacked.invert, xScaleStacked);
          var filteredData = data.filter(d => d.Generation >= brushRange[0] && d.Generation <= brushRange[1]);
          // Update your heatmap using filteredData
          }
             


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

     // Agregar leyenda
     var legendX = chartX + chartWidth / 4;
     var legendY = chartY + chartHeight + 30; // Ajustar posición vertical de la leyenda
     
     var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + legendX + "," + legendY + ")");
     
     var legendItems = legend.selectAll(".legend-item")
                              .data([0, 0.5, 1, 2])
                              .enter()
                              .append("g")
                              .attr("class", "legend-item")
                              .attr("transform", function(d, i) { return "translate(" + i * 80 + ", 0)"; });
     
     legendItems.append("rect")
               .attr("width", 20)
               .attr("height", 20)
               .style("stroke", "black")
               .style("stroke-width", "0.1")
               .attr("fill", function(d) { return colorScale(d); });
     
     legendItems.append("text")
               .attr("x", 30)
               .attr("y", 15)
               .attr("class", "row-label")
               .attr("text-anchor", "start")
               .attr("dominant-baseline", "auto")
               .text(function(d) { return d; });
});
