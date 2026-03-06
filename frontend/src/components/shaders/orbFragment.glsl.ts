export const orbFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  // Fresnel effect — bright edges, transparent center
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

  // Core glow from center
  float core = exp(-length(vPosition) * 1.8) * 0.4;

  // Displacement-based highlights
  float highlight = smoothstep(0.05, 0.25, vDisplacement) * 0.3;

  // Combine
  float alpha = fresnel * (0.4 + uAmplitude * 0.4) + core + highlight;
  alpha = clamp(alpha, 0.0, 0.95);

  // Mix white core with state color at edges
  vec3 coreColor = mix(vec3(1.0), uColor, 0.3);
  vec3 edgeColor = uColor;
  vec3 finalColor = mix(coreColor, edgeColor, fresnel);

  // Subtle shimmer
  float shimmer = sin(vPosition.x * 10.0 + vPosition.y * 10.0 + uTime * 2.0) * 0.03;
  finalColor += shimmer;

  gl_FragColor = vec4(finalColor, alpha);
}
`;
