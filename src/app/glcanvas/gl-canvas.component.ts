import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ProgramBuilder} from 'src/app/glcanvas/ProgramBuilder';

const vertexShader = require('ts-shader-loader!../shader/vertex-shader.glsl').default;
const fragmentShader = require('ts-shader-loader!../shader/fragment-shader.glsl').default;
const debug = require('debug')('GlCanvasComponent');

@Component({
  selector: 'app-glcanvas',
  templateUrl: './gl-canvas.component.html',
  styleUrls: ['./gl-canvas.component.css']
})
export class GlCanvasComponent implements OnInit {

  @Output()
  resize = new EventEmitter<[number, number]>();

  @Output()
  paint = new EventEmitter<void>();

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement>;

  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private geometryBuffer: WebGLBuffer;

  private ulResolution: WebGLUniformLocation;
  private ulTime: WebGLUniformLocation;
  private alPosition: number;

  private programParameters = {
    startTime: 0,
    time: 0,
    screenWidth: 0,
    screenHeight: 0
  };

  constructor() {
  }

  ngOnInit() {
    debug('loaded vertexShader:\n' + vertexShader);
    debug('loaded fragmentShader:\n' + fragmentShader);

    const gl = this.gl = this.canvas.nativeElement.getContext('experimental-webgl');
    this.program = ProgramBuilder.createProgramForContext(gl, vertexShader, fragmentShader);

    this.geometryBuffer = this.createFullscreenTriangleBuffer();

    this.ulTime = gl.getUniformLocation(this.program, 'time');
    this.ulResolution = gl.getUniformLocation(this.program, 'resolution');
    this.alPosition = gl.getAttribLocation(this.program, 'position');

    this.programParameters.startTime = new Date().getTime();

    this.animate();
  }

  createFullscreenTriangleBuffer(): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, -1.0, 1.0
    ]), gl.STATIC_DRAW);

    return buffer;
  }

  resizeCanvasIfRequired() {
    const gl = this.gl;
    const canvas = this.canvas.nativeElement;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      debug('resize-event detected', width, height);

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      this.programParameters.screenWidth = width;
      this.programParameters.screenHeight = height;

      gl.viewport(0, 0, width, height);

      this.resize.emit([width, height]);
    }
  }

  private animate() {
    this.resizeCanvasIfRequired();
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  private render() {
    const gl = this.gl;
    this.programParameters.time = new Date().getTime() - this.programParameters.startTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Load program into GPU
    gl.useProgram(this.program);

    // Set values to program variables
    gl.uniform1f(this.ulTime, this.programParameters.time / 1000);
    gl.uniform2f(this.ulResolution, this.programParameters.screenWidth, this.programParameters.screenHeight);

    // Render geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
    gl.vertexAttribPointer(this.alPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.alPosition);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(this.alPosition);

    this.paint.emit();
  }
}
