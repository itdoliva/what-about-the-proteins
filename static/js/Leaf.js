class Leaf {
  constructor(area) {
    this.area = area
    this.height = Math.sqrt((3/5)*area)
    this.width = (5/3) * this.height
  }

  getPath() {
    return (
      "M" + (this.width/2) + "," + (this.height*3) +        // top
      "L" + (0)            + "," + (this.height) +          // left
      "L" + (this.width/2) + "," + (0) +                    // bottom
      "L" + (this.width/2) + "," + (this.height) +          // middle
      "L" + (this.width/2) + "," + (0) +                    // bottom
      "L" + (this.width)   + "," + (this.height) +          // right
      "L" + (this.width/2) + "," + (this.height*3) + "Z"    // top
    );
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }
  
}