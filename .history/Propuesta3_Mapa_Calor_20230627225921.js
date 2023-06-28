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

var histogramSvg = d3.select("#chart")
    .append("svg")
    .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
    .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + histogramMargin.left + "," + histogramMargin.top + ")");

var svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([0, 2]);

d3.csv("typing_chart.csv").then(function(data) {
    var types = ["Type 1", "Type 2"];
    var rows = data.map(function(d) { return d.Name; });

    var chartX = (svgWidth - chartWidth) / 2;
    var chartY = (svgHeight - chartHeight - 100) / 2;

    var chartGroup = svg.append("g")
        .attr("transform", "translate(" + chartX + "," + chartY + ")");

    updateHeatmap(data);
    updateHistogram(data);

    function updateHistogram(data) {
        histogramSvg.selectAll("*").remove();

        x.domain([0, d3.max(data, function(d) { return +d.Total; })]);

        var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(20))
            (data.map(function(d) { return +d.Total; }));

        y.domain([0, d3.max(bins, function(d) { return d.length; })]);

        var bar = histogramSvg.selectAll(".bar")
            .data(bins)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return histogramHeight - y(d.length); })
            .style("fill", "steelblue");

        histogramSvg.append("g")
            .attr("transform", "translate(0," + histogramHeight + ")")
            .call(d3.axisBottom(x));

        histogramSvg.append("g")
            .call(d3.axisLeft(y));

        histogramSvg.append("g")
            .attr("class", "brush")
            .call(d3.brushX()
                .extent([[0, 0], [histogramWidth, histogramHeight]])
                .on("end", brushed));
    }

    function updateHeatmap(data) {
        chartGroup.selectAll("*").remove();

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
            .attr("width", chartWidth / types.length - cellPadding)
            .attr("height", chartHeight / rows.length - cellPadding)
            .style("stroke", "black")
            .style("stroke-width", "0.1")
            .style("fill", function(d) { return colorScale(d.value); });

        cells.append("text")
            .attr("x", -cellPadding)
            .attr("y", (chartHeight / rows.length) / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(function(d) { return d.Name; });

        cells.append("text")
            .attr("x", function(d, i) { return (i + 0.5) * (chartWidth / types.length); })
            .attr("y", -cellPadding)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(-90)")
            .text(function(d) { return d.Type; });
    }

    function brushed() {
        if (!d3.event.selection) return;

        var s = d3.event.selection,
            range = s.map(x.invert);

        var filteredData = data.filter(function(d) { return +d.Total >= range[0] && +d.Total <= range[1]; });

        updateHeatmap(filteredData);
    }
});
