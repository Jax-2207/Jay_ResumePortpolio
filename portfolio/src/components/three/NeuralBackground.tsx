'use client'
import { useEffect, useRef } from 'react'

interface Node {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  radius: number
}

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const NODE_COUNT = W < 768 ? 25 : 55
    const MAX_DIST = W < 768 ? 120 : 160
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.005,
      radius: Math.random() * 2 + 1,
    }))

    // Data packets traveling along edges
    const packets: { a: number; b: number; t: number; speed: number }[] = []
    for (let i = 0; i < 12; i++) {
      packets.push({
        a: Math.floor(Math.random() * NODE_COUNT),
        b: Math.floor(Math.random() * NODE_COUNT),
        t: Math.random(),
        speed: Math.random() * 0.008 + 0.003,
      })
    }

    let animId: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      // Update nodes
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        n.z += n.vz
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
        if (n.z < 0 || n.z > 1) n.vz *= -1
      })

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0,212,170,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw data packets
      packets.forEach(p => {
        p.t += p.speed
        if (p.t > 1) {
          p.t = 0
          p.a = Math.floor(Math.random() * NODE_COUNT)
          p.b = Math.floor(Math.random() * NODE_COUNT)
        }
        const na = nodes[p.a]
        const nb = nodes[p.b]
        const px = na.x + (nb.x - na.x) * p.t
        const py = na.y + (nb.y - na.y) * p.t
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,212,170,0.7)'
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach(n => {
        const alpha = 0.3 + n.z * 0.4
        const isAI = n.z > 0.7
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * (0.8 + n.z * 0.8), 0, Math.PI * 2)
        ctx.fillStyle = isAI
          ? `rgba(124,58,237,${alpha})`
          : `rgba(0,212,170,${alpha})`
        ctx.fill()

        // Pulse ring on larger nodes
        if (n.z > 0.85) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius * 3 + Math.sin(Date.now() * 0.002 + n.x) * 2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,212,170,0.08)`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }} />
  )
}
