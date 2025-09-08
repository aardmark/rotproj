const WIDTH = 1200;
const HEIGHT = 800;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const points3d = [];
let canvas;
let ctx;
let angle = 0;
let use_distance = false;
let distance = 3;
let distance_direction = 0;
let show_coords = true;

function init() {
  canvas = document.getElementById("canvas");
  if (!canvas) throw new Error("No canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No ctx");
  ctx.lineWidth = 2;
  ctx.font = "16px serif";

  points3d[0] = new Vec3(-1, 1, -1);
  points3d[1] = new Vec3(1, 1, -1);
  points3d[2] = new Vec3(1, -1, -1);
  points3d[3] = new Vec3(-1, -1, -1);
  points3d[4] = new Vec3(-1, 1, 1);
  points3d[5] = new Vec3(1, 1, 1);
  points3d[6] = new Vec3(1, -1, 1);
  points3d[7] = new Vec3(-1, -1, 1);
  window.requestAnimationFrame(draw);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // naming is bad, this rotates *around* the axis
  const rotation_z = [
    [Math.cos(angle), -(Math.sin(angle)), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1]
  ];

  const rotation_x = [
    [1, 0, 0],
    [0, Math.cos(angle), -(Math.sin(angle))],
    [0, Math.sin(angle), Math.cos(angle)],
  ];

  const rotation_y = [
    [Math.cos(angle), 0, -(Math.sin(angle))],
    [0, 1, 0],
    [Math.sin(angle), 0, Math.cos(angle)],
  ];

  const points2d = [];
  for (let ix = 0; ix < points3d.length; ix++) {
    let rotated = points3d[ix].rotate(rotation_z).rotate(rotation_y).rotate(rotation_x);
    points2d[ix] = to_point2d(rotated);
    ctx.beginPath();
    ctx.arc(points2d[ix].x, points2d[ix].y, 1, 0, 2 * Math.PI);
    ctx.fill();
    if (show_coords) {
      ctx.fillText(`(${Math.trunc(points2d[ix].x)}, ${Math.trunc(points2d[ix].y)})`, points2d[ix].x + 10, points2d[ix].y - 10);
    }

  }

  join_the_dots(points2d);

  angle += 0.01;

  if (use_distance) {
    if (distance_direction) {
      distance += 0.1;
      if (distance >= 30) {
        distance_direction = 0;
      }
    } else {
      distance -= 0.1;
      if (distance <= 2) {
        distance_direction = 1;
      }
    }
  }

  window.requestAnimationFrame(draw);
}

function to_point2d(point3d) {
  let z = 1 / (distance - point3d.z);
  const projection = [
    [z, 0, 0],
    [0, z, 0],
  ];

  const point = [
    [point3d.x],
    [point3d.y],
    [point3d.z]
  ];
  const multiplied = matmul(projection, point);
  return new Vec2((multiplied[0][0] * 200) + CENTER_X, (multiplied[1][0] * 200) + CENTER_Y);
}

function matmul(matrix, point) {
  if (matrix[0].length !== point.length) {
    throw new Error("matrix columns must equal point rows")
  }

  const ret = [];

  for (var i = 0; i < matrix.length; i++) {
    ret[i] = [0];
    for (var j = 0; j < point.length; j++) {
      ret[i][0] += matrix[i][j] * point[j][0];
    }
  }

  return ret;
}

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  mult(factor) {
    this.x *= factor;
    this.y *= factor;
  }
}

class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  rotate(matrix) {
    const point = [
      [this.x],
      [this.y],
      [this.z]
    ];

    const multiplied = matmul(matrix, point);
    return new Vec3(multiplied[0][0], multiplied[1][0], multiplied[2][0]);
  }
}

function join_the_dots(vecs2) {
  ctx.beginPath();
  ctx.moveTo(vecs2[0].x, vecs2[0].y);
  ctx.lineTo(vecs2[1].x, vecs2[1].y);
  ctx.lineTo(vecs2[2].x, vecs2[2].y);
  ctx.lineTo(vecs2[3].x, vecs2[3].y);
  ctx.lineTo(vecs2[0].x, vecs2[0].y);
  ctx.lineTo(vecs2[4].x, vecs2[4].y);
  ctx.lineTo(vecs2[5].x, vecs2[5].y);
  ctx.lineTo(vecs2[6].x, vecs2[6].y);
  ctx.lineTo(vecs2[7].x, vecs2[7].y);
  ctx.lineTo(vecs2[4].x, vecs2[4].y);
  ctx.moveTo(vecs2[1].x, vecs2[1].y);
  ctx.lineTo(vecs2[5].x, vecs2[5].y);
  ctx.moveTo(vecs2[2].x, vecs2[2].y);
  ctx.lineTo(vecs2[6].x, vecs2[6].y);
  ctx.moveTo(vecs2[3].x, vecs2[3].y);
  ctx.lineTo(vecs2[7].x, vecs2[7].y);
  ctx.stroke();
  ctx.closePath();
}

window.addEventListener("load", init);

