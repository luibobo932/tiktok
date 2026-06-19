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
}

// ── World positions ──────────────────────────────────────────────────────────

export const WAYPOINTS = {
  meeting: new THREE.Vector3(-5.5, 0, -4),
  coffee: new THREE.Vector3(6.5, 0, 4.5),
  // Row 1 (z=3)
  tuan_desk: new THREE.Vector3(-6.5, 0, 3.5),
  huong_desk: new THREE.Vector3(-2.5, 0, 3.5),
  linh_desk: new THREE.Vector3(1.5, 0, 3.5),
  luan_desk: new THREE.Vector3(5, 0, 3.5),
  huy_desk: new THREE.Vector3(-9.5, 0, 3.5),
  // Row 2 (z=0)
  duc_desk: new THREE.Vector3(-4.5, 0, 0.5),
  mai_desk: new THREE.Vector3(0, 0, 0.5),
  tri_desk: new THREE.Vector3(-7.5, 0, 0.5),
  khoa_desk: new THREE.Vector3(3.5, 0, 0.5),
  thanhduy_desk: new THREE.Vector3(7.5, 0, 0.5),
}

// ── Personas (Nhóm Bom Tấn — Sài Gòn King Land) ─────────────────────────────

export const PERSONAS: PersonaData[] = [
  // ── Hàng 1 (z=3) ──
  {
    id: 'huy',
    name: 'Hoàng Minh Huy',
    role: 'Chuyên viên KD',
    color: '#8B5CF6',
    deskPosition: [-9.5, 0.8, 3],
    seatPosition: [-9.5, 0, 3.5],
  },
  {
    id: 'tuan',
    name: 'Trịnh Tam Công',
    role: 'Chuyên viên KD (top DS)',
    color: '#3B82F6',
    deskPosition: [-6.5, 0.8, 3],
    seatPosition: [-6.5, 0, 3.5],
  },
  {
    id: 'huong',
    name: 'Nguyễn Tuấn Dũng',
    role: 'Chuyên viên KD',
    color: '#10B981',
    deskPosition: [-2.5, 0.8, 3],
    seatPosition: [-2.5, 0, 3.5],
  },
  {
    id: 'linh',
    name: 'Đinh Công Thường',
    role: 'Chuyên viên KD (mới)',
    color: '#F59E0B',
    deskPosition: [1.5, 0.8, 3],
    seatPosition: [1.5, 0, 3.5],
  },
  {
    id: 'luan',
    name: 'Lê Minh Luân',
    role: 'Chuyên viên KD',
    color: '#EF4444',
    deskPosition: [5, 0.8, 3],
    seatPosition: [5, 0, 3.5],
  },
  // ── Hàng 2 (z=0) ──
  {
    id: 'tri',
    name: 'Lê Huỳnh Trí',
    role: 'Chuyên viên KD',
    color: '#06B6D4',
    deskPosition: [-7.5, 0.8, 0],
    seatPosition: [-7.5, 0, 0.5],
  },
  {
    id: 'duc',
    name: 'Trần Đăng Duy',
    role: 'Trưởng nhóm Bom Tấn',
    color: '#6366F1',
    deskPosition: [-4.5, 0.8, 0],
    seatPosition: [-4.5, 0, 0.5],
  },
  {
    id: 'mai',
    name: 'Lâm Quốc Thắng',
    role: 'Chuyên viên KD',
    color: '#EC4899',
    deskPosition: [0, 0.8, 0],
    seatPosition: [0, 0, 0.5],
  },
  {
    id: 'khoa',
    name: 'Phạm Đỗ Hoàng Khoa',
    role: 'Chuyên viên KD',
    color: '#F97316',
    deskPosition: [3.5, 0.8, 0],
    seatPosition: [3.5, 0, 0.5],
  },
  {
    id: 'thanhduy',
    name: 'Nguyễn Thanh Duy',
    role: 'Chuyên viên KD',
    color: '#84CC16',
    deskPosition: [7.5, 0.8, 0],
    seatPosition: [7.5, 0, 0.5],
  },
]
