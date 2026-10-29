"use client";

import { useEffect, useRef, useState } from "react";
import type { Caixa } from "@engine/architectures/types";

interface Props {
  largura: number;
  profundidade: number;
  peDireito: number;
  profundidadePalco: number;
  caixas: Caixa[];
  publico: number;
  microfone?: { x: number; y: number; z: number } | null;
  mesa?: { x: number; y: number } | null;
}

/**
 * Visualização 3D simples (ilustrativa) da sala, do palco e das caixas.
 * Usa as mesmas posições, alturas e direções da planta. Não aumenta a precisão do cálculo.
 */
export function Vista3D({ largura: W, profundidade: D, peDireito: H, profundidadePalco: P, caixas, publico, microfone, mesa }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [cones, setCones] = useState(true);
  const mostrarCones = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    let vivo = true;
    let limpar = () => {};
    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const el = ref.current;
        if (!el || !vivo) return;
        const largura = el.clientWidth;
        const altura = Math.min(520, Math.max(320, Math.round(largura * 0.62)));
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(largura, altura);
        renderer.shadowMap.enabled = true;
        el.innerHTML = "";
        el.appendChild(renderer.domElement);
        const cena = new THREE.Scene();
        cena.background = new THREE.Color("#eef2f7");
        const cam = new THREE.PerspectiveCamera(45, largura / altura, 0.1, 500);
        // Mesma orientação da planta: palco ao fundo da tela, x espelhado.
        const X = (x: number) => W / 2 - x;
        const Z = (y: number) => y - D / 2;
        // Câmera no meio do público, um pouco acima, olhando para o palco.
        const distCam = Math.min(11, Math.max(6, (D - P) * 0.55));
        cam.position.set(W * 0.25, Math.min(Math.max(H * 0.9, 3.5), 6), Z(P + distCam));
        const ctr = new OrbitControls(cam, renderer.domElement);
        ctr.target.set(0, 1.3, Z(Math.max(0.5, P * 0.6)));
        ctr.enableDamping = true;
        ctr.maxPolarAngle = Math.PI * 0.49;
        cena.add(new THREE.HemisphereLight("#ffffff", "#9aa6b8", 1.5));
        const sol = new THREE.DirectionalLight("#ffffff", 1.6);
        sol.position.set(W, H * 3, D);
        sol.castShadow = true;
        cena.add(sol);

        const mat = (cor: string, op = 1) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.7, metalness: 0.05, transparent: op < 1, opacity: op });
        // Piso, área de público e palco
        const piso = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat("#dfe4ec"));
        piso.rotation.x = -Math.PI / 2;
        piso.receiveShadow = true;
        cena.add(piso);
        const pub = new THREE.Mesh(new THREE.PlaneGeometry(W, D - P), mat("#cfe7e4"));
        pub.rotation.x = -Math.PI / 2;
        pub.position.set(0, 0.005, Z(P + (D - P) / 2));
        cena.add(pub);
        const palco = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, P), mat("#b9c2d0"));
        palco.position.set(0, 0.15, Z(P / 2));
        palco.receiveShadow = true;
        cena.add(palco);
        // Paredes (só as arestas) e parede do palco
        const sala = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)), new THREE.LineBasicMaterial({ color: "#7d8798" }));
        sala.position.set(0, H / 2, 0);
        cena.add(sala);
        const fundoPalco = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat("#e8ecf2", 0.9));
        fundoPalco.position.set(0, H / 2, Z(0) + 0.01);
        cena.add(fundoPalco);

        // Público (ilustrativo): até o número informado, em fileiras de 1 m
        const fileiras: { x: number; y: number }[] = [];
        for (let y = P + 1; y < D - 0.4 && fileiras.length < publico; y += 1.0)
          for (let x = 0.7; x < W - 0.5 && fileiras.length < publico; x += 0.6) fileiras.push({ x, y });
        if (fileiras.length > 0) {
          const g = new THREE.CapsuleGeometry(0.13, 0.35, 2, 6);
          const inst = new THREE.InstancedMesh(g, mat("#8f9bb0"), fileiras.length);
          const m4 = new THREE.Matrix4();
          fileiras.forEach((f, i) => {
            m4.makeTranslation(X(f.x), 0.32, Z(f.y));
            inst.setMatrixAt(i, m4);
          });
          cena.add(inst);
        }

        const etiqueta = (texto: string, cor: string) => {
          const c = document.createElement("canvas");
          c.width = 128;
          c.height = 128;
          const g = c.getContext("2d")!;
          g.fillStyle = cor;
          g.beginPath();
          g.arc(64, 64, 56, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ffffff";
          g.font = "bold 64px system-ui, sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText(texto, 64, 68);
          const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
          s.scale.set(0.45, 0.45, 0.45);
          return s;
        };

        const cones: { visible: boolean }[] = [];
        mostrarCones.current = (v: boolean) => {
          for (const c of cones) c.visible = v;
        };
        const ALTURA_PALCO = 0.3; // só visual: itens dentro da área do palco ficam sobre o tablado
        const elev = (y: number) => (y < P ? ALTURA_PALCO : 0);
        for (const cx of caixas) {
          const g = new THREE.Group();
          const coluna = cx.fonte.subcategoria === "coluna" || cx.fonte.subcategoria === "line_array_compacto";
          const px = X(cx.posicao.x);
          const pz = Z(cx.posicao.y);
          const corCaixa = cx.papel === "reforco" ? "#3a4a63" : "#1d2738";
          if (cx.papel === "sub") {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.6), mat("#151c28"));
            b.position.set(px, 0.33 + elev(cx.posicao.y), pz);
            b.castShadow = true;
            cena.add(b);
            const e = etiqueta(String(cx.numero), "#334155");
            e.position.set(px, 0.95 + elev(cx.posicao.y), pz);
            cena.add(e);
            continue;
          }
          let alturaCaixa = Math.max(0.3, cx.fonte.meiaAltura * 2 || 0.55);
          let larguraCaixa = alturaCaixa * 0.6;
          if (coluna) {
            alturaCaixa = cx.fonte.alturaTotal ?? Math.max(1.6, cx.posicao.z * 1.3);
            larguraCaixa = 0.32;
          }
          const corpo = new THREE.Mesh(new THREE.BoxGeometry(larguraCaixa, alturaCaixa, larguraCaixa * 0.9), mat(corCaixa));
          corpo.castShadow = true;
          g.add(corpo);
          // Frente da caixa (+Z do grupo): cone do alto-falante
          const frente = new THREE.Mesh(new THREE.CircleGeometry(larguraCaixa * 0.32, 24), mat("#0e9f9a"));
          frente.position.set(0, coluna ? -alturaCaixa * 0.3 : -alturaCaixa * 0.12, (larguraCaixa * 0.9) / 2 + 0.002);
          g.add(frente);
          const yCentro = (coluna ? alturaCaixa / 2 : cx.posicao.z) + elev(cx.posicao.y);
          g.position.set(px, yCentro, pz);
          const yaw = (cx.mira.yaw * Math.PI) / 180;
          const pitch = (cx.mira.pitch * Math.PI) / 180;
          const dir = new THREE.Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
          g.lookAt(g.position.clone().add(dir));
          cena.add(g);
          // Pedestal ou suporte
          if (cx.montagem === "pedestal" && !coluna) {
            const chao = elev(cx.posicao.y);
            const base = yCentro - alturaCaixa / 2 - chao;
            const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, base, 8), mat("#3b4352"));
            haste.position.set(px, chao + base / 2, pz);
            cena.add(haste);
            const tripe = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.25, 3, 1, true), mat("#3b4352"));
            tripe.position.set(px, 0.13 + chao, pz);
            cena.add(tripe);
          }
          // Área que a caixa alcança bem (cone translúcido, ilustrativo)
          const alcance = Math.min(6, (D - P) * 0.45);
          const raio = Math.tan(((Math.min(cx.fonte.cobertura.H, 100) / 2) * Math.PI) / 180) * alcance;
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(Math.min(raio, alcance * 0.9), alcance, 32, 1, true),
            new THREE.MeshBasicMaterial({ color: "#0e9f9a", transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }),
          );
          cone.rotation.x = -Math.PI / 2;
          cone.position.set(0, 0, alcance / 2);
          const gc = new THREE.Group();
          gc.add(cone);
          gc.position.copy(g.position);
          gc.lookAt(g.position.clone().add(dir));
          cena.add(gc);
          cones.push(gc);
          const e = etiqueta(String(cx.numero), cx.papel === "reforco" ? "#3a4a63" : "#0e7c78");
          e.position.set(px, yCentro + alturaCaixa / 2 + 0.35, pz);
          cena.add(e);
        }
        if (microfone) {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, microfone.z, 8), mat("#3b4352"));
          m.position.set(X(microfone.x), microfone.z / 2 + 0.3, Z(microfone.y));
          cena.add(m);
          const cab = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat("#111827"));
          cab.position.set(X(microfone.x), microfone.z + 0.32, Z(microfone.y));
          cena.add(cab);
        }
        if (mesa) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.7), mat("#334155"));
          m.position.set(X(mesa.x), 0.45, Z(mesa.y));
          cena.add(m);
        }
        let raf = 0;
        const loop = () => {
          ctr.update();
          renderer.render(cena, cam);
          raf = requestAnimationFrame(loop);
        };
        loop();
        const redim = () => {
          const w = el.clientWidth;
          const h = Math.min(520, Math.max(320, Math.round(w * 0.62)));
          renderer.setSize(w, h);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        };
        window.addEventListener("resize", redim);
        limpar = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", redim);
          ctr.dispose();
          renderer.dispose();
          cena.traverse((o) => {
            const m = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } };
            m.geometry?.dispose();
            m.material?.dispose();
          });
        };
      } catch (e) {
        if (vivo) setErro(e instanceof Error ? e.message : "Não foi possível abrir a visualização 3D neste aparelho.");
      }
    })();
    return () => {
      vivo = false;
      limpar();
    };
  }, [W, D, H, P, caixas, publico, microfone, mesa]);

  useEffect(() => {
    mostrarCones.current?.(cones);
  }, [cones]);

  return (
    <div className="vista3d" data-testid="vista-3d">
      {erro ? <div className="aviso">Não foi possível abrir a visualização 3D neste aparelho ({erro}).</div> : null}
      <div ref={ref} className="vista3d-canvas" />
      <div className="vista3d-barra">
        <span className="ajuda">Arraste para girar, use dois dedos ou a roda do mouse para aproximar.</span>
        <label className="chk">
          <input type="checkbox" checked={cones} onChange={(e) => setCones(e.target.checked)} /> Mostrar para onde cada caixa aponta
        </label>
      </div>
      <p className="ajuda">Visualização ilustrativa, com as mesmas posições, alturas e direções da planta. O desenho 3D não deixa o cálculo mais preciso.</p>
    </div>
  );
}
