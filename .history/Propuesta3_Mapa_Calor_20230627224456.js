var svgWidth = 800;
var svgHeight = 1800;  // updated height to accommodate the scatter plot
var chartWidth = 600;
var chartHeight = 600;
var scatterWidth = 600;
var scatterHeight = 600;
var cellPadding = 5;
var columnLabelPadding = 10;
var scatterPlotOffset = chartHeight + 100;  // gap between heatmap and scatter plot

d3.csv("typing_chart.csv").then(function(data) {
  var types = data.columns.slice(1);
  var rows = data.map(function(d) { return d.Types; });

  var colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
                     .domain([0, 2]);

  var xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return +d.Attack; })]).range([0, scatterWidth]);  // scale for Attack
  var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return +d.Defense; })]).range([scatterHeight, 0]); // scale for Defense

  var svg = d3.select("#chart")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

  var chartX = (svgWidth - chartWidth) / 2;
  var chartY = (svgHeight - chartHeight - 100) / 2; // Reducir 100 para dejar espacio para la leyenda

  var chartGroup = svg.append("g")
                      .attr("transform", "translate(" + chartX + "," + chartY + ")");

  var scatterGroup = svg.append("g")
                        .attr("transform", "translate(" + chartX + "," + (chartY + scatterPlotOffset) + ")");  // scatter plot group

  // add brush to the scatter plot
  var brush = d3.brush().extent([[0, 0], [scatterWidth, scatterHeight]])
    .on("brush end", brushed);

  scatterGroup.append("g").attr("class", "brush").call(brush);

  function brushed() {
    var selection = d3.event.selection;
    var x0 = xScale.invert(selection[0][0]);  // convert pixel coords to Attack
    var x1 = xScale.invert(selection[1][0]);  // convert pixel coords to Attack
    var y0 = yScale.invert(selection[1][1]);  // convert pixel coords to Defense
    var y1 = yScale.invert(selection[0][1]);  // convert pixel coords to Defense

    // filter data
    var filteredData = data.filter(function(d) { return d.Attack >= x0 && d.Attack <= x1 && d.Defense >= y0 && d.Defense <= y1; });

    // update heatmap
    cells.remove();  // remove old cells
    cells = chartGroup.selectAll("g")
                      .data(filteredData)  // update with filtered data
                      .enter()
                      .append("g")
                      .attr("transform", function(d, i) { return "translate(0," + i * (chartHeight / filteredData.length) + ")"; });

    // repeat the cell drawing code with the filtered data
    // ...
  }

  var cells = chartGroup.selectAll("g")
                        .data(data)
                        .enter()
                        .append("g")
                        .attr("transform", function(d, i) { return "translate(0," + i * (chartHeight / rows.length) + ")"; });

  // draw scatter plot
  scatterGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.Attack); })
    .attr("cy", function(d) { return yScale(d.Defense); })
    .attr("r", 3);

  // remaining parts of your code
  // ...
});
