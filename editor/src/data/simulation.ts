import * as THREE from 'three'

export interface PersonaData {
  id: string
  name: string
  role: string
  color: string
  deskPosition: THREE.Vector3Tuple
  seatPosition: THREE.Vector3Tuple
}

export interface Problem {
  id: string
  timestamp: number
  who: string
  personaName: string
  role: string
  color: string
  message: string
  severity: 'low' | 'medium' | 'high'
  emoji: string
  topicTitle?: string
}

export interface ActionItem {
  id: string
  topicTitle: string
  text: string
}

// ── World positions ──────────────────────────────────────────────────────────

export const WAYPOINTS = {
  meeting: new THREE.Vector3(-5.5, 0, -4),
  coffee: new THREE.Vector3(6.5, 0, 4.5),
  // Row 1 (z=3) — 4 desks
  huy_desk: new THREE.Vector3(-8, 0, 3.5),
  tuan_desk: new THREE.Vector3(-4, 0, 3.5),
  huong_desk: new THREE.Vector3(0, 0, 3.5),
  luan_desk: new THREE.Vector3(4, 0, 3.5),
  // Row 2 (z=0) — 5 desks
  tri_desk: new THREE.Vector3(-8, 0, 0.5),
  duc_desk: new THREE.Vector3(-4, 0, 0.5),
  mai_desk: new THREE.Vector3(0, 0, 0.5),
  khoa_desk: new THREE.Vector3(4, 0, 0.5),
  thanhduy_desk: new THREE.Vector3(8, 0, 0.5),
}

// ── Personas (Nhóm Bom Tấn — Sài Gòn King Land) ─────────────────────────────

export const PERSONAS: PersonaData[] = [
  // ── Hàng 1 (z=3) — 4 người ──
  {
    id: 'huy',
    name: 'Hoàng Minh Huy',
    role: 'CVKD · mạnh pháp lý',
    color: '#8B5CF6',
    deskPosition: [-8, 0.8, 3],
    seatPosition: [-8, 0, 3.5],
  },
  {
    id: 'tuan',
    name: 'Trịnh Tam Công',
    role: 'CVKD · top doanh số',
    color: '#3B82F6',
    deskPosition: [-4, 0.8, 3],
    seatPosition: [-4, 0, 3.5],
  },
  {
    id: 'huong',
    name: 'Nguyễn Tuấn Dũng',
    role: 'King sale SKL',
    color: '#10B981',
    deskPosition: [0, 0.8, 3],
    seatPosition: [0, 0, 3.5],
  },
  {
    id: 'luan',
    name: 'Lê Minh Luân',
    role: 'CVKD · chăm khách',
    color: '#EF4444',
    deskPosition: [4, 0.8, 3],
    seatPosition: [4, 0, 3.5],
  },
  // ── Hàng 2 (z=0) — 5 người ──
  {
    id: 'tri',
    name: 'Lê Huỳnh Trí',
    role: 'CVKD',
    color: '#06B6D4',
    deskPosition: [-8, 0.8, 0],
    seatPosition: [-8, 0, 0.5],
  },
  {
    id: 'duc',
    name: 'Trần Đăng Duy',
    role: 'Trưởng nhóm Bom Tấn',
    color: '#6366F1',
    deskPosition: [-4, 0.8, 0],
    seatPosition: [-4, 0, 0.5],
  },
  {
    id: 'mai',
    name: 'Lâm Quốc Thắng',
    role: 'CVKD',
    color: '#EC4899',
    deskPosition: [0, 0.8, 0],
    seatPosition: [0, 0, 0.5],
  },
  {
    id: 'khoa',
    name: 'Phạm Đỗ Hoàng Khoa',
    role: 'CVKD mới · siêng',
    color: '#F97316',
    deskPosition: [4, 0.8, 0],
    seatPosition: [4, 0, 0.5],
  },
  {
    id: 'thanhduy',
    name: 'Nguyễn Thanh Duy',
    role: 'CVKD · TikTok',
    color: '#84CC16',
    deskPosition: [8, 0.8, 0],
    seatPosition: [8, 0, 0.5],
  },
]
