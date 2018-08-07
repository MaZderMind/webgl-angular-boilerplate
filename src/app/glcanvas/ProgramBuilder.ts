export class ProgramBuilder {
  private static readonly FRAGMENT_SHADER_PREAMBLE =
    '#ifdef GL_ES\n' +
    'precision highp float;\n' +
    '#endif' +
    '\n\n';

  constructor(private gl: WebGLRenderingContext) {
  }

  static createProgramForContext(gl: WebGLRenderingContext, vertex: string, fragment: string): WebGLProgram {
    const bulder = new ProgramBuilder(gl);
    return bulder.createProgram(vertex, fragment);
  }

  createProgram(vertex: string, fragment: string): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram();

    const vs = this.createShader(vertex, gl.VERTEX_SHADER);
    const fs = this.createShader(ProgramBuilder.FRAGMENT_SHADER_PREAMBLE + fragment, gl.FRAGMENT_SHADER);

    if (vs == null || fs == null) {
      throw new Error('Shader-Creation failed');
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

      throw new Error('ERROR:\n' +
        'VALIDATE_STATUS: ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n' +
        'ERROR: ' + gl.getError() + '\n\n' +
        '- Vertex Shader -\n' + vertex + '\n\n' +
        '- Fragment Shader -\n' + fragment);

    }

    return program;
  }

  private createShader(src: string, type: number): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

      throw new Error(
        (type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT') +
        ' SHADER:\n' + gl.getShaderInfoLog(shader));
    }

    return shader;
  }
}
