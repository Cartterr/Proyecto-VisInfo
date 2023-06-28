var svgWidth = 800;
var svgHeight = 900;
var chartWidth = 600;
var chartHeight = 600;
var cellPadding = 5;
var columnLabelPadding = 10;

var histogramMargin = { top: 20, right: 20, bottom: 30, left: 40 };
var histogramWidth = svgWidth - histogramMargin.left - histogramMargin.right;
var histogramHeight = 200 - histogramMargin.top - histogramMargin.bottom;

var x = d3.scaleLinear().range([0, histogramWidth]);
var y = d3.scaleLinear().range([histogramHeight, 0]);
var histogramSvg = d3.select("#chart").append("svg")
  .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
  .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
  .append("g")
  .attr("transform", "translate(" + histogramMargin.left + "," + histogramMargin.top + ")");


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

     function updateHistogram(data) {
          //...
          bar.enter().append("g").attr("class", "bar")
          .merge(bar)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .selectAll("rect")
          .data(function(d) { return [d]; })
          .enter().append("rect")
          .attr("x", 1)
          .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
          .attr("height", function(d) { return histogramHeight - y(d.length); })
          .style("fill", "steelblue"); // uniform color for all bars
      
          // Add the x Axis
          histogramSvg.append("g")
              .attr("transform", "translate(0," + histogramHeight + ")")
              .call(d3.axisBottom(x));
      
          // Add the y Axis
          histogramSvg.append("g")
              .call(d3.axisLeft(y));
     }

     function updateHeatmap(data) {
          chartGroup.selectAll("g").remove(); // remove all existing cells
      
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
     }
      
      

     function brushed() {
          var s = d3.event.selection,
            range = s.map(x.invert);
          var filteredData = data.filter(function(d) { return +d.Total >= range[0] && +d.Total <= range[1]; });
          updateHeatmap(filteredData);
          updateHistogram(filteredData);
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

     histogramSvg.append("g")
               .attr("class", "brush")
               .call(d3.brushX()
               .extent([[0, 0], [histogramWidth, histogramHeight]])
               .on("end", brushed));
     
     legendItems.append("text")
               .attr("x", 30)
               .attr("y", 15)
               .attr("class", "row-label")
               .attr("text-anchor", "start")
               .attr("dominant-baseline", "auto")
               .text(function(d) { return d; });

     updateHistogram(data);
});
