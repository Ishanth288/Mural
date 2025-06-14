import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  
  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) {
      return;
    }
    
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS gradient');
      return;
    }
    
    glRef.current = gl;
    
    // Vertex shader source
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;
    
    // Fragment shader source with optimized performance
    const fsSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;

      const float overallSpeed = 0.2;
      const float gridSmoothWidth = 0.015;
      const float axisWidth = 0.05;
      const float majorLineWidth = 0.025;
      const float minorLineWidth = 0.0125;
      const float majorLineFrequency = 5.0;
      const float minorLineFrequency = 1.0;
      const vec4 gridColor = vec4(0.5);
      const float scale = 5.0;
      const vec4 lineColor = vec4(0.4, 0.2, 0.8, 1.0);
      const float minLineWidth = 0.01;
      const float maxLineWidth = 0.2;
      const float lineSpeed = 1.0 * overallSpeed;
      const float lineAmplitude = 1.0;
      const float lineFrequency = 0.2;
      const float warpSpeed = 0.2 * overallSpeed;
      const float warpFrequency = 0.5;
      const float warpAmplitude = 1.0;
      const float offsetFrequency = 0.5;
      const float offsetSpeed = 1.33 * overallSpeed;
      const float minOffsetSpread = 0.6;
      const float maxOffsetSpread = 2.0;
      const int linesPerGroup = 16;

      #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
      #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
      #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
      #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

      float drawGridLines(float axis) {
        return drawCrispLine(0.0, axisWidth, axis)
              + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
              + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
      }

      float drawGrid(vec2 space) {
        return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
      }

      float random(float t) {
        return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
      }

      float getPlasmaY(float x, float horizontalFade, float offset) {
        return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec4 fragColor;
        vec2 uv = fragCoord.xy / iResolution.xy;
        vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

        float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
        float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

        space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
        space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

        vec4 lines = vec4(0.0);
        vec4 bgColor1 = vec4(0.1, 0.1, 0.3, 1.0);
        vec4 bgColor2 = vec4(0.3, 0.1, 0.5, 1.0);

        for(int l = 0; l < linesPerGroup; l++) {
          float normalizedLineIndex = float(l) / float(linesPerGroup);
          float offsetTime = iTime * offsetSpeed;
          float offsetPosition = float(l) + space.x * offsetFrequency;
          float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
          float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
          float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
          float linePosition = getPlasmaY(space.x, horizontalFade, offset);
          float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

          float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
          vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
          float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

          line = line + circle;
          lines += line * lineColor * rand;
        }

        fragColor = mix(bgColor1, bgColor2, uv.x);
        fragColor *= verticalFade;
        fragColor.a = 1.0;
        fragColor += lines;

        gl_FragColor = fragColor;
      }
    `;
    
    const loadShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const initShaderProgram = (gl: WebGLRenderingContext, vsSource: string, fsSource: string) => {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

      if (!vertexShader || !fragmentShader) return null;

      const shaderProgram = gl.createProgram();
      if (!shaderProgram) return null;
      
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Shader program link error: ', gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    };

    try {
      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      if (!shaderProgram) return;
      
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = [
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
          time: gl.getUniformLocation(shaderProgram, 'iTime'),
        },
      };

      const resizeCanvas = () => {
        if (typeof window !== 'undefined' && canvas) {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
          
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
      }

      let startTime = Date.now();
      
      const render = () => {
        if (!glRef.current) return;
        
        const currentTime = (Date.now() - startTime) / 1000;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
        gl.uniform1f(programInfo.uniformLocations.time, currentTime);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          2,
          gl.FLOAT,
          false,
          0,
          0
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationRef.current = requestAnimationFrame(render);
      };

      animationRef.current = requestAnimationFrame(render);

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', resizeCanvas);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        glRef.current = null;
      };
    } catch (error) {
      console.warn('WebGL shader failed, using fallback:', error);
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <canvas 
          ref={canvasRef as any}
          style={styles.canvas}
        />
        {/* Fallback gradient */}
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={[styles.fallback, { opacity: glRef.current ? 0 : 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    );
  }

  // Mobile fallback
  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ShaderBackground;