class LeavesChart {

  data = {};
  opt = {};
  scales = {};

  constructor(raw) {
    this.data.raw = raw;

    this.updateOpt();
    this.setScales();
    this.restructureData();

  }

  updateOpt() {
    const svg = d3.select('svg');

    const svgWidth = +svg.style('width').replace('px', '');
    const svgHeight = +svg.style('height').replace('px', '');

    this.opt.svg = { width: svgWidth, height: svgHeight };

    this.opt.figure = {}
    this.opt.figure.margin = { 
      left: 60, 
      top: 500, 
      right: 60, 
      bottom: 20 
    }

    this.opt.plot = {}
    this.opt.plot.margin = { 
      left: 64, 
      top: 0, 
      right: 0, 
      bottom: 0 
    }

    this.opt.figure.width = svgWidth - (this.opt.figure.margin.left + this.opt.figure.margin.right)
    this.opt.figure.height = svgHeight - (this.opt.figure.margin.top + this.opt.figure.margin.bottom)


    this.opt.plot.width = this.opt.figure.width - (this.opt.plot.margin.left + this.opt.plot.margin.right)
    this.opt.plot.height = this.opt.figure.height - (this.opt.plot.margin.top + this.opt.plot.margin.bottom)

    this.opt.domainGap = 40.
  }

  setScales() {
    this.scales.carbohydrate = d3.scaleLinear()
      .domain([0, d3.max(this.data.raw, d => d.carbohydrate)])
      .range([0, 600*.45])

    this.scales.lipid = d3.scaleLinear()
      .domain([0, d3.max(this.data.raw, d => d.lipid)])
      .range([0, 800*.45]);

    this.scales.stem = d3.scaleLinear()
    .domain([0, d3.max(this.data.raw, d => d.protein)])
    .range([this.opt.plot.height, 0])
    .clamp(false);

    this.scales.lipidColor = d3.scaleLinear()
      .domain(d3.extent(this.data.raw, d => d.saturatedAcidPct))
      .range(['#E2FF00', '#FF2F00']); // #D2D904 #F2AB27
  }

  restructureData() {
    this.data.hier = d3.hierarchy(
      formatData(this.data.raw, this.scales), 
      d => d.children
    );

    const tree = d3.tree()
      .size([this.opt.plot.width - this.opt.domainGap, this.opt.plot.height])

    const treeData = tree(this.data.hier).descendants();
    treeData.forEach(d => {
      const { depth, x, data, parent } = d;
      const { name, domain } = data;

      if (domain === 'vegetal') {
        d.x += this.opt.domainGap;
      }

      if (depth === 3 && d.x === parent.x) {
        d.x -= .2;
      } else if (depth === 2) {
        const children = treeData.filter(d => d.depth === 3 && d.parent.data.name === name)
        const [ xMin, xMax ] = d3.extent(children, d => d.x)
        d.data = { ...d.data, range: (xMax - xMin) }
        d.y = this.opt.plot.height
      }

    });

    this.data.tree = treeData
  }

  draw() {
    this.drawMainGroups();
    this.drawAxes();
    this.drawPlants();
  }

  drawMainGroups() {
    d3.select('svg')
      .append('g')
        .attr('id', 'figure')
        .attr('transform', `translate(${this.opt.figure.margin.left}, ${this.opt.figure.margin.top})`)
      .append('g')
        .attr('id', 'plot')
        .attr('transform', `translate(${this.opt.plot.margin.left}, ${this.opt.plot.margin.top})`);

  }

  drawAxes() {
    const tickValues = [0, 15, 30]
    const yAxis = d3.axisLeft(this.scales.stem)
      .tickValues(tickValues)
      .tickSize(0);

    const axes = d3.select('#figure')
      .insert('g', '#plot')
        .attr('class', 'axes-g')
        .attr('transform', `translate(0, ${this.opt.plot.margin.top})`)

    // ----- Y Axis
    const yAxisG = axes
      .append('g')
        .attr('class', 'y-axis');

    yAxisG
      .append('g')
        .attr('class', 'grid')
      .selectAll('line')
        .data(tickValues)
        .enter()
      .append('line')
        .attr('class', d => d === 0 ? 'grid-line zero' : 'grid-line')
        .attr('x1', 0)
        .attr('x2', this.opt.figure.width)
        .attr('y1', d => this.scales.stem(d))
        .attr('y2', d => this.scales.stem(d));

    // yAxisG
    //   .call(yAxis);

    const xAxisG = axes
      .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${this.opt.plot.margin.left}, ${this.opt.plot.height})`)
      .selectAll('g')
        .data(this.data.tree.filter(d => d.depth === 2))
        .enter()
      .append('g')
        .attr('class', 'group-label-g')
        .attr('transform', d => `translate(${d.x}, 0)`);

    xAxisG
      .append('text')
        .text(d => d.data.name);
  }

  drawPlants() {
    this.drawLeaves();
    // this.drawLabels();
    this.drawStems();
  }

  drawLeaves() {

    d3.select('#plot')
      .append('g')
        .attr('class', 'lipid-leaves-g')
      .selectAll('g')
        .data(this.data.tree.filter(d => d.depth === 3))
        .enter()
      .append('path')
        .attr('class', 'lipid-leaf')
        .attr('d', d => d.data.lipidLeaf.getPath())
        .attr('transform', d => (
          `translate(${d.x-(d.data.lipidLeaf.getWidth()/2)}, ${this.scales.stem(d.data.protein)+(d.data.lipidLeaf.getHeight()*3)})
          rotate(180, ${d.data.lipidLeaf.getWidth()/2}, ${0})`
        ))
        .attr('fill', d => this.scales.lipidColor(d.data.saturatedAcidPct));


    d3.select('#plot')
      .append('g')
        .attr('class', 'carb-leaves-g')
      .selectAll('g')
        .data(this.data.tree.filter(d => d.depth === 3))
        .enter()
      .append('path')
        .attr('class', 'carb-leaf')
        .attr('d', d => d.data.carbohydrateLeaf.getPath())
        .attr('transform', d => (
          `translate(${d.x-(d.data.carbohydrateLeaf.getWidth()/2)}, ${this.scales.stem(d.data.protein)+(d.data.carbohydrateLeaf.getHeight()*3)})
          rotate(180, ${d.data.carbohydrateLeaf.getWidth()/2}, ${0})`
        ));


  }

  drawLabels() {
    d3.select('#plot')
      .append('g')
        .attr('class', 'labels-g')
      .selectAll('g')
        .data(this.data.tree.filter(d => d.depth === 3))
        .enter()
      .append('g')
        .attr('class', 'node label')
        .attr('transform', d => `translate(${d.x}, ${this.scales.stem(d.data.protein)})`)
      .append('g')
        .attr('class', 'label-g')
      .append('text')
        .each(function(d) {
          const node = d3.select(this);

          node
            .append('tspan')
              .text(d.data.name)
              .attr('class', 'leaf-name');

          if (d.data.name2) {
          node
            .append('tspan')
              .text(d.data.name2)
              .attr('class', 'leaf-subname')
              .attr('dx', 4)
          }

          node
            .append('tspan')
              .text(Math.round(d.data.protein))
              .attr('class', 'leaf-data protein')
              .attr('dx', 6);

          node
            .append('tspan')
              .text(Math.round(d.data.carbohydrate))
              .attr('class', 'leaf-data carbohydrate')
              .attr('dx', 6);

          node
            .append('tspan')
              .text(Math.round(d.data.lipid))
              .attr('class', 'leaf-data lipid')
              .attr('dx', 6);
        })
  }

  drawStems() {
    // ----- Stem
    d3.select('#plot')
      .append('g')
        .attr('class', 'stems-g')
      .selectAll('path')
        .data(this.data.tree.filter(d => (d.depth == 3 && d.parent)))
        .enter()
      .insert('path', 'g')
        .attr('d', d => {
          const stemHeight = this.scales.stem(d.data.protein) + (d.data.carbohydrateLeaf.getHeight()*3)
          return (
            "M" + d.x + "," + (stemHeight) +
            "C" + d.x + "," + (stemHeight + (d.parent.y - stemHeight) * d.data.cMax) +
            " " + d.parent.x + "," + (stemHeight + (d.parent.y - stemHeight) * d.data.cMin) +
            " " + d.parent.x + "," + d.parent.y
            )
        });
  }


}