const WIDTH = 1200;
const HEIGHT = 800;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const points3d = [];
let canvas;
let ctx;
let angle = 0;
let distance = 3;
let distance_direction = 0;

function init() {
  canvas = document.getElementById("canvas");
  if (!canvas) throw new Error("No canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No ctx");
  ctx.lineWidth = 2;

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
    let rotated = vec3dmul(points3d[ix], rotation_z);
    rotated = vec3dmul(rotated, rotation_y);
    rotated = vec3dmul(rotated, rotation_x);
    let z = 1 / (distance - rotated.z);
    const projection = [
      [z, 0, 0],
      [0, z, 0],
    ];

    points2d[ix] = to_point2d(rotated, projection);
    points2d[ix].mult(200);
    ctx.beginPath();
    ctx.arc(points2d[ix].x + CENTER_X, points2d[ix].y + CENTER_Y, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(points2d[0].x + CENTER_X, points2d[0].y + CENTER_Y);
  ctx.lineTo(points2d[1].x + CENTER_X, points2d[1].y + CENTER_Y);
  ctx.lineTo(points2d[2].x + CENTER_X, points2d[2].y + CENTER_Y);
  ctx.lineTo(points2d[3].x + CENTER_X, points2d[3].y + CENTER_Y);
  ctx.lineTo(points2d[0].x + CENTER_X, points2d[0].y + CENTER_Y);
  ctx.lineTo(points2d[4].x + CENTER_X, points2d[4].y + CENTER_Y);
  ctx.lineTo(points2d[5].x + CENTER_X, points2d[5].y + CENTER_Y);
  ctx.lineTo(points2d[6].x + CENTER_X, points2d[6].y + CENTER_Y);
  ctx.lineTo(points2d[7].x + CENTER_X, points2d[7].y + CENTER_Y);
  ctx.lineTo(points2d[4].x + CENTER_X, points2d[4].y + CENTER_Y);
  ctx.moveTo(points2d[1].x + CENTER_X, points2d[1].y + CENTER_Y);
  ctx.lineTo(points2d[5].x + CENTER_X, points2d[5].y + CENTER_Y);
  ctx.moveTo(points2d[2].x + CENTER_X, points2d[2].y + CENTER_Y);
  ctx.lineTo(points2d[6].x + CENTER_X, points2d[6].y + CENTER_Y);
  ctx.moveTo(points2d[3].x + CENTER_X, points2d[3].y + CENTER_Y);
  ctx.lineTo(points2d[7].x + CENTER_X, points2d[7].y + CENTER_Y);
  ctx.stroke();
  ctx.closePath();

  angle += 0.03;
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
  window.requestAnimationFrame(draw);
}

function to_point2d(point3d, projection) {
  const point = [
    [point3d.x],
    [point3d.y],
    [point3d.z]
  ];
  const multiplied = matmul(projection, point) || [];
  return new Vec2(multiplied[0][0], multiplied[1][0]);
}

function vec3dmul(vec3d, matrix) {
  const point = [
    [vec3d.x],
    [vec3d.y],
    [vec3d.z]
  ];

  const multiplied = matmul(matrix, point);
  return new Vec3(multiplied[0][0], multiplied[1][0], multiplied[2][0]);
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
}

window.addEventListener("load", init);

